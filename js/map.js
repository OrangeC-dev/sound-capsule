let realMap = null;
let countryMarkers = [];
let dublinMarker = null;
let collectionMarkers = [];

// Tracks where we are in the real map journey.
let realMapLevel = "world";
let currentAppSection = "map";
let mapBackButton = null;

const realPlaces = {
  world: {
    center: [20, 0],
    zoom: 2
  },
  ireland: {
    center: [53.35, -6.26],
    zoom: 6.7
  },
  dublin: {
    center: [53.3498, -6.2603],
    zoom: 11
  },
  collections: {
    center: [53.358, -6.20],
    zoom: 11.75
  },
  peru: {
    center: [-9.19, -75.02],
    zoom: 5
  }
};

function getRealMapPlace(level) {
  const mobilePlaces = {
    world: {
      center: [18, -18],
      zoom: 1.35
    },
    ireland: {
      center: [53.35, -7.4],
      zoom: 5.3
    },
    dublin: {
      center: [53.3498, -6.2603],
      zoom: 10
    },
    collections: {
      center: [53.358, -6.24],
      zoom: 10.4
    },
    peru: {
      center: [-9.19, -75.02],
      zoom: 4
    }
  };

  if (window.matchMedia("(max-width: 480px)").matches) {
    return mobilePlaces[level] || realPlaces[level];
  }

  return realPlaces[level];
}

const mapBounds = {
  world: [
    [-55, -100000],
    [75, 100000]
  ],
  ireland: [
    [50.1, -13.5],
    [56.9, -2.2]
  ],
  dublin: [
    [53.28, -6.42],
    [53.43, -6.02]
  ],
  peru: [
    [-20, -83],
    [1, -67]
  ]
};

const dublinCollectionPlaces = [
  {
    title: "Coastal",
    collectionId: "dublinCoastal",
    position: [53.3895, -6.0665]
  },
  {
    title: "Streets",
    collectionId: "dublinStreets",
    position: [53.3445, -6.2750]
  },
  {
    title: "Parks",
    collectionId: "dublinParks",
    position: [53.3290, -6.3350]
  },
  {
    title: "Transport",
    collectionId: "dublinTransport",
    position: [53.3533, -6.2380]
  },
  {
    title: "Weather",
    collectionId: "dublinWeather",
    position: [53.3810, -6.1700]
  },
  {
    title: "Voices & Spaces",
    collectionId: "dublinVoices",
    position: [53.3340, -6.2050]
  }
];

const mobileDublinCollectionPlaces = [
  {
    title: "Coastal",
    collectionId: "dublinCoastal",
    position: [53.3980, -6.1300]
  },
  {
    title: "Streets",
    collectionId: "dublinStreets",
    position: [53.3570, -6.4250]
  },
  {
    title: "Parks",
    collectionId: "dublinParks",
    position: [53.3240, -6.3400]
  },
  {
    title: "Transport",
    collectionId: "dublinTransport",
    position: [53.4240, -6.3100]
  },
  {
    title: "Weather",
    collectionId: "dublinWeather",
    position: [53.3860, -6.2650]
  },
  {
    title: "Voices & Spaces",
    collectionId: "dublinVoices",
    position: [53.2770, -6.2800]
  }
];

function getDublinCollectionPlaces() {
  if (window.matchMedia("(max-width: 480px)").matches) {
    return mobileDublinCollectionPlaces;
  }

  return dublinCollectionPlaces;
}

function createLeafletIcon(label) {
  return L.divIcon({
    className: "",
    html: `
      <div class="leaflet-place-marker">
        <img
          class="leaflet-place-logo"
          src="assets/logo-symbol-transparent.png"
          alt=""
        />
        <span class="leaflet-marker-label">${label}</span>
      </div>
    `,
    iconSize: [180, 42],
    iconAnchor: [18, 21]
  });
}

