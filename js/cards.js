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

function getExploreMapContext(contextId) {
  const isMobile = window.matchMedia("(max-width: 480px)").matches;

  const contexts = {
    world: {
      center: isMobile ? [-5, 0] : [20, 0],
      zoom: isMobile ? 1.15 : 2,
      pins: []
    },
    ireland: {
      center: isMobile ? [51.85, -10.8] : [53.35, -7.8],
      zoom: isMobile ? 5.5 : 6.4,
      pins: []
    },
    netherlands: {
      center: isMobile ? [50.34, 3.20] : [52.28, 5.2],
      zoom: isMobile ? 6.48 : 7.25,
      pins: []
    }
  };

  return contexts[contextId] || contexts.world;
}

function renderExploreCityMap(contextId) {
  if (!exploreCityMap || typeof L === "undefined") {
    return;
  }

  if (exploreCityLeafletMap) {
    exploreCityLeafletMap.remove();
    exploreCityLeafletMap = null;
  }

  const mapContext = getExploreMapContext(contextId || "world");

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
  }).setView(mapContext.center, mapContext.zoom);

  L.tileLayer(getCartoBasemapUrl("dark_nolabels"), {
    subdomains: "abcd",
    maxZoom: 19,
    className: "explore-city-tile"
  }).addTo(exploreCityLeafletMap);

  (mapContext.pins || []).forEach(function(position) {
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
  if (memory.id) {
    return memory.id;
  }

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
let currentExploreView = {
  level: "world",
  countryId: "",
  placeId: ""
};

function getCollectionCapsuleCount(collectionId) {
  return getCollectionMemories(collectionId).length;
}

function getExploreCollectionById(collectionId) {
  return [...exploreCollections, ...globalCollections, ...editorialCollections].find(function(collection) {
    return collection.id === collectionId;
  });
}

function getCollectionMemories(collectionId) {
  const collection = getExploreCollectionById(collectionId);

  if (collection && collection.type === "global") {
    const memories = exploreCollections
      .filter(function(source) {
        return source.theme === collection.theme;
      })
      .flatMap(function(source) {
        return collectionMemories[source.id] || [];
      });
    const seen = new Set();

    return memories.filter(function(memory) {
      const id = createMemoryId(memory);

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  }

  if (collection && collection.type === "editorial") {
    const memoriesById = new Map();

    Object.values(collectionMemories).flat().forEach(function(memory) {
      memoriesById.set(createMemoryId(memory), memory);
    });

    return [...new Set(collection.capsuleIds || [])]
      .map(function(id) {
        return memoriesById.get(id);
      })
      .filter(Boolean);
  }

  return collectionMemories[collectionId] || [];
}

function getExploreCountryById(countryId) {
  return exploreArchive.countries.find(function(country) {
    return country.id === countryId;
  });
}

function getCollectionCapsuleTotal(collectionIds) {
  return (collectionIds || []).reduce(function(total, collectionId) {
    return total + getCollectionCapsuleCount(collectionId);
  }, 0);
}

function getExploreCountryCapsuleCount(country) {
  if (!country) {
    return 0;
  }

  return getCollectionCapsuleTotal(country.collectionIds || []);
}

function getCollectionSearchText(collection) {
  const memories = getCollectionMemories(collection.id);
  const memoryText = memories.map(getMemorySearchText).join(" ");

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
    memory.country,
    memory.region,
    memory.city,
    memory.town,
    memory.signatureSound && memory.signatureSound.label,
    ...(memory.publicTags || []),
    ...(memory.hiddenSoundTags || []),
    ...(memory.hiddenMoodTags || [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function getMemoryLocationLabel(memory) {
  const placeParts = [
    memory.city || memory.town,
    memory.country
  ].filter(Boolean);

  if (placeParts.length) {
    return `${memory.location}${memory.location ? ", " : ""}${placeParts.join(", ")}`;
  }

  if (memory.cityCountry) {
    return `${memory.location}${memory.location ? ", " : ""}${memory.cityCountry}`;
  }

  return memory.location || "";
}

function createExploreNavigationCard(item, count, onSelect) {
  const card = document.createElement("article");

  card.className = "explore-collection-card";
  card.dataset.theme = item.theme || "streets";
  card.dataset.archiveId = item.id;

  card.innerHTML = `
    <div class="explore-collection-visual" aria-hidden="true">
      ${
        item.image
          ? `<img src="${escapeAttribute(item.image)}" alt="" />`
          : ""
      }
    </div>

    <div class="explore-collection-content">
      <h4>${item.name}</h4>
      <p>${count} ${count === 1 ? "Capsule" : "Capsules"}</p>
    </div>

    <button
      class="explore-collection-play"
      type="button"
      aria-label="Open ${escapeAttribute(item.name)}"
    ></button>
  `;

  card.addEventListener("click", onSelect);

  card.querySelector(".explore-collection-play").addEventListener("click", function(event) {
    event.stopPropagation();
    onSelect();
  });

  return card;
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
  memorySection.classList.remove("is-explore-world");
  memorySection.classList.remove("is-explore-country");
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

function renderExploreCountryCards(countries) {
  if (currentExploreView.level !== "world") {
    return;
  }

  capsuleGrid.className = "capsule-grid explore-collection-grid";
  capsuleGrid.innerHTML = "";

  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  if (collectionsHeader) {
    collectionsHeader.textContent = "Countries";
  }

  if (!countries.length) {
    capsuleGrid.innerHTML = `
      <div class="explore-empty-state">
        No countries found for this search.
      </div>
    `;
    return;
  }

  countries.forEach(function(country) {
    capsuleGrid.appendChild(
      createExploreNavigationCard(
        country,
        getExploreCountryCapsuleCount(country),
        function() {
          renderExploreCountry(country.id);
        }
      )
    );
  });
}

function renderExploreWorld() {
  currentExploreCollectionId = null;
  currentExploreView = {
    level: "world",
    countryId: "",
    placeId: ""
  };

  memorySection.classList.add("is-explore-landing");
  memorySection.classList.add("is-explore-world");
  memorySection.classList.remove("is-explore-country");
  memorySection.classList.remove("is-explore-list");
  memorySection.classList.remove("is-map-collection");

  memoryTitle.textContent = "World";
  memorySubtitle.textContent = "Choose a country to explore its sound archive.";

  const searchInput = document.getElementById("explore-search");

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Search countries, places, collections, sounds...";
  }

  renderExploreCityMap("world");

  capsuleGrid.className = "capsule-grid explore-collection-grid";
  capsuleGrid.innerHTML = "";

  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  if (collectionsHeader) {
    collectionsHeader.textContent = "Countries";
  }

  renderExploreCountryCards(exploreArchive.countries);
  renderRecentlyAddedCapsule();

  nowPlayingText.textContent = "Choose a country to explore its sound capsules.";
}

function renderExploreCountry(countryId) {
  const country = getExploreCountryById(countryId);
  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  if (!country) {
    renderExploreWorld();
    return;
  }

  currentExploreCollectionId = null;
  currentExploreView = {
    level: "country",
    countryId: country.id,
    placeId: ""
  };

  memorySection.classList.add("is-explore-landing");
  memorySection.classList.add("is-explore-country");
  memorySection.classList.remove("is-explore-world");
  memorySection.classList.remove("is-explore-list");
  memorySection.classList.remove("is-map-collection");

  memoryTitle.innerHTML = `
    <button class="explore-back-button" type="button" aria-label="Back to countries">←</button>
    <span>${country.name}</span>
  `;
  memorySubtitle.textContent = country.summary || "";

  const searchInput = document.getElementById("explore-search");

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = `Search ${country.name} collections, places, sounds...`;
  }
  
  renderExploreCityMap(country.id);

  capsuleGrid.className = "capsule-grid explore-collection-grid";
  capsuleGrid.innerHTML = "";

  if (collectionsHeader) {
    collectionsHeader.textContent = "Collections";
  }

  (country.collectionIds || []).forEach(function(collectionId) {
    const collection = getExploreCollectionById(collectionId);

    if (collection) {
      capsuleGrid.appendChild(createExploreCollectionCard(collection));
    }
  });

  if (!country.collectionIds || !country.collectionIds.length) {
    capsuleGrid.innerHTML = `
      <div class="explore-empty-state">
        Collections for ${country.name} will appear here.
      </div>
    `;
  }

  const backButton = memoryTitle.querySelector(".explore-back-button");

  if (backButton) {
    backButton.addEventListener("click", function() {
      renderExploreWorld();
    });
  }

  nowPlayingText.textContent = `Viewing ${country.name} collections.`;
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
      <p>${getMemoryLocationLabel(memoryWithContext)}</p>
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

  if (!collection) {
    return;
  }

  const isSharedCollection = collection.type === "global" || collection.type === "editorial";
  const country = exploreArchive.countries.find(function(item) {
    return (item.collectionIds || []).includes(collectionId);
  });

  setAppSection("explore");
  setupExploreSearch();
  currentExploreCollectionId = collectionId;
  currentExploreView = {
    level: isSharedCollection ? "global" : "country",
    countryId: country ? country.id : "",
    placeId: ""
  };

  memorySection.classList.remove(
    "is-explore-landing",
    "is-explore-world",
    "is-explore-country",
    "is-map-collection"
  );
  memorySection.classList.add("is-explore-list");

  memoryTitle.innerHTML = `
    <button class="explore-back-button" type="button" aria-label="${isSharedCollection ? "Back to Ways to Listen" : "Back to country collections"}">←</button>
    ${isSharedCollection ? `<span>${escapeAttribute(collection.name)}</span>` : ""}
  `;
  memorySubtitle.textContent = "";

  const collectionsHeader = document.querySelector(".explore-collections-header h3");

  if (collectionsHeader) {
    collectionsHeader.textContent = "";
  }

  const searchInput = document.getElementById("explore-search");

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Search within this collection...";
  }

  nowPlayingText.textContent = `Viewing ${collection.name}.`;
  renderExploreCapsuleRows(getCollectionMemories(collectionId));

  requestAnimationFrame(function() {
    appContent.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  const backButton = memoryTitle.querySelector(".explore-back-button");

  if (backButton) {
    backButton.addEventListener("click", function() {
      if (isSharedCollection) {
        setAppSection("home");
      } else if (country) {
        renderExploreCountry(country.id);
      } else {
        renderExploreWorld();
      }
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
      const memories = getCollectionMemories(currentExploreCollectionId);
      const filteredMemories = memories.filter(function(memory) {
        return getMemorySearchText(memory).includes(query);
      });

      renderExploreCapsuleRows(filteredMemories);
      return;
    }

    if (currentExploreView.level === "country") {
      const country = getExploreCountryById(currentExploreView.countryId);
      const collectionIds = country ? country.collectionIds || [] : [];

      const filteredCollections = collectionIds
        .map(getExploreCollectionById)
        .filter(Boolean)
        .filter(function(collection) {
          return getCollectionSearchText(collection).includes(query);
        });

      renderExploreCollections(filteredCollections);
      return;
    }

    const filteredCountries = exploreArchive.countries.filter(function(country) {
      return [
        country.name,
        country.summary
      ].filter(Boolean).join(" ").toLowerCase().includes(query);
    });

    renderExploreCountryCards(filteredCountries);
  });
}

function renderExploreMemories() {
  setupExploreSearch();

  const searchInput = document.getElementById("explore-search");

  if (searchInput) {
    searchInput.value = "";
    searchInput.placeholder = "Search countries, places, collections, sounds...";
  }

  renderExploreWorld();
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

function getRecentlyAddedMemories(limit = 5) {
  if (typeof audioAddedAt === "undefined") {
    return [];
  }

  const memoriesById = new Map();

  Object.entries(collectionMemories).forEach(function([collectionId, memories]) {
    const collection = getExploreCollectionById(collectionId);

    memories.forEach(function(memory) {
      const addedAt = audioAddedAt[memory.audio];

      if (!memory.audio || memory.duration === "Coming soon" || !Number.isFinite(Date.parse(addedAt))) {
        return;
      }

      const id = createMemoryId(memory);

      if (!memoriesById.has(id)) {
        memoriesById.set(id, {
          ...addCollectionContext(memory, collectionId, collection ? collection.name : ""),
          addedAt: addedAt
        });
      }
    });
  });

  return [...memoriesById.values()]
    .sort(function(a, b) {
      return Date.parse(b.addedAt) - Date.parse(a.addedAt) || a.audio.localeCompare(b.audio);
    })
    .slice(0, limit);
}

let archiveCapsuleMaps = [];
let archiveMapObserver = null;

function createArchiveCapsuleCard(memory) {
  const card = document.createElement("article");
  const memoryId = createMemoryId(memory);
  const placeParts = (memory.cityCountry || "").split(",").map(function(part) {
    return part.trim();
  });
  const city = memory.city || memory.town || placeParts[0] || "";
  const country = memory.country || (placeParts.length > 1 ? placeParts.slice(1).join(", ") : "");

  memoryStore.set(memoryId, memory);
  card.className = "archive-capsule-card";
  card.dataset.memoryId = memoryId;

  card.innerHTML = `
    <button class="archive-capsule-open" type="button" aria-label="Open ${escapeAttribute(memory.title)}"></button>

    <div class="archive-capsule-visual">
      <div class="player-map-thumb archive-capsule-map" aria-hidden="true" style="z-index: 0; pointer-events: none;"></div>
      ${createExplorePlayButton(memory, memoryId)}
    </div>

    <div class="archive-capsule-copy">
      <h4>${escapeAttribute(memory.title)}</h4>
      <p>${escapeAttribute(city)}${city && country ? "<br>" : ""}${escapeAttribute(country)}</p>
    </div>
  `;

  const playButton = card.querySelector(".play-button");
  playButton.classList.remove("explore-row-play");
  playButton.classList.add("archive-capsule-play");
  playButton.addEventListener("click", function(event) {
    event.stopPropagation();
  });

  card.querySelector(".archive-capsule-open").addEventListener("click", function() {
    if (currentMemoryData && createMemoryId(currentMemoryData) === memoryId) {
      openCapsuleView();
      return;
    }

    openMemoryInCapsuleView(playButton);
  });

  return card;
}

function renderRecentlyAddedCapsule() {
  const section = document.getElementById("explore-recently-added");
  const container = document.getElementById("explore-recently-added-capsule");

  if (!section || !container) {
    return;
  }

  if (archiveMapObserver) {
    archiveMapObserver.disconnect();
  }
  archiveMapObserver = null;
  archiveCapsuleMaps.forEach(function(map) {
    map.remove();
  });
  archiveCapsuleMaps = [];

  const memories = getRecentlyAddedMemories();
  container.innerHTML = "";
  section.hidden = memories.length === 0;

  if (!memories.length) {
    return;
  }

  if (typeof ResizeObserver !== "undefined") {
    archiveMapObserver = new ResizeObserver(function(entries) {
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
  }

  memories.forEach(function(memory) {
    const card = createArchiveCapsuleCard(memory);
    container.appendChild(card);

    const mapContainer = card.querySelector(".archive-capsule-map");
    const map = renderPlayerMapThumbnail(mapContainer, null, memory);

    if (map) {
      archiveCapsuleMaps.push(map);

      if (archiveMapObserver) {
        archiveMapObserver.observe(mapContainer);
      }
    }
  });
  container.scrollLeft = 0;
  connectPlayButtons();

  if (currentMemoryData) {
    const currentId = createMemoryId(currentMemoryData);
    const activeButton = Array.from(container.querySelectorAll(".play-button")).find(function(button) {
      return button.dataset.memoryId === currentId;
    });

    if (activeButton) {
      resetCardPlayer(currentButton);
      currentButton = activeButton;
      currentMemoryCard = null;
      setPlayButtonState(activeButton, !persistentAudio.paused && !persistentAudio.ended);
    }
  }
}