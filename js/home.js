let homeFeaturedThumbMap = null;

function getHomeFeaturedMemory() {
  const playableMemories = [];

  Object.keys(collectionMemories).forEach(function(collectionId) {
    const collection = getExploreCollectionById(collectionId);
    const memories = collectionMemories[collectionId] || [];

    memories.forEach(function(memory) {
      if (!memory.audio || memory.duration === "Coming soon") {
        return;
      }

      playableMemories.push(
        addCollectionContext(
          memory,
          collectionId,
          collection ? collection.name : ""
        )
      );
    });
  });

  if (!playableMemories.length) {
    return null;
  }

  return playableMemories[Math.floor(Math.random() * playableMemories.length)];
}

function renderHomeFeaturedContent(memory) {
  const featuredName = document.getElementById("home-featured-name");
  const featuredLocation = document.getElementById("home-featured-location");
  const featuredRegion = document.getElementById("home-featured-region");
  const featuredDuration = document.getElementById("home-featured-duration");

  if (!memory) {
    return;
  }

  const region = memory.cityCountry || [
    memory.city || memory.town,
    memory.country
  ].filter(Boolean).join(", ");

  if (featuredName) {
    featuredName.textContent = memory.title;
  }

  if (featuredLocation) {
    featuredLocation.textContent = memory.location || "Sound Capsule";
  }

  if (featuredRegion) {
    featuredRegion.textContent = region || "Sound Capsule";
  }

  if (featuredDuration) {
    featuredDuration.textContent = memory.duration || "0:00";
  }
}

function setHomeFeaturedButtonData(button, memory) {
  const memoryId = createMemoryId(memory);

  memoryStore.set(memoryId, memory);

  button.dataset.title = memory.title;
  button.dataset.location = memory.location || "";
  button.dataset.city = memory.cityCountry || "";
  button.dataset.image = memory.image || "";
  button.dataset.audio = memory.audio || "";
  button.dataset.duration = memory.duration || "0:00";
  button.dataset.memoryId = memoryId;
  button.dataset.playerConnected = "true";

  button.setAttribute("aria-label", `Play ${memory.title}`);
}

function renderHomeFeaturedThumbnail(memory) {
  const featuredThumb = document.getElementById("home-featured-thumb");

  if (!featuredThumb || !memory) {
    return;
  }

  homeFeaturedThumbMap = renderPlayerMapThumbnail(
    featuredThumb,
    homeFeaturedThumbMap,
    memory
  );
}

function setupHomeInteractions() {
  const featuredCard = document.getElementById("home-featured-card");
  const featuredPlayButton = document.getElementById("home-featured-play");
  const featuredMemory = getHomeFeaturedMemory();

  if (featuredCard && featuredPlayButton && featuredMemory) {
    renderHomeFeaturedContent(featuredMemory);
    setHomeFeaturedButtonData(featuredPlayButton, featuredMemory);
    renderHomeFeaturedThumbnail(featuredMemory);

    featuredCard.addEventListener("click", function() {
      openMemoryInCapsuleView(featuredPlayButton);
    });

    featuredCard.addEventListener("keydown", function(event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openMemoryInCapsuleView(featuredPlayButton);
    });

    featuredPlayButton.addEventListener("click", function(event) {
      event.stopPropagation();
      playMemory(featuredPlayButton);
    });
  }

  document.querySelectorAll("[data-home-collection-id]").forEach(function(button) {
    button.addEventListener("click", function() {
      setAppSection("explore");
      renderExploreCollectionList(button.dataset.homeCollectionId);
    });
  });
}