function createCollectionLeafletIcon(label) {
  return L.divIcon({
    className: "",
    html: `
      <button class="leaflet-collection-marker" type="button">
        <span class="leaflet-collection-dot"></span>
        <span class="leaflet-collection-label">${label}</span>
      </button>
    `,
    iconSize: [180, 34],
    iconAnchor: [12, 17]
  });
}

function createRealMapBackButton() {
  mapBackButton = document.createElement("button");
  mapBackButton.className = "map-back-button";
  mapBackButton.type = "button";
  mapBackButton.textContent = "Back";

  mapBackButton.addEventListener("click", function() {
    goBackRealMap();
  });

  memoryMap.appendChild(mapBackButton);
  updateRealMapBackButton();
}

function updateRealMapBackButton() {
  if (!mapBackButton) {
    return;
  }

  mapBackButton.hidden = realMapLevel === "world";
}

function goBackRealMap() {
  if (realMapLevel === "collections") {
    clearCollectionMarkers();
    capsuleGrid.innerHTML = "";

    realMapLevel = "ireland";
    setMapBounds("ireland");
    const irelandPlace = getRealMapPlace("ireland");
    realMap.setView(irelandPlace.center, irelandPlace.zoom);

    showDublinMarker();
    updateRealMapBackButton();

    setMapPageHeading();
    memoryTitle.textContent = "Field recordings and notes"
    nowPlayingText.textContent = "Choose a city to explore its collections.";
    return;
  }

  if (realMapLevel === "ireland" || realMapLevel === "peru") {
    realMapLevel = "world";

    leafletMapContainer.hidden = false;
    collectionMap.hidden = true;
    capsuleGrid.innerHTML = "";

    setMapPageHeading();
    memoryTitle.textContent = "Field recordings and notes";
    nowPlayingText.textContent = "Choose a country to explore its sound memories.";

    setMapBounds("world");

    flyToPlace(getRealMapPlace("world"), {
      duration: 0.9,
      easeLinearity: 0.18
    });

    showWorldMarkers();
    updateRealMapBackButton();
  }
}

function initRealMap() {
  const initialPlace = getRealMapPlace("world");

  realMap = L.map("leaflet-map", {
    zoomControl: false,
    attributionControl: true,
    minZoom: 1,
    worldCopyJump: true,
    maxBounds: mapBounds.world,
    maxBoundsViscosity: 0.9
  }).setView(initialPlace.center, initialPlace.zoom);

  L.tileLayer(getCartoBasemapUrl("dark_nolabels"), {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    minZoom: 1,
    maxZoom: 19
  }).addTo(realMap);

  createRealMapBackButton();

  realMapLevel = "world";
  showWorldMarkers();
  updateRealMapBackButton();

  setMapPageHeading();
  nowPlayingText.textContent = "Choose a country to explore its sound memories"
}

function setMapBounds(level) {
  realMap.setMaxBounds(mapBounds[level]);
}

function flyToPlace(place, options, afterFlight) {
  realMap.stop();

  realMap.flyTo(place.center, place.zoom, options);

  if (afterFlight) {
    setTimeout(function() {
      afterFlight();
    }, options.duration * 1000);
  }
}

function showWorldMarkers() {
  clearRealMarkers();

  const ireland = L.marker([53.4129, -8.2439], {
    icon: createLeafletIcon("Ireland")
  }).addTo(realMap);

  ireland.on("click", function() {
    zoomToIreland();
  });

  const peru = L.marker([-9.19, -75.02], {
    icon: createLeafletIcon("Peru")
  }).addTo(realMap);

  peru.on("click", function() {
    realMapLevel = "peru";
    updateRealMapBackButton();
    setMapBounds("peru");

    flyToPlace(getRealMapPlace("peru"), {
      duration: 0.9,
      easeLinearity: 0.18
    });

    setMapPageHeading();
    nowPlayingText.textContent = "Peru memories can be added later.";
  });

  countryMarkers.push(ireland, peru);
}

function zoomToIreland() {
  realMapLevel = "ireland";
  updateRealMapBackButton();

  nowPlayingText.textContent = "Moving into Ireland...";

  // Keep wide bounds during the camera move so there is no final snap.
  setMapBounds("world");
  clearRealMarkers();

  flyToPlace(getRealMapPlace("ireland"), {
    duration: 1.1,
    easeLinearity: 0.14
  }, function() {
    showDublinMarker();
    setMapBounds("ireland");
  });
}

function showDublinMarker() {
  clearRealMarkers();

  setMapPageHeading();
  nowPlayingText.textContent = "Choose a city to explore its collections.";

  dublinMarker = L.marker(realPlaces.dublin.center, {
    icon: createLeafletIcon("Dublin")
  }).addTo(realMap);

  dublinMarker.on("click", function() {
    zoomToDublinCollections();
  });
}

function zoomToDublinCollections() {
  realMapLevel = "collections";
  updateRealMapBackButton();

  nowPlayingText.textContent = "Moving into Dublin...";

  // Use Ireland bounds during the flight so the camera can move freely.
  setMapBounds("ireland");
  clearRealMarkers();

  flyToPlace(getRealMapPlace("collections"), {
    duration: 1.1,
    easeLinearity: 0.14
  }, function() {
    showDublinCollectionMarkers();
    setMapBounds("dublin");
  });
}

function selectCollectionMarker(selectedMarker) {
  collectionMarkers.forEach(function(marker) {
    const markerElement = marker.getElement();

    if (!markerElement) {
      return;
    }

    const button = markerElement.querySelector(".leaflet-collection-marker");

    if (button) {
      button.classList.remove("is-selected");
    }
  });

  const selectedElement = selectedMarker.getElement();

  if (!selectedElement) {
    return;
  }

  const selectedButton = selectedElement.querySelector(".leaflet-collection-marker");

  if (selectedButton) {
    selectedButton.classList.add("is-selected");
  }
}

function showDublinCollectionMarkers() {
  clearRealMarkers();
  clearCollectionMarkers();

  leafletMapContainer.hidden = false;
  capsuleGrid.innerHTML = "";

  setMapPageHeading();
  memoryTitle.textContent = "Field recordings and notes";
  nowPlayingText.textContent = "Choose a Dublin sound collection.";

  getDublinCollectionPlaces().forEach(function(place) {
    const marker = L.marker(place.position, {
      icon: createCollectionLeafletIcon(place.title)
    }).addTo(realMap);

    marker.on("click", function() {
      selectCollectionMarker(marker);
      renderCollection(place.collectionId, place.title);
    });

    collectionMarkers.push(marker);
  });
}

function showAbstractCollectionsView() {
  realMapLevel = "collections";
  updateRealMapBackButton();
  
  leafletMapContainer.hidden = true;
  collectionMap.hidden = false;

  collectionMap.innerHTML = "";
  capsuleGrid.innerHTML = "";

  setMapPageHeading();
  memoryTitle.textContent = "Field recordings and notes";
  nowPlayingText.textContent = "Choose a Dublin sound collection.";

  mapViews.dublin.pins.forEach(function(pinData) {
    collectionMap.appendChild(createCollectionPin(pinData));
  });
}

function createCollectionPin(pinData) {
  const pin = document.createElement("button");

  pin.className = "map-pin collection-pin";
  pin.type = "button";
  pin.setAttribute("aria-label", pinData.title);

  pin.style.setProperty("--x", pinData.mapPosition.x);
  pin.style.setProperty("--y", pinData.mapPosition.y);

  pin.addEventListener("click", function() {
    renderCollection(pinData.collectionId, pinData.title);
  });

  return pin;
}

function clearRealMarkers() {
  countryMarkers.forEach(function(marker) {
    realMap.removeLayer(marker);
  });

  countryMarkers = [];

  if (dublinMarker) {
    realMap.removeLayer(dublinMarker);
    dublinMarker = null;
  }

  clearCollectionMarkers();
}

function clearCollectionMarkers() {
  collectionMarkers.forEach(function(marker) {
    realMap.removeLayer(marker);
  });

  collectionMarkers = [];
}