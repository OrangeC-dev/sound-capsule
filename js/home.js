let homeFeaturedThumbMap = null;

function getHomeFeaturedMemory() {
  const memory = (collectionMemories.dublinParks || []).find(function(item) {
    return item.title === "Sunday Bells";
  });

  if (!memory) {
    return null;
  }

  return addCollectionContext(memory, "dublinParks", "Parks & Gardens");
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