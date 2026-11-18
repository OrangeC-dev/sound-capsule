let realMap = null;
let countryMarkerLayer;
let recordingMarkerLayer;
let countryFocusLayer;
let realMapLevel = "world";
let currentAppSection = "map";
let mapBackButton;
let mappedCountries = [];

const realPlaces = {
  world: { center: [20, 0], zoom: 2 },
  dublin: { center: [53.3498, -6.2603] }
};

function createRealMapBackButton() {
  mapBackButton = document.createElement("button");
  mapBackButton.className = "map-back-button";
  mapBackButton.type = "button";
  mapBackButton.textContent = "Back";
  mapBackButton.setAttribute("aria-label", "Return to World");
  mapBackButton.addEventListener("click", resetRealMapToWorld);
  memoryMap.appendChild(mapBackButton);
  updateRealMapBackButton();
}

function getMappedCountries() {
  return exploreArchive.countries.map(function(country) {
    const recordings = new Map();

    for (const recording of country.collectionIds.flatMap(getCollectionMemories)) {
      const hasLatitude = Number.isFinite(recording.lat) || Number.isFinite(recording.latitude);
      const hasLongitude = Number.isFinite(recording.lng) || Number.isFinite(recording.longitude);

      if (recording.audio && recording.duration !== "Coming soon" && hasLatitude && hasLongitude) {
        recordings.set(createMemoryId(recording), recording);
      }
    }

    return {
      id: country.id,
      name: country.name,
      countryCode: country.countryCode,
      recordings: [...recordings.values()]
    };
  }).filter(country => country.recordings.length > 0);
}

function getRealMapSearchTargets() {
  const targets = new Map();

  for (const country of mappedCountries) {
    targets.set(country.name, { label: country.name, country });
  }

  for (const country of mappedCountries) {
    for (const recording of country.recordings) {
      const position = getMemoryPosition(recording);
      const city = recording.city || recording.town || recording.cityCountry?.split(",")[0];
      const cityLabel = city ? `${city}, ${country.name}` : country.name;
      const placeLabel = recording.location ? `${recording.location}, ${cityLabel}` : "";

      if (city && !targets.has(cityLabel)) {
        targets.set(cityLabel, { label: cityLabel, country, position, zoom: 11 });
      }

      if (placeLabel && !targets.has(placeLabel)) {
        targets.set(placeLabel, { label: placeLabel, country, position, zoom: 15 });
      }
    }
  }

  return [...targets.values()];
}

function setupRealMapControls() {
  const countrySelect = document.getElementById("map-country-select");
  const searchForm = document.getElementById("map-search-form");
  const searchInput = document.getElementById("map-search-input");
  const searchStatus = document.getElementById("map-search-status");
  const targets = getRealMapSearchTargets();

  for (const country of mappedCountries) {
    countrySelect.add(new Option(country.name, country.id));
  }

  countrySelect.addEventListener("change", function() {
    if (countrySelect.value === "world") {
      resetRealMapToWorld();
    } else {
      zoomToMapCountry(mappedCountries.find(country => country.id === countrySelect.value));
    }
  });

  searchInput.addEventListener("input", function() {
    searchStatus.textContent = "";
  });

  searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      searchInput.focus();
      return;
    }

    const target = targets.find(item => item.label.toLowerCase() === query) ||
      targets.find(item => item.label.toLowerCase().startsWith(query)) ||
      targets.find(item => item.label.toLowerCase().includes(query));

    if (!target) {
      searchStatus.textContent = "No archive places found.";
      return;
    }

    searchInput.value = target.label;
    searchStatus.textContent = "";

    if (window.matchMedia("(max-width: 920px)").matches) {
      searchInput.blur();
    }

    zoomToMapCountry(target.country, target);
  });

  document.getElementById("map-zoom-in").addEventListener("click", () => realMap.zoomIn());
  document.getElementById("map-zoom-out").addEventListener("click", () => realMap.zoomOut());
  document.getElementById("map-reset-world").addEventListener("click", resetRealMapToWorld);
}

function updateRealMapBackButton() {
  mapBackButton.hidden = realMapLevel === "world";
  document.getElementById("map-country-select").value = realMapLevel;
}

function prepareRealMapView(level) {
  realMap.stop();
  closeMapRecordingPreview();
  countryMarkerLayer.clearLayers();
  recordingMarkerLayer.clearLayers();
  countryFocusLayer.clearLayers();

  realMapLevel = level;
  memorySection.hidden = true;
  appContent.scrollTop = 0;
  updateRealMapBackButton();
}

function frameRealMapWorld(animate) {
  const bounds = L.latLngBounds(mappedCountries.map(country => country.bounds.getCenter()));

  if (!bounds.isValid()) {
    const { center, zoom } = realPlaces.world;
    realMap.setView(center, zoom);
    return;
  }

  const options = { padding: [48, 64], maxZoom: 4 };

  if (animate) {
    realMap.flyToBounds(bounds, { ...options, duration: 0.9 });
  } else {
    realMap.fitBounds(bounds, options);
  }
}

function resetRealMapToWorld() {
  prepareRealMapView("world");
  showWorldMarkers();
  frameRealMapWorld(true);
  nowPlayingText.textContent = "Choose a country to explore its recordings.";
}

function initRealMap() {
  const { center, zoom } = realPlaces.world;

  realMap = L.map("leaflet-map", {
    zoomControl: false,
    attributionControl: true,
    minZoom: 1,
    worldCopyJump: true,
    maxBounds: [[-85, -100000], [85, 100000]],
    maxBoundsViscosity: 0.9
  }).setView(center, zoom);

  L.tileLayer(getCartoBasemapUrl("dark_nolabels"), {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: "abcd",
    minZoom: 1,
    maxZoom: 19
  }).addTo(realMap);

  countryMarkerLayer = L.layerGroup().addTo(realMap);
  recordingMarkerLayer = createRecordingMarkerLayer().addTo(realMap);

  const focusPane = realMap.createPane("countryFocus");
  focusPane.style.zIndex = "350";
  focusPane.style.pointerEvents = "none";
  countryFocusLayer = L.layerGroup().addTo(realMap);

  mappedCountries = getMappedCountries().map(country => ({
    ...country,
    bounds: L.latLngBounds(country.recordings.map(getMemoryPosition))
  }));

  setupRealMapControls();
  setupMapRecordingPreview();
  createRealMapBackButton();
  showWorldMarkers();
  setMapPageHeading();
  nowPlayingText.textContent = "Choose a country to explore its recordings.";

  let initialWorldFrame = true;

  new ResizeObserver(function([entry]) {
    if (!entry.contentRect.width || !entry.contentRect.height) {
      return;
    }

    realMap.invalidateSize({ animate: false, debounceMoveend: true });

    if (initialWorldFrame) {
      initialWorldFrame = false;

      if (realMapLevel === "world") {
        frameRealMapWorld(false);
      }
    }
  }).observe(leafletMapContainer);
}

function createMapCountIcon(count) {
  const label = count === 1 ? "recording" : "recordings";

  return L.divIcon({
    className: "map-count-marker",
    html: `<span aria-hidden="true">${count}</span><span class="map-marker-description">${count} ${label}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
}

function createRecordingMarkerLayer() {
  if (typeof L.markerClusterGroup !== "function") {
    return L.layerGroup();
  }

  return L.markerClusterGroup({
    maxClusterRadius: 52,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    spiderLegPolylineOptions: { weight: 1, color: "#ddab74", opacity: 0.65 },
    iconCreateFunction: cluster => createMapCountIcon(cluster.getChildCount())
  });
}

function showWorldMarkers() {
  for (const country of mappedCountries) {
    const count = country.recordings.length;
    const label = `${country.name}: ${count} ${count === 1 ? "recording" : "recordings"}`;
    const marker = L.marker(country.bounds.getCenter(), {
      icon: createMapCountIcon(count),
      title: label
    });

    marker.bindTooltip(escapeAttribute(country.name), {
      permanent: true,
      direction: "bottom",
      offset: [0, 22],
      className: "map-place-tooltip"
    });
    marker.on("click", () => zoomToMapCountry(country));
    countryMarkerLayer.addLayer(marker);
  }
}

function zoomToMapCountry(country, target) {
  prepareRealMapView(country.id);
  const bounds = showMapCountryFocus(country);
  showRecordingMarkers(country);

  if (target?.position) {
    realMap.flyTo(target.position, target.zoom, { duration: 0.85 });
    return;
  }

  realMap.flyToBounds(bounds, {
    paddingTopLeft: [44, 92],
    paddingBottomRight: [56, 44],
    maxZoom: 8,
    duration: 0.9
  });
}

function showMapCountryFocus(country) {
  const geometry = typeof mapCountryBoundaries === "undefined"
    ? null
    : mapCountryBoundaries[country.countryCode];

  if (!geometry) {
    return country.bounds;
  }

  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const latLngPolygons = polygons.map(polygon =>
    polygon.map(ring => ring.map(([lng, lat]) => [lat, lng]))
  );

  const outerRing = [
    [-85.0511, -100000],
    [-85.0511, 100000],
    [85.0511, 100000],
    [85.0511, -100000]
  ];

  L.polygon([outerRing, ...latLngPolygons.flat()], {
    pane: "countryFocus",
    className: "map-country-dim",
    interactive: false,
    stroke: false,
    fillColor: "#070706",
    fillOpacity: 0.63,
    fillRule: "evenodd",
    smoothFactor: 0.35
  }).addTo(countryFocusLayer);

  L.polygon(latLngPolygons, {
    pane: "countryFocus",
    className: "map-country-outline",
    interactive: false,
    color: "#e8a24d",
    weight: 1.25,
    opacity: 0.8,
    fillColor: "#b67432",
    fillOpacity: 0.1,
    smoothFactor: 0.35
  }).addTo(countryFocusLayer);

  const recordingArea = country.bounds.pad(1);
  const bounds = L.latLngBounds(country.bounds.getSouthWest(), country.bounds.getNorthEast());

  for (const [exteriorRing] of latLngPolygons) {
    const partBounds = L.latLngBounds(exteriorRing);

    if (recordingArea.intersects(partBounds)) {
      bounds.extend(partBounds);
    }
  }

  return bounds;
}

function showRecordingMarkers(country) {
  const icon = L.divIcon({
    className: "map-recording-marker",
    html: '<span class="map-recording-dot" aria-hidden="true"></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  for (const recording of country.recordings) {
    const marker = L.marker(getMemoryPosition(recording), {
      icon,
      title: recording.title
    });

    marker.on("click", () => showMapRecordingPreview(recording, marker));
    marker.on("add", function() {
      marker.getElement()?.classList.toggle("is-selected", marker === mapPreviewMarker);
    });
    recordingMarkerLayer.addLayer(marker);
  }

  nowPlayingText.textContent = `Choose a recording in ${country.name}.`;
}

const mapPreview = document.getElementById("map-recording-preview");
const mapPreviewRegion = document.getElementById("map-preview-region");
const mapPreviewTitle = document.getElementById("map-recording-preview-title");
const mapPreviewLocation = document.getElementById("map-preview-location");
const mapPreviewDuration = document.getElementById("map-preview-duration");
const mapPreviewThumbnail = document.getElementById("map-preview-thumbnail");
const mapPreviewPlayButton = document.getElementById("map-preview-play");
let mapPreviewRecording = null;
let mapPreviewMarker = null;
let mapPreviewThumbMap = null;
let mapPreviewAnimation = null;

function setupMapRecordingPreview() {
  realMap.on("move resize", positionMapRecordingPreview);

  realMap.on("layerremove", function(event) {
    if (event.layer === mapPreviewMarker) {
      closeMapRecordingPreview();
    }
  });

  mapPreviewPlayButton.addEventListener("click", function() {
    const recording = mapPreviewRecording;

    if (!recording) {
      return;
    }

    closeMapRecordingPreview();
    playRecording(recording, null, { startOnly: true });
    persistentPlayerToggle.focus({ preventScroll: true });
  });

  document.getElementById("map-preview-explore").addEventListener("click", function() {
    const recording = mapPreviewRecording;

    if (!recording) {
      return;
    }

    closeMapRecordingPreview();
    openCapsuleView(recording);
    capsuleViewBack.focus({ preventScroll: true });
  });

  document.getElementById("map-preview-close").addEventListener("click", function() {
    closeMapRecordingPreview(true);
  });

  memoryMap.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !mapPreview.hidden) {
      closeMapRecordingPreview(true);
    }
  });
}

function positionMapRecordingPreview() {
  if (mapPreview.hidden || !mapPreviewMarker) {
    return;
  }

  const { x, y } = realMap.latLngToContainerPoint(mapPreviewMarker.getLatLng());
  const size = realMap.getSize();
  const width = mapPreview.offsetWidth;
  const height = mapPreview.offsetHeight;
  const mobile = window.matchMedia("(max-width: 920px)").matches;
  let padding = 14;
  let topEdge = 124;
  let rightEdge = size.x - 80;
  let bottomEdge = size.y - 24;
  const gap = 28;

  if (mobile) {
    const toolbar = memoryMap.querySelector(".map-toolbar");
    const controls = memoryMap.querySelector(".map-view-controls");

    padding = toolbar.offsetLeft;
    topEdge = toolbar.offsetTop + toolbar.offsetHeight + 8;
    rightEdge = controls.offsetLeft - 8;
    bottomEdge = controls.offsetTop + controls.offsetHeight;
  }

  const maxTop = Math.max(14, bottomEdge - height);
  const minTop = Math.min(topEdge, maxTop);
  const maxLeft = Math.max(padding, rightEdge - width);

  let left = x - gap - width;
  let top = y + 8;

  if (left < padding) {
    left = x + gap;

    if (left > maxLeft) {
      left = x - width / 2;
      top = y + gap + height <= bottomEdge ? y + gap : y - gap - height;
    }
  }

  mapPreview.style.left = `${Math.round(Math.min(maxLeft, Math.max(padding, left)))}px`;
  mapPreview.style.top = `${Math.round(Math.min(maxTop, Math.max(minTop, top)))}px`;
}

function showMapRecordingPreview(recording, marker) {
  const changed = marker !== mapPreviewMarker;
  mapPreviewMarker?.getElement()?.classList.remove("is-selected");
  mapPreviewRecording = {
    ...recording,
    locationLine: getMemoryLocationLabel(recording)
  };
  mapPreviewMarker = marker;
  marker.getElement()?.classList.add("is-selected");

  mapPreviewRegion.textContent = recording.cityCountry ||
    [recording.city || recording.town, recording.country].filter(Boolean).join(", ");
  mapPreviewTitle.textContent = recording.title;
  mapPreviewLocation.textContent = recording.location || "";
  mapPreviewDuration.textContent = recording.duration || "";
  mapPreviewPlayButton.setAttribute("aria-label", `Listen to ${recording.title}`);
  mapPreview.hidden = false;
  positionMapRecordingPreview();

  if (changed) {
    mapPreviewThumbMap = renderPlayerMapThumbnail(mapPreviewThumbnail, mapPreviewThumbMap, recording);
    mapPreviewAnimation?.cancel();

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mapPreviewAnimation = mapPreview.animate([
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 190, easing: "ease-out" });
    }
  }

  mapPreview.focus({ preventScroll: true });
}

function closeMapRecordingPreview(restoreFocus = false) {
  const markerElement = mapPreviewMarker?.getElement();
  markerElement?.classList.remove("is-selected");
  mapPreviewRecording = null;
  mapPreviewMarker = null;
  mapPreview.hidden = true;
  mapPreviewAnimation?.cancel();
  mapPreviewAnimation = null;

  if (mapPreviewThumbMap) {
    mapPreviewThumbMap.remove();
    mapPreviewThumbMap = null;
  }

  if (restoreFocus) {
    (markerElement || leafletMapContainer).focus({ preventScroll: true });
  }
}