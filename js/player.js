const persistentAudio = new Audio();
const memoryStore = new Map();
let currentButton = null;
let currentMemoryCard = null;
let currentMemoryData = null;
let persistentThumbMap = null;
let capsuleThumbMap = null;
let capsuleLoopThumbMap = null;
let previousCapsuleSection = "map";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function renderPlayerMapThumbnail(container, existingMap, memory) {
  if (!container || !memory) {
    return existingMap;
  }

  if (existingMap) {
    existingMap.remove();
  }

  container.innerHTML = "";

  const position = getMemoryPosition(memory);
  const sourceWidth = 560;
  const sourceHeight = 300;
  const containerRect = container.getBoundingClientRect();

  const scale = Math.max(
    containerRect.width / sourceWidth,
    containerRect.height / sourceHeight
  ) * 1.02;

  const mapScale = document.createElement("div");
  mapScale.className = "player-map-thumb-scale";
  mapScale.style.setProperty("--thumb-scale", scale);

  const mapCanvas = document.createElement("div");
  mapCanvas.className = "player-map-thumb-canvas";

  mapScale.appendChild(mapCanvas);
  container.appendChild(mapScale);

  const thumbMap = L.map(mapCanvas, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  }).setView(position, Math.max((memory.mapZoom || 17) - 2, 14));

  L.tileLayer(getCartoBasemapUrl("dark_all"), {
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(thumbMap);

  L.marker(position, {
    icon: createMemoryLeafletIcon(),
    interactive: false
  }).addTo(thumbMap);

  window.setTimeout(function() {
    thumbMap.invalidateSize();
  }, 120);

  return thumbMap;
}

function getCapsuleVisualStep() {
  if (!capsuleVisuals) {
    return 0;
  }

  const styles = window.getComputedStyle(capsuleVisuals);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;

  return capsuleVisuals.clientWidth + gap;
}

function setPlayButtonState(button, isPlaying) {
  if (!button) {
    return;
  }

  const card = button.closest(".memory-card");
  const row = button.closest(".explore-capsule-row");
  const playText = button.querySelector(".play-text");

  button.classList.toggle("is-playing", isPlaying);

  if (playText) {
    playText.textContent = isPlaying ? "Pause" : "Play";
  }

  button.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${button.dataset.title}`);

  if (card) {
    card.classList.toggle("is-playing-card", isPlaying);
  }

  if (row) {
    row.classList.toggle("is-playing-row", isPlaying);
  }
}

function updateProgressFill(progressBar, currentTime, duration) {
  const percent = duration ? (currentTime / duration) * 100 : 0;
  progressBar.style.setProperty("--progress", `${percent}%`);
}

function getMemoryFromButton(button) {
  const card = button.closest(".memory-card");
  const storedMemory = memoryStore.get(button.dataset.memoryId) || {};
  const locationLine = button.dataset.city
    ? `${button.dataset.location} · ${button.dataset.city}`
    : button.dataset.location;

  return {
    ...storedMemory,
    title: button.dataset.title,
    location: button.dataset.location,
    cityCountry: button.dataset.city,
    locationLine: locationLine,
    image: button.dataset.image,
    audio: button.dataset.audio,
    duration: button.dataset.duration || storedMemory.duration || "0:00",
    card: card
  };
}

function resetCardPlayer(button) {
  if (!button || !document.body.contains(button)) {
    return;
  }

  setPlayButtonState(button, false);
}

function syncCardProgress(button) {
  // Phase 3: card progress is handled only by the persistent bottom player.
}

function setVisibleCardButtonsInactive(exceptButton) {
  document.querySelectorAll(".play-button").forEach(function(button) {
    if (button !== exceptButton) {
      setPlayButtonState(button, false);
    }
  });
}

function renderCapsuleDetailItem(label, value) {
  if (!value) {
    return "";
  }

  return `
    <div class="capsule-detail-item">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function updateCapsuleViewContent() {
  if (!currentMemoryData) {
    return;
  }

  capsuleViewBack.textContent = "← Back";
  capsuleViewTitle.textContent = currentMemoryData.title;
  capsuleViewLocation.textContent = currentMemoryData.locationLine || currentMemoryData.location || "Sound Capsule";
  capsuleViewDate.textContent = currentMemoryData.recordedDate
  ? `Recorded ${currentMemoryData.recordedDate}`
  : "";

  if (!capsuleView.hidden && capsuleViewMapThumb) {
    capsuleThumbMap = renderPlayerMapThumbnail(
      capsuleViewMapThumb,
      capsuleThumbMap,
      currentMemoryData
    );
  }

  if (currentMemoryData.image) {
    capsuleViewPhotoSlide.hidden = false;
    capsuleViewMapLoopSlide.hidden = false;

    capsuleViewImage.src = currentMemoryData.image;
    capsuleViewImage.alt = `${currentMemoryData.title} location photograph`;

    capsuleVisualCarousel.classList.add("has-multiple-visuals");
    capsuleVisualIndicators.hidden = false;
    capsuleVisualNext.hidden = false;

    if (!capsuleView.hidden && capsuleViewMapLoopThumb) {
      capsuleLoopThumbMap = renderPlayerMapThumbnail(
        capsuleViewMapLoopThumb,
        capsuleLoopThumbMap,
        currentMemoryData
      );
    }
  } else {
    capsuleViewPhotoSlide.hidden = true;
    capsuleViewMapLoopSlide.hidden = true;

    capsuleViewImage.removeAttribute("src");
    capsuleViewImage.alt = "";

    capsuleVisualCarousel.classList.remove("has-multiple-visuals", "is-photo-active");
    capsuleVisualIndicators.hidden = true;
    capsuleVisualNext.hidden = true;

    if (capsuleLoopThumbMap) {
      capsuleLoopThumbMap.remove();
      capsuleLoopThumbMap = null;
    }
  }

  capsuleVisuals.classList.add("is-resetting");
  capsuleVisuals.scrollLeft = 0;
  capsuleVisualCarousel.classList.remove("is-photo-active");

  requestAnimationFrame(function () {
    capsuleVisuals.classList.remove("is-resetting");
  });

  if (currentMemoryData.signatureSound) {
    const capsuleSignatureIcon = capsuleViewSignature.querySelector(".capsule-signature-action-icon");

    capsuleViewSignature.hidden = false;
    capsuleViewSignature.classList.remove("is-collapsed");
    capsuleViewSignatureValue.textContent = currentMemoryData.signatureSound.label;

    capsuleViewSignatureDescription.textContent =
      currentMemoryData.signatureSound.story ||
      currentMemoryData.signatureSound.description ||
      currentMemoryData.description ||
      "Signature sound story will appear here.";

    if (capsuleViewSignatureToggle) {
      capsuleViewSignatureToggle.setAttribute("aria-expanded", "true");
    }

    if (capsuleSignatureIcon) {
      capsuleSignatureIcon.style.setProperty(
        "--signature-icon",
        getSignatureIconUrl(currentMemoryData.signatureSound.icon)
      );
    }
  } else {
    const capsuleSignatureIcon = capsuleViewSignature.querySelector(".capsule-signature-action-icon");

    capsuleViewSignature.hidden = true;
    capsuleViewSignature.classList.remove("is-collapsed");
    capsuleViewSignatureValue.textContent = "";

    if (capsuleViewSignatureDescription) {
      capsuleViewSignatureDescription.textContent = "";
    }

    if (capsuleViewSignatureToggle) {
      capsuleViewSignatureToggle.setAttribute("aria-expanded", "true");
    }

    if (capsuleSignatureIcon) {
      capsuleSignatureIcon.style.removeProperty("--signature-icon");
    }
  }

  capsuleViewDetails.innerHTML = [
    renderCapsuleDetailItem("Recorded", currentMemoryData.recordedDate),
    renderCapsuleDetailItem("Duration", currentMemoryData.duration),
    renderCapsuleDetailItem("Collection", currentMemoryData.collectionName),
    renderCapsuleDetailItem(
      "Signature Sound",
      currentMemoryData.signatureSound ? currentMemoryData.signatureSound.label : ""
    ),
    renderCapsuleDetailItem(
      "Sounds Captured",
      currentMemoryData.publicTags ? currentMemoryData.publicTags.join(", ") : ""
    )
  ].join("") || `
    <p class="capsule-detail-empty">Technical recording details will appear here.</p>
  `;
}

function openMemoryInCapsuleView(button) {
  const memory = getMemoryFromButton(button);

  resetCardPlayer(currentButton);
  setVisibleCardButtonsInactive(button);

  currentButton = button;
  currentMemoryCard = memory.card;
  currentMemoryData = memory;

  showPersistentPlayer(memory);

  if (memory.audio) {
    persistentAudio.src = memory.audio;
    persistentAudio.load();
    persistentAudio.currentTime = 0;
  } else {
    persistentAudio.removeAttribute("src");
    persistentAudio.load();
    nowPlayingText.textContent = `${memory.title} does not have audio connected yet.`;
  }

  setPersistentPlayingState(false);
  syncPersistentProgress();

  if (memory.audio) {
    nowPlayingText.textContent = `Opened: ${memory.title}`;
  }

  openCapsuleView();
}

function openMemoryInExpandedPlayer(button) {
  openMemoryInCapsuleView(button);
}

function openCapsuleView() {
  if (!currentMemoryData) {
    nowPlayingText.textContent = "Choose a memory before opening more details.";
    return;
  }

  previousCapsuleSection = currentAppSection || previousCapsuleSection || "map";

  homeView.hidden = true;
  mapSection.hidden = true;
  memorySection.hidden = true;
  savedView.hidden = true;
  profileView.hidden = true;
  capsuleView.hidden = false;

  document.body.classList.add("has-capsule-view");

  appContent.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  requestAnimationFrame(function() {
    updateCapsuleViewContent();
  });
}

function closeCapsuleView() {
  capsuleView.hidden = true;
  document.body.classList.remove("has-capsule-view");

  setAppSection(previousCapsuleSection || "map");
}

function showPersistentPlayer(memory) {
  persistentPlayer.hidden = false;
  document.body.classList.add("has-persistent-player");

  persistentPlayerTitle.textContent = memory.title;
  persistentPlayerLocation.textContent = memory.location || "Sound Capsule";
  persistentPlayerDuration.textContent = memory.duration;
  persistentPlayerCurrent.textContent = "0:00";
  persistentPlayerProgress.value = 0;
  updateProgressFill(persistentPlayerProgress, 0, 1);

  persistentPlayerImage.hidden = true;
  persistentPlayerFallback.hidden = true;
  persistentPlayerMapThumb.parentElement.classList.add("has-map");

  persistentThumbMap = renderPlayerMapThumbnail(
    persistentPlayerMapThumb,
    persistentThumbMap,
    memory
  );

  updateCapsuleViewContent();
}

function syncPersistentProgress() {
  const duration = persistentAudio.duration || 0;
  const currentTime = persistentAudio.currentTime || 0;

  persistentPlayerProgress.max = duration || 100;
  persistentPlayerProgress.value = currentTime;
  persistentPlayerCurrent.textContent = formatTime(currentTime);
  persistentPlayerDuration.textContent = formatTime(duration);
  updateProgressFill(persistentPlayerProgress, currentTime, duration);

  syncCardProgress(currentButton);
}

function setPersistentPlayingState(isPlaying) {
  persistentPlayerToggle.classList.toggle("is-playing", isPlaying);
  setPlayButtonState(currentButton, isPlaying);
}

function togglePersistentPlayback() {
  if (!currentMemoryData) {
    return;
  }

  if (persistentAudio.paused) {
    persistentAudio.play().then(function() {
      setPersistentPlayingState(true);
      nowPlayingText.textContent = `Now playing: ${currentMemoryData.title}`;
    }).catch(function() {
      nowPlayingText.textContent = `${currentMemoryData.title} could not be played right now.`;
    });
  } else {
    persistentAudio.pause();
    setPersistentPlayingState(false);
    nowPlayingText.textContent = `Paused: ${currentMemoryData.title}`;
  }
}

function playMemory(button) {
  const memory = getMemoryFromButton(button);

  if (!memory.audio) {
    nowPlayingText.textContent = `${memory.title} does not have audio connected yet.`;
    return;
  }

  if (currentButton === button && currentMemoryData) {
    togglePersistentPlayback();
    return;
  }

  resetCardPlayer(currentButton);
  setVisibleCardButtonsInactive(button);

  currentButton = button;
  currentMemoryCard = memory.card;
  currentMemoryData = memory;

  showPersistentPlayer(memory);

  persistentAudio.src = memory.audio;
  persistentAudio.load();

  persistentAudio.play().then(function() {
    setPersistentPlayingState(true);
    nowPlayingText.textContent = `Now playing: ${memory.title}`;
  }).catch(function() {
    setPersistentPlayingState(false);
    nowPlayingText.textContent = `${memory.title} could not be played right now.`;
  });
}

function openCurrentMemoryCard() {
  if (currentMemoryCard && document.body.contains(currentMemoryCard)) {
    setAppSection("collections");
    currentMemoryCard.classList.add("is-player-target");

    window.setTimeout(function() {
      currentMemoryCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 80);

    window.setTimeout(function() {
      currentMemoryCard.classList.remove("is-player-target");
    }, 1400);

    return;
  }

  if (currentMemoryData) {
    nowPlayingText.textContent = `${currentMemoryData.title} is still playing. Open its collection to view the card.`;
  }
}

function setupPersistentPlayer() {
  persistentPlayerToggle.addEventListener("click", togglePersistentPlayback);

  persistentPlayerOpen.addEventListener("click", function(event) {
    event.stopPropagation();
    openCapsuleView();
  });

  capsuleViewBack.addEventListener("click", closeCapsuleView);

  persistentPlayerProgress.addEventListener("input", function() {
    if (!Number.isFinite(persistentAudio.duration)) {
      return;
    }

    persistentAudio.currentTime = Number(persistentPlayerProgress.value);
    syncPersistentProgress();
  });

  persistentAudio.addEventListener("loadedmetadata", syncPersistentProgress);
  persistentAudio.addEventListener("timeupdate", syncPersistentProgress);

  if (capsuleViewSignatureToggle) {
    capsuleViewSignatureToggle.addEventListener("click", function () {
      const isExpanded = capsuleViewSignatureToggle.getAttribute("aria-expanded") === "true";

      capsuleViewSignatureToggle.setAttribute("aria-expanded", String(!isExpanded));
      capsuleViewSignature.classList.toggle("is-collapsed", isExpanded);
    });
  }

  if (capsuleVisualNext) {
    capsuleVisualNext.addEventListener("click", function () {
      const slideStep = getCapsuleVisualStep();

      if (!slideStep || !capsuleVisualCarousel.classList.contains("has-multiple-visuals")) {
        return;
      }

      const currentSlide = Math.round(capsuleVisuals.scrollLeft / slideStep);
      const nextSlide = currentSlide >= 1 ? 2 : 1;

      capsuleVisuals.scrollTo({
        left: nextSlide * slideStep,
        behavior: "smooth"
      });

      if (nextSlide === 2) {
        window.setTimeout(function () {
          capsuleVisuals.classList.add("is-resetting");
          capsuleVisuals.scrollLeft = 0;
          capsuleVisualCarousel.classList.remove("is-photo-active");

          const indicatorBars = capsuleVisualIndicators.querySelectorAll("span");

          indicatorBars.forEach(function (bar, index) {
            bar.classList.toggle("is-active", index === 0);
          });

          requestAnimationFrame(function () {
            capsuleVisuals.classList.remove("is-resetting");
          });
        }, 460);
      }
    });
  }

  if (capsuleVisuals) {
    capsuleVisuals.addEventListener("scroll", function () {
      const slideStep = getCapsuleVisualStep();

      if (!slideStep) {
        return;
      }

      const currentSlide = Math.round(capsuleVisuals.scrollLeft / slideStep);
      const visibleSlide = currentSlide === 1 ? 1 : 0;
      const indicatorBars = capsuleVisualIndicators.querySelectorAll("span");

      capsuleVisualCarousel.classList.toggle("is-photo-active", visibleSlide === 1);

      indicatorBars.forEach(function (bar, index) {
        bar.classList.toggle("is-active", index === visibleSlide);
      });
    });
  }

  persistentAudio.addEventListener("ended", function() {
    persistentAudio.currentTime = 0;
    syncPersistentProgress();
    setPersistentPlayingState(false);

    if (currentMemoryData) {
      nowPlayingText.textContent = `Finished: ${currentMemoryData.title}`;
    }
  });

  persistentAudio.addEventListener("error", function() {
    setPersistentPlayingState(false);

    if (currentMemoryData) {
      nowPlayingText.textContent = `${currentMemoryData.title} does not have an audio file yet.`;
    }
  });
}

function connectPlayButtons() {
  document.querySelectorAll(".play-button").forEach(function(button) {
    if (button.dataset.playerConnected === "true") {
      return;
    }

    button.dataset.playerConnected = "true";

    button.addEventListener("click", function() {
      playMemory(button);
    });
  });
}