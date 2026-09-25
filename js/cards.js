function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getMemoryPosition(memory) {
  const lat = Number.isFinite(memory.lat) ? memory.lat : memory.latitude;
  const lng = Number.isFinite(memory.lng) ? memory.lng : memory.longitude;

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [lat, lng];
  }

  return realPlaces.dublin.center;
}

function createMemoryLeafletIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div class="memory-location-pin">
        <img src="assets/logo-symbol-transparent.png" alt="" />
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function initializeMemoryCardMap(card, memory) {
  const mapElement = card.querySelector(".memory-card-map");

  if (!mapElement) {
    return;
  }

  const position = getMemoryPosition(memory);

  const cardMap = L.map(mapElement, {
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

  L.tileLayer(getCartoBasemapUrl("dark_nolabels"), {
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(cardMap);

  L.marker(position, {
    icon: createMemoryLeafletIcon(),
    interactive: false
  }).addTo(cardMap);

  setTimeout(function() {
    cardMap.invalidateSize();
  }, 80);
}

function renderExploreCityMap() {
  if (!exploreCityMap || typeof L === "undefined") {
    return;
  }

  if (exploreCityLeafletMap) {
    exploreCityLeafletMap.remove();
    exploreCityLeafletMap = null;
  }

  exploreCityMap.innerHTML = "";

  exploreCityLeafletMap = L.map(exploreCityMap, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false
  }).setView([53.305, -6.455], 12);

  L.tileLayer(getCartoBasemapUrl("dark_nolabels"), {
    subdomains: "abcd",
    maxZoom: 19,
    className: "explore-city-tile"
  }).addTo(exploreCityLeafletMap);

  const desktopExploreCityPins = [
    [53.3570, -6.3945],
    [53.3421, -6.2700],
    [53.3489, -6.2488],
    [53.3368, -6.3510],
    [53.3514, -6.2942]
  ];

  const mobileExploreCityPins = [
    [53.3390, -6.4015],
    [53.3485, -6.3900]
  ];

  const exploreCityPins = window.matchMedia("(max-width: 480px)").matches
    ? mobileExploreCityPins
    : desktopExploreCityPins;

  exploreCityPins.forEach(function(position) {
    L.marker(position, {
      icon: L.divIcon({
        className: "",
        html: '<span class="explore-city-pin"><img src="assets/logo-symbol-transparent.png" alt="" /></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 18]
      }),
      interactive: false
    }).addTo(exploreCityLeafletMap);
  });

  window.setTimeout(function() {
    exploreCityLeafletMap.invalidateSize();
  }, 80);

  window.setTimeout(function() {
    exploreCityLeafletMap.invalidateSize();
  }, 350);
}

function createMemoryId(memory) {
  return `${memory.title}-${memory.audio || memory.location}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function renderTagList(tags) {
  if (!tags || !tags.length) {
    return "<span>None added yet</span>";
  }

  return tags.slice(0, 8).map(function(tag) {
    return `<span>${tag}</span>`;
  }).join("");
}

function getSignatureIconUrl(iconName) {
  const iconUrl = new URL(`assets/icons/signature/${iconName}.svg`, window.location.href);
  return `url('${iconUrl.href}')`;
}

function createMemoryCard(memory) {
  const card = document.createElement("article");
  card.className = "memory-card";

  const memoryId = createMemoryId(memory);
  memoryStore.set(memoryId, memory);
  card.dataset.memoryId = memoryId;

  const publicTags = (memory.publicTags || memory.soundsCaptured || [])
    .slice(0, 5)
    .map(function(tag) {
      return `<li>${tag}</li>`;
    })
    .join("");

  const recordedDateStamp = memory.recordedDate
    ? `<time class="memory-date-stamp">${memory.recordedDate}</time>`
    : "";

  const locationDetail = memory.signatureSound
    ? `
      <div class="signature-sound-badge">
        <span
          class="signature-sound-icon"
          style="--signature-icon: ${getSignatureIconUrl(memory.signatureSound.icon)}"
          aria-hidden="true"
        ></span>

        <span class="signature-sound-label">Signature Sound</span>
        <span class="signature-sound-divider" aria-hidden="true">•</span>
        <span class="signature-sound-value">${memory.signatureSound.label}</span>
      </div>
    `
    : `<p class="memory-exact">Exact recording location</p>`;

  const optionalImage = memory.image
    ? `<img class="memory-detail-image" src="${memory.image}" alt="${memory.title}" />`
    : "";

  card.innerHTML = `
    <div class="memory-flip-area">
      <div class="memory-face memory-face-front">
        <div class="memory-card-map" aria-hidden="true"></div>
        <div class="memory-map-gradient"></div>

        <button class="memory-flip-button" type="button">View Memory</button>
        ${recordedDateStamp}

        <div class="memory-front-content">
          <div class="memory-location-copy">
            <h3>${memory.location || memory.title}</h3>

            <p class="memory-city">
              <span class="memory-city-pin" aria-hidden="true"></span>
              <span>${memory.cityCountry || "Dublin, Ireland"}</span>
            </p>

            ${locationDetail}
          </div>
        </div>
      </div>

      <div class="memory-face memory-face-back">
        <button class="memory-flip-button" type="button">Back to Location</button>

        <div class="memory-back-content">
          ${optionalImage}

          <p class="location">${memory.location}</p>
          <h3>${memory.title}</h3>
          <p>${memory.description}</p>

          <div class="memory-detail-block">
            <span>Sounds captured</span>
            <ul class="sound-list">
              ${publicTags}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="audio-player card-launch-player">
      <button
        class="play-button"
        data-title="${escapeAttribute(memory.title)}"
        data-location="${escapeAttribute(memory.location || "")}"
        data-city="${escapeAttribute(memory.cityCountry || "")}"
        data-image="${escapeAttribute(memory.image || "")}"
        data-audio="${escapeAttribute(memory.audio || "")}"
        data-duration="${escapeAttribute(memory.duration || "0:00")}"
        data-memory-id="${escapeAttribute(memoryId)}"
        aria-label="Play ${escapeAttribute(memory.title)}"
      >
        <span class="play-icon" aria-hidden="true"></span>

        <span class="playing-wave" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>

        <span class="play-text">Play</span>
      </button>
    </div>
  `;

  card.querySelectorAll(".memory-flip-button").forEach(function(button) {
    button.addEventListener("click", function() {
      card.classList.toggle("is-flipped");
    });
  });

  return card;
}

function addCollectionContext(memory, collectionId, collectionName) {
  return {
    ...memory,
    collectionId: collectionId || memory.collectionId || "",
    collectionName: collectionName || memory.collectionName || ""
  };
}

function renderMemoryCards(memories, collectionId, collectionTitle) {
  capsuleGrid.className = "capsule-grid";
  capsuleGrid.innerHTML = "";

  memories.forEach(function(memory) {
    const memoryWithContext = addCollectionContext(memory, collectionId, collectionTitle);
    const card = createMemoryCard(memoryWithContext);

    capsuleGrid.appendChild(card);
    initializeMemoryCardMap(card, memoryWithContext);
  });

  connectPlayButtons();
}

let currentExploreCollectionId = null;

function getCollectionCapsuleCount(collectionId) {
  return (collectionMemories[collectionId] || []).length;
}

function getExploreCollectionById(collectionId) {
  return exploreCollections.find(function(collection) {
    return collection.id === collectionId;
  });
}

function getCollectionSearchText(collection) {
  const memories = collectionMemories[collection.id] || [];
  const memoryText = memories.map(function(memory) {
    return [
      memory.title,
      memory.location,
      memory.cityCountry,
      memory.signatureSound && memory.signatureSound.label,
      ...(memory.publicTags || []),
      ...(memory.hiddenSoundTags || []),
      ...(memory.hiddenMoodTags || [])
    ].filter(Boolean).join(" ");
  }).join(" ");

  return [
    collection.name,
    ...(collection.keywords || []),
    memoryText
  ].join(" ").toLowerCase();
}

function getMemorySearchText(memory) {
  return [
    memory.title,
    memory.location,
    memory.cityCountry,
    memory.signatureSound && memory.signatureSound.label,
    ...(memory.publicTags || []),
    ...(memory.hiddenSoundTags || []),
    ...(memory.hiddenMoodTags || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function createExploreCollectionCard(collection) {
  const card = document.createElement("article");
  const count = getCollectionCapsuleCount(collection.id);

  card.className = "explore-collection-card";
  card.dataset.collectionId = collection.id;
  card.dataset.theme = collection.theme;

  card.innerHTML = `
    <div class="explore-collection-visual" aria-hidden="true">
      ${
        collection.image
          ? `<img src="${escapeAttribute(collection.image)}" alt="" />`
          : ""
      }
    </div>

    <div class="explore-collection-content">
      <h4>${collection.name}</h4>
      <p>${count} ${count === 1 ? "Capsule" : "Capsules"}</p>
    </div>

    <button
      class="explore-collection-play"
      type="button"
      aria-label="Play first capsule in ${escapeAttribute(collection.name)}"
    ></button>
  `;

  card.addEventListener("click", function() {
    renderExploreCollectionList(collection.id);
  });

  card.querySelector(".explore-collection-play").addEventListener("click", function(event) {
    event.stopPropagation();

    const memories = collectionMemories[collection.id] || [];
    const firstPlayableMemory = memories.find(function(memory) {
      return memory.audio;
    });

    if (!firstPlayableMemory) {
      nowPlayingText.textContent = `${collection.name} does not have playable audio yet.`;
      return;
    }

    const memoryWithContext = addCollectionContext(firstPlayableMemory, collection.id, collection.name);
    const memoryId = createMemoryId(memoryWithContext);
    const previewButton = document.createElement("button");

    memoryStore.set(memoryId, memoryWithContext);

    previewButton.dataset.title = memoryWithContext.title;
    previewButton.dataset.location = memoryWithContext.location || "";
    previewButton.dataset.city = memoryWithContext.cityCountry || "";
    previewButton.dataset.image = memoryWithContext.image || "";
    previewButton.dataset.audio = memoryWithContext.audio || "";
    previewButton.dataset.duration = memoryWithContext.duration || "0:00";
    previewButton.dataset.memoryId = memoryId;

    playMemory(previewButton);
  });

  return card;
}

function renderExploreCollections(collections) {
  currentExploreCollectionId = null;
  memorySection.classList.add("is-explore-landing");
  memorySection.classList.remove("is-explore-list");
  memorySection.classList.remove("is-map-collection");

  capsuleGrid.className = "capsule-grid explore-collection-grid";
  capsuleGrid.innerHTML = "";

  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  if (collectionsHeader) {
    collectionsHeader.textContent = "Collections";
  }

  if (!collections.length) {
    capsuleGrid.innerHTML = `
      <div class="explore-empty-state">
        No collections found for this search.
      </div>
    `;
    return;
  }

  collections.forEach(function(collection) {
    capsuleGrid.appendChild(createExploreCollectionCard(collection));
  });
}

function createExplorePlayButton(memory, memoryId) {
  return `
    <button
      class="play-button explore-row-play"
      data-title="${escapeAttribute(memory.title)}"
      data-location="${escapeAttribute(memory.location || "")}"
      data-city="${escapeAttribute(memory.cityCountry || "")}"
      data-image="${escapeAttribute(memory.image || "")}"
      data-audio="${escapeAttribute(memory.audio || "")}"
      data-duration="${escapeAttribute(memory.duration || "0:00")}"
      data-memory-id="${escapeAttribute(memoryId)}"
      aria-label="Play ${escapeAttribute(memory.title)}"
      type="button"
    >
      <span class="play-icon" aria-hidden="true"></span>

      <span class="playing-wave" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </span>

      <span class="play-text">Play</span>
    </button>
  `;
}

function createExploreCapsuleRow(memory) {
  const collection = getExploreCollectionById(currentExploreCollectionId);
  const memoryWithContext = addCollectionContext(
    memory,
    currentExploreCollectionId,
    collection ? collection.name : ""
  );

  const row = document.createElement("article");
  const memoryId = createMemoryId(memoryWithContext);
  const signature = memoryWithContext.signatureSound;
  const signatureMarkup = signature
    ? `
      <span class="explore-row-signature">
        <span
          class="explore-row-signature-icon"
          style="--signature-icon: ${getSignatureIconUrl(signature.icon)}"
          aria-hidden="true"
        ></span>
        <span>${signature.label}</span>
      </span>
    `
    : `<span class="explore-row-signature is-empty">—</span>`;

  memoryStore.set(memoryId, memoryWithContext);

  row.className = "explore-capsule-row";
  row.dataset.memoryId = memoryId;

  row.innerHTML = `
    <button class="explore-row-thumb" type="button" aria-label="Open ${escapeAttribute(memoryWithContext.title)}">
      <span class="explore-row-thumb-map" aria-hidden="true"></span>
    </button>

    <div class="explore-row-main">
      <h4>${memoryWithContext.title}</h4>
      <p>${memoryWithContext.location}${memoryWithContext.cityCountry ? `, ${memoryWithContext.cityCountry.replace("Dublin, ", "")}` : ""}</p>
    </div>

    ${signatureMarkup}

    <span class="explore-row-duration">${memoryWithContext.duration || "0:00"}</span>

    ${createExplorePlayButton(memoryWithContext, memoryId)}
  `;

  const rowThumbMap = row.querySelector(".explore-row-thumb-map");

  if (rowThumbMap) {
    initializeMemoryCardMap(
      {
        querySelector: function(selector) {
          return selector === ".memory-card-map" ? rowThumbMap : null;
        }
      },
      memoryWithContext
    );
  }

  row.querySelector(".explore-row-thumb").addEventListener("click", function(event) {
    event.stopPropagation();

    const playButton = row.querySelector(".play-button");
    openMemoryInExpandedPlayer(playButton);
  });

  return row;
}

function renderExploreCapsuleRows(memories) {
  capsuleGrid.className = "explore-capsule-list";
  capsuleGrid.innerHTML = "";

  if (!memories.length) {
    capsuleGrid.innerHTML = `
      <div class="explore-empty-state">
        No capsules found in this collection.
      </div>
    `;
    return;
  }

  const header = document.createElement("div");
  header.className = "explore-list-labels";
  header.innerHTML = `
    <span>Title</span>
    <span>Signature Sound</span>
    <span>Duration</span>
  `;

  capsuleGrid.appendChild(header);

  memories.forEach(function(memory) {
    capsuleGrid.appendChild(createExploreCapsuleRow(memory));
  });

  connectPlayButtons();
}

function renderExploreCollectionList(collectionId) {
  const collection = getExploreCollectionById(collectionId);
  const memories = collectionMemories[collectionId] || [];
  const searchInput = document.getElementById("explore-search");
  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  currentExploreCollectionId = collectionId;
  memorySection.classList.remove("is-explore-landing");
  memorySection.classList.add("is-explore-list");
  memorySection.classList.remove("is-map-collection");

  memoryTitle.innerHTML = `
    <button class="explore-back-button" type="button" aria-label="Back to Dublin collections">←</button>
  `;
  memorySubtitle.textContent = "";

  if (collectionsHeader) {
    collectionsHeader.textContent = "";
  }

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Search within this collection...";
  }

  nowPlayingText.textContent = `Viewing ${collection ? collection.name : "collection"}.`;
  renderExploreCapsuleRows(memories);

  const backButton = memoryTitle.querySelector(".explore-back-button");

  if (backButton) {
    backButton.addEventListener("click", function() {
      renderExploreMemories();
    });
  }
}

function setupExploreSearch() {
  const searchInput = document.getElementById("explore-search");

  if (!searchInput || searchInput.dataset.connected === "true") {
    return;
  }

  searchInput.dataset.connected = "true";

  searchInput.addEventListener("input", function() {
    const query = searchInput.value.trim().toLowerCase();

    if (currentExploreCollectionId) {
      const memories = collectionMemories[currentExploreCollectionId] || [];
      const filteredMemories = memories.filter(function(memory) {
        return getMemorySearchText(memory).includes(query);
      });

      renderExploreCapsuleRows(filteredMemories);
      return;
    }

    const filteredCollections = exploreCollections.filter(function(collection) {
      return getCollectionSearchText(collection).includes(query);
    });

    renderExploreCollections(filteredCollections);
  });
}

function renderExploreMemories() {
  memorySection.classList.add("is-explore-landing");
  memorySection.classList.remove("is-explore-list");
  memorySection.classList.remove("is-map-collection");

  setExplorePageHeading();
  renderExploreCityMap();
  setupExploreSearch();

  const searchInput = document.getElementById("explore-search");

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Search places, collections, sounds...";
  }

  nowPlayingText.textContent = "Browse Dublin collections and sound capsules.";
  renderExploreCollections(exploreCollections);
}

function scrollMainContentToCards() {
  const top = memorySection.offsetTop - appContent.offsetTop;

  appContent.scrollTo({
    top: Math.max(top - 12, 0),
    behavior: "smooth"
  });
}

function renderCollection(collectionId, collectionTitle) {
  const memories = collectionMemories[collectionId];

  memorySection.classList.remove("is-explore-landing");
  memorySection.classList.toggle("is-map-collection", currentAppSection === "map");
  memoryTitle.textContent = collectionTitle;
  nowPlayingText.textContent = `Viewing collection: ${collectionTitle}`;

  if (!memories) {
    capsuleGrid.innerHTML = "";
    nowPlayingText.textContent = `${collectionTitle} does not have cards yet.`;
    return;
  }

  renderMemoryCards(memories, collectionId, collectionTitle);

  if (currentAppSection === "map") {
    memorySection.hidden = false;
    exploreFilterRow.hidden = true;
  }

  scrollMainContentToCards();
}