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

  const collectionButtons = Array.from(
    document.querySelectorAll("[data-home-collection-id]")
  );
  const shuffledButtons = [...collectionButtons];

  for (let index = shuffledButtons.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledButtons[index], shuffledButtons[randomIndex]] =
      [shuffledButtons[randomIndex], shuffledButtons[index]];
  }

  const visibleButtons = new Set(shuffledButtons.slice(0, 3));

  collectionButtons.forEach(function(button) {
    button.hidden = !visibleButtons.has(button);

    const collectionId = button.dataset.homeCollectionId;
    const collection = getExploreCollectionById(collectionId);
    const count = getCollectionCapsuleCount(collectionId);
    const countLabel = button.querySelector("small");
    const thumbnailImages = [...new Set(
      exploreCollections
        .filter(function(source) {
          return collection && source.theme === collection.theme && source.image;
        })
        .map(function(source) {
          return source.image;
        })
    )];

    if (thumbnailImages.length) {
      const randomIndex = Math.floor(Math.random() * thumbnailImages.length);
      const imageUrl = new URL(thumbnailImages[randomIndex], document.baseURI).href;
      button.style.setProperty("--home-card-image", `url("${imageUrl}")`);
    }

    if (countLabel) {
      countLabel.textContent = `${count} ${count === 1 ? "Capsule" : "Capsules"}`;
    }

    button.addEventListener("click", function() {
      renderExploreCollectionList(collectionId);
    });
  });
}