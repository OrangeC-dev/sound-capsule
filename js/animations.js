let currentMapView = "world";

// This remembers where the user came from, so the  Back button can zoom out.
let viewHistory = [];

function createMapPin(pinData) {
  const pin = document.createElement("button");

  // The second class lets CSS style countries, cities, and collections differently.
  pin.className = `map-pin ${pinData.type}-pin`;

  pin.type = "button";
  pin.setAttribute("aria-label", pinData.title);

  pin.style.setProperty("--x", pinData.mapPosition.x);
  pin.style.setProperty("--y", pinData.mapPosition.y);

  pin.addEventListener("click", function() {
    if (pinData.type === "country" || pinData.type === "city") {
      transitionToMapView(pinData.nextView, pinData);
    }

    if (pinData.type === "collection") {
      renderCollection(pinData.collectionId, pinData.title);
    }
  });

  return pin;
}

function transitionToMapView(viewName, pinData) {
  viewHistory.push(currentMapView);

  moveCurrentCamera(pinData, "forward");

  setTimeout(function() {
    renderMapView(viewName, {
      direction: "forward",
      pinData: pinData
    });
  }, 180);
}

function transitionToCollection(pinData) {
  moveCurrentCamera(pinData, "forward");

  setTimeout(function() {
    renderCollection(pinData.collectionId, pinData.title);
    resetCameraMotion();
  }, 500);
}

function moveCurrentCamera(pinData, direction) {
  const mapCamera = memoryMap.querySelector(".map-camera");

  if (!mapCamera) {
    return;
  }

  setCameraMotionValues(mapCamera, pinData);

  mapCamera.classList.remove("is-moving-forward", "is-moving-backward");

  // This forces the browser to notice the class change before animating.
  mapCamera.offsetHeight;

  if (direction === "backward") {
    mapCamera.classList.add("is-moving-backward");
  } else {
    mapCamera.classList.add("is-moving-forward");
  }
}

function resetCameraMotion() {
  const mapCamera = memoryMap.querySelector(".map-camera");

  if (!mapCamera) {
    return;
  }

  mapCamera.classList.remove("is-moving-forward", "is-moving-backward");
}

function setCameraMotionValues(mapCamera, pinData) {
  const x = parseFloat(pinData.mapPosition.x);
  const y = parseFloat(pinData.mapPosition.y);

  const moveX = (50 - x) * 0.9;
  const moveY = (50 - y) * 0.9;

  mapCamera.style.setProperty("--zoom-origin-x", pinData.mapPosition.x);
  mapCamera.style.setProperty("--zoom-origin-y", pinData.mapPosition.y);
  mapCamera.style.setProperty("--zoom-move-x", `${moveX}%`);
  mapCamera.style.setProperty("--zoom-move-y", `${moveY}%`);

  mapCamera.style.setProperty("--arrival-move-x", `${moveX * -0.35}%`);
  mapCamera.style.setProperty("--arrival-move-y", `${moveY * -0.35}%`);
}

function goBackMapView() {
  if (viewHistory.length === 0) {
    return;
  }

  const previousView = viewHistory.pop();

  const centrePin = {
    mapPosition: { x: "50%", y: "50%" }
  };

  moveCurrentCamera(centrePin, "backward");

  setTimeout(function() {
    renderMapView(previousView, {
      direction: "backward",
      pinData: centrePin
    });
  }, 180);
}

function createBackButton() {
  const backButton = document.createElement("button");
  backButton.className = "map-back-button";
  backButton.type = "button";
  backButton.textContent = "Back";

  backButton.addEventListener("click", function() {
    goBackMapView();
  });

  return backButton;
}

function renderMapView(viewName, transitionInfo) {
  const view = mapViews[viewName];

  // Safety check in case a view name is misspelled.
  if (!view) {
    nowPlayingText.textContent = `${viewName} view does not exist yet.`;
    return;
  }

  currentMapView = viewName;

  // These classes let CSS change the map mood for each level.
  memoryMap.className = `memory-map map-view-${viewName}`;

  // Clear the old pins from the map
  memoryMap.innerHTML = "";

  // Clear the old cards when moving between map levels.
  capsuleGrid.innerHTML = "";

  // Update the visible headings.
  setMapPageHeading();
  memoryTitle.textContent = "Field recording and notes";

  // Update the listening panel with navigation text.
  nowPlayingText.textContent = view.description;

  // Add a Back button on every level after World View.
  if (viewName !== "world") {
    memoryMap.appendChild(createBackButton());
  }

  // This is the moving inner map layer.
  // The frame stays still; this layer zooms and slides
  const mapCamera = document.createElement("div");
mapCamera.className = "map-camera";

if (transitionInfo) {
  setCameraMotionValues(mapCamera, transitionInfo.pinData);

  if (transitionInfo.direction === "backward") {
    mapCamera.classList.add("is-arriving-backward");
  } else {
    mapCamera.classList.add("is-arriving-forward");
  }
}

memoryMap.appendChild(mapCamera);

requestAnimationFrame(function() {
  mapCamera.classList.remove("is-arriving-forward", "is-arriving-backward");
});

  // Create the new pins inside the movng map layer.
  view.pins.forEach(function(pinData) {
    mapCamera.appendChild(createMapPin(pinData));
  });
}