const persistentAudio = new Audio();
const memoryStore = new Map();
let currentButton = null;
let currentMemoryCard = null;
let currentMemoryData = null;
let persistentThumbMap = null;
let capsuleThumbMap = null;
let capsuleStoryThumbMap = null;
let capsuleLoopThumbMap = null;
let previousCapsuleSection = "map";
let capsuleReturnFocus = null;
let capsuleCarouselResetTimer = null;
let capsuleSignatureRenderId = 0;

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
    interactive: false,
    keyboard: false
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

function renderCapsuleDetailItem(label, value, fullWidth = false) {
  if (!value) {
    return "";
  }

  const itemClass = fullWidth
    ? "capsule-detail-item is-wide"
    : "capsule-detail-item";

  return `
    <div class="${itemClass}">
      <span>${escapeAttribute(label)}</span>
      <strong>${escapeAttribute(value)}</strong>
    </div>
  `;
}

async function renderCapsuleSignatureSound(signatureSound) {
  const renderId = ++capsuleSignatureRenderId;
  const definition = getSignatureSoundDefinition(signatureSound);
  const illustration = document.getElementById("capsule-signature-illustration");
  const icon = capsuleViewSignature.querySelector(".capsule-signature-action-icon");
  const fallback = capsuleViewSignature.querySelector(".capsule-signature-fallback");
  const caption = document.getElementById("capsule-signature-caption");

  capsuleViewSignature.hidden = !definition;
  capsuleViewSignatureValue.textContent = definition?.label || "";
  caption.textContent = definition?.description || "";
  caption.hidden = !definition?.description;

  illustration.onload = null;
  illustration.onerror = null;
  illustration.hidden = true;
  illustration.removeAttribute("src");
  icon.hidden = !definition?.iconUrl;
  icon.style.removeProperty("--signature-icon");
  fallback.hidden = Boolean(definition?.iconUrl);

  if (!definition) {
    return;
  }

  if (definition.iconUrl) {
    icon.style.setProperty(
      "--signature-icon",
      `url('${definition.iconUrl.replace(/'/g, "%27")}')`
    );
  }

  async function showIconFallback() {
    const available = definition.iconUrl &&
      await canLoadSignatureSoundImage(definition.iconUrl);

    if (renderId !== capsuleSignatureRenderId ||
        capsuleView.hidden ||
        !illustration.hidden) {
      return;
    }

    icon.hidden = !available;
    fallback.hidden = Boolean(available);
  }

  showIconFallback();

  const visual = await resolveSignatureSoundVisual(signatureSound);

  if (renderId !== capsuleSignatureRenderId ||
      capsuleView.hidden ||
      visual.type !== "illustration") {
    return;
  }

  illustration.onload = function() {
    if (renderId !== capsuleSignatureRenderId || capsuleView.hidden) {
      return;
    }

    illustration.hidden = false;
    icon.hidden = true;
    fallback.hidden = true;
  };

  illustration.onerror = function() {
    if (renderId !== capsuleSignatureRenderId || capsuleView.hidden) {
      return;
    }

    illustration.onerror = null;
    illustration.hidden = true;
    illustration.removeAttribute("src");
    showIconFallback();
  };

  illustration.src = visual.src;
}

function updateCapsuleViewContent(currentMemoryData) {
  if (!currentMemoryData) {
    return;
  }

  window.clearTimeout(capsuleCarouselResetTimer);
  capsuleCarouselResetTimer = null;

  const capsuleRegion = document.getElementById("capsule-view-region");
  const capsuleIntro = document.getElementById("capsule-view-intro");
  const capsuleDuration = document.getElementById("capsule-view-duration");
  const capsuleType = document.getElementById("capsule-view-type");
  const region = currentMemoryData.cityCountry || [
    currentMemoryData.city || currentMemoryData.town,
    currentMemoryData.country
  ].filter(Boolean).join(", ");
  const intro = (currentMemoryData.intro || "").trim();

  capsuleViewBack.textContent = "← Back";
  capsuleViewTitle.textContent = currentMemoryData.title;

  capsuleRegion.textContent = region ? `/ ${region}` : "";
  capsuleRegion.hidden = !region;

  capsuleIntro.textContent = intro;
  capsuleIntro.hidden = !intro;

  capsuleViewLocation.textContent =
    currentMemoryData.locationLine || getMemoryLocationLabel(currentMemoryData) || "Sound Capsule";

  capsuleViewDate.textContent = currentMemoryData.recordedDate || "";
  capsuleViewDate.parentElement.hidden = !currentMemoryData.recordedDate;

  capsuleDuration.textContent = currentMemoryData.duration || "";
  capsuleDuration.parentElement.hidden = !currentMemoryData.duration;

  capsuleType.textContent = currentMemoryData.recordingType || "Field recording";

  if (!capsuleView.hidden && capsuleViewMapThumb) {
    capsuleThumbMap = renderPlayerMapThumbnail(
      capsuleViewMapThumb,
      capsuleThumbMap,
      currentMemoryData
    );
  }

  const storyColumn = document.getElementById("capsule-story-column");
  const storySection = document.getElementById("capsule-story");
  const storyTitle = document.getElementById("capsule-story-title");
  const storyBody = document.getElementById("capsule-story-body");
  const story = (currentMemoryData.signatureSound?.story || "").trim();
  const hasPhoto = Boolean(currentMemoryData.image);

  storyTitle.textContent =
    currentMemoryData.storyTitle || currentMemoryData.location || currentMemoryData.title;

  storyBody.replaceChildren();

  for (const text of story.split(/\n\s*\n/).filter(Boolean)) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text.trim();
    storyBody.appendChild(paragraph);
  }

  storySection.hidden = !story;
  storyColumn.hidden = !story && !hasPhoto;

  capsuleVisualCarousel.hidden = !hasPhoto;
  capsuleViewPhotoSlide.hidden = !hasPhoto;
  capsuleViewMapLoopSlide.hidden = !hasPhoto;
  capsuleVisualIndicators.hidden = !hasPhoto;
  capsuleVisualNext.hidden = !hasPhoto;
  capsuleVisualCarousel.classList.toggle("has-multiple-visuals", hasPhoto);
  capsuleVisualCarousel.classList.toggle("is-photo-active", hasPhoto);

  if (hasPhoto) {
    capsuleViewImage.src = currentMemoryData.image;
    capsuleViewImage.alt = `${currentMemoryData.title} location photograph`;

    if (!capsuleView.hidden) {
      capsuleStoryThumbMap = renderPlayerMapThumbnail(
        document.getElementById("capsule-story-map-thumb"),
        capsuleStoryThumbMap,
        currentMemoryData
      );

      capsuleLoopThumbMap = renderPlayerMapThumbnail(
        capsuleViewMapLoopThumb,
        capsuleLoopThumbMap,
        currentMemoryData
      );
    }
  } else {
    capsuleViewImage.removeAttribute("src");
    capsuleViewImage.alt = "";

    if (capsuleStoryThumbMap) {
      capsuleStoryThumbMap.remove();
      capsuleStoryThumbMap = null;
    }

    if (capsuleLoopThumbMap) {
      capsuleLoopThumbMap.remove();
      capsuleLoopThumbMap = null;
    }
  }

  capsuleVisuals.classList.add("is-resetting");
  capsuleVisuals.scrollLeft = hasPhoto ? getCapsuleVisualStep() : 0;

  capsuleVisualIndicators.querySelectorAll("span").forEach(function(bar, index) {
    bar.classList.toggle("is-active", index === (hasPhoto ? 1 : 0));
  });

  requestAnimationFrame(function() {
    capsuleVisuals.classList.remove("is-resetting");
  });

  renderCapsuleSignatureSound(currentMemoryData.signatureSound);

  const capsuleId = createMemoryId(currentMemoryData);
  const collectionNames = exploreCollections
    .filter(function(collection) {
      return getCollectionMemories(collection.id).some(function(memory) {
        return createMemoryId(memory) === capsuleId;
      });
    })
    .map(function(collection) {
      return collection.name;
    });

  const collectionLabel = [...new Set(collectionNames)].join(", ") ||
    currentMemoryData.collectionName || "";

  capsuleViewDetails.innerHTML = [
    renderCapsuleDetailItem("Recorded", currentMemoryData.recordedDate),
    renderCapsuleDetailItem("Duration", currentMemoryData.duration),
    renderCapsuleDetailItem("Collections", collectionLabel),
    renderCapsuleDetailItem(
      "Location",
      currentMemoryData.locationLine || getMemoryLocationLabel(currentMemoryData)
    ),
    renderCapsuleDetailItem(
      "Sounds Captured",
      currentMemoryData.publicTags?.join(" · "),
      true
    )
  ].join("") || `
    <p class="capsule-detail-empty">Technical recording details will appear here.</p>
  `;
}

function openMemoryInCapsuleView(button) {
  const memory = getMemoryFromButton(button);

  if (currentMemoryData) {
    openCapsuleView(memory);
    return;
  }

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

function openCapsuleView(memory = currentMemoryData) {
  if (!memory) {
    nowPlayingText.textContent = "Choose a memory before opening more details.";
    return;
  }

  if (capsuleView.hidden) {
    capsuleReturnFocus = document.activeElement;
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
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth"
  });

  requestAnimationFrame(function() {
    if (!capsuleView.hidden) {
      updateCapsuleViewContent(memory);
      capsuleViewTitle.focus({ preventScroll: true });
    }
  });
}

function closeCapsuleView() {
  const returnFocus = capsuleReturnFocus;
  capsuleReturnFocus = null;

  window.clearTimeout(capsuleCarouselResetTimer);
  capsuleCarouselResetTimer = null;

  capsuleView.hidden = true;
  document.body.classList.remove("has-capsule-view");
  setAppSection(previousCapsuleSection || "map");

  requestAnimationFrame(function() {
    if (!capsuleView.hidden) {
      return;
    }

    if (returnFocus &&
        returnFocus !== document.body &&
        returnFocus.isConnected &&
        returnFocus.getClientRects().length &&
        window.getComputedStyle(returnFocus).visibility !== "hidden") {
      returnFocus.focus();
      return;
    }

    const navButton = document.querySelector(
      `[data-app-section="${previousCapsuleSection}"]`
    );
    const menuButton = document.getElementById("mobile-menu-toggle");
    const target = window.matchMedia("(max-width: 480px)").matches
      ? menuButton
      : navButton;

    target?.focus({ preventScroll: true });
  });
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

function isCurrentRecording(memory) {
  return Boolean(
    currentMemoryData &&
    currentMemoryData.audio === memory.audio &&
    createMemoryId(currentMemoryData) === createMemoryId(memory)
  );
}

function togglePersistentPlayback() {
  const memory = currentMemoryData;

  if (!memory) {
    return;
  }

  if (persistentAudio.paused) {
    persistentAudio.play().then(function() {
      if (currentMemoryData === memory && !persistentAudio.paused) {
        setPersistentPlayingState(true);
        nowPlayingText.textContent = `Now playing: ${memory.title}`;
      }
    }).catch(function(error) {
      if (currentMemoryData === memory && error.name !== "AbortError") {
        setPersistentPlayingState(false);
        nowPlayingText.textContent = `${memory.title} could not be played right now.`;
      }
    });
  } else {
    persistentAudio.pause();
    setPersistentPlayingState(false);
    nowPlayingText.textContent = `Paused: ${memory.title}`;
  }
}

function playMemory(button) {
  playRecording(getMemoryFromButton(button), button);
}

function playRecording(memory, button = null, { startOnly = false } = {}) {
  if (!memory.audio) {
    nowPlayingText.textContent = `${memory.title} does not have audio connected yet.`;
    return;
  }

  const sameRecording = isCurrentRecording(memory);

  if (!sameRecording || (button && button !== currentButton)) {
    resetCardPlayer(currentButton);
    setVisibleCardButtonsInactive(button);
    currentButton = button;
    currentMemoryCard = memory.card || null;
  }

  if (!sameRecording) {
    currentMemoryData = memory;
    showPersistentPlayer(memory);
    persistentAudio.src = memory.audio;
    persistentAudio.load();
    setPersistentPlayingState(false);
    syncPersistentProgress();
  }

  if (!startOnly || persistentAudio.paused) {
    togglePersistentPlayback();
  }
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

    const capsuleMapObserver = new ResizeObserver(function(entries) {
    entries.forEach(function(entry) {
      const mapScale = entry.target.querySelector(".player-map-thumb-scale");
      const mapCanvas = entry.target.querySelector(".player-map-thumb-canvas");

      if (!mapScale || !mapCanvas || !entry.contentRect.width || !entry.contentRect.height) {
        return;
      }

      const scale = Math.max(
        entry.contentRect.width / mapCanvas.offsetWidth,
        entry.contentRect.height / mapCanvas.offsetHeight
      ) * 1.02;

      mapScale.style.setProperty("--thumb-scale", scale);
    });
  });

  capsuleView.querySelectorAll(".player-map-thumb").forEach(function(container) {
    capsuleMapObserver.observe(container);
  });

  persistentPlayerProgress.addEventListener("input", function() {
    if (!Number.isFinite(persistentAudio.duration)) {
      return;
    }

    persistentAudio.currentTime = Number(persistentPlayerProgress.value);
    syncPersistentProgress();
  });

  persistentAudio.addEventListener("loadedmetadata", syncPersistentProgress);
  persistentAudio.addEventListener("timeupdate", syncPersistentProgress);

  if (capsuleVisualNext) {
    capsuleVisualNext.addEventListener("click", function() {
      const slideStep = getCapsuleVisualStep();

      if (!slideStep || !capsuleVisualCarousel.classList.contains("has-multiple-visuals")) {
        return;
      }

      window.clearTimeout(capsuleCarouselResetTimer);
      capsuleCarouselResetTimer = null;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const currentSlide = Math.round(capsuleVisuals.scrollLeft / slideStep);
      const nextSlide = currentSlide >= 1 ? 2 : 1;

      capsuleVisuals.scrollTo({
        left: nextSlide * slideStep,
        behavior: reduceMotion ? "auto" : "smooth"
      });

      if (nextSlide === 2) {
        capsuleCarouselResetTimer = window.setTimeout(function() {
          capsuleCarouselResetTimer = null;
          capsuleVisuals.classList.add("is-resetting");
          capsuleVisuals.scrollLeft = 0;
          capsuleVisualCarousel.classList.remove("is-photo-active");

          const indicatorBars = capsuleVisualIndicators.querySelectorAll("span");

          indicatorBars.forEach(function(bar, index) {
            bar.classList.toggle("is-active", index === 0);
          });

          requestAnimationFrame(function() {
            capsuleVisuals.classList.remove("is-resetting");
          });
        }, reduceMotion ? 0 : 460);
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