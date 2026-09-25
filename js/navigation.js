function setMapPageHeading() {
  mapTitle.textContent = "Sound Map";
  mapSubtitle.textContent = "Explore places through their sounds.";
}

function setExplorePageHeading() {
  memoryTitle.textContent = "Dublin";
  memorySubtitle.textContent = "The sound of a city, captured in time.";
}

function setAppSection(sectionName) {
  currentAppSection = sectionName;

  appNavButtons.forEach(function(button) {
    button.classList.toggle("is-active", button.dataset.appSection === sectionName);
  });

  homeView.hidden = sectionName !== "home";
  mapSection.hidden = sectionName !== "map";
  memorySection.hidden = sectionName !== "explore" && sectionName !== "collections";
  exploreFilterRow.hidden = sectionName !== "explore";
  savedView.hidden = sectionName !== "saved";
  profileView.hidden = sectionName !== "profile";

  capsuleView.hidden = true;
  document.body.classList.remove("has-capsule-view");

  if (sectionName === "map") {
    setMapPageHeading();
    memorySection.hidden = true;
    capsuleGrid.innerHTML = "";
    memoryTitle.textContent = "Explore";
    memorySubtitle.textContent = "Browse sound capsules across places and collections.";
    nowPlayingText.textContent = "Choose a country to begin.";
  }

  if (sectionName === "map" && realMap) {
    window.setTimeout(function() {
      realMap.invalidateSize();
    }, 80);
  }

  if (sectionName !== "map") {
    appContent.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function setupAppNavigation() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenuIcon = mobileMenuToggle
    ? mobileMenuToggle.querySelector(".ph")
    : null;

  function setMobileMenuState(isOpen) {
    document.body.classList.toggle("is-mobile-menu-open", isOpen);

    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
      mobileMenuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    }

    if (mobileMenuIcon) {
      mobileMenuIcon.classList.toggle("ph-list", !isOpen);
      mobileMenuIcon.classList.toggle("ph-x", isOpen);
    }
  }

  function closeMobileMenu() {
    setMobileMenuState(false);
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function(event) {
      event.stopPropagation();

      const isOpen = !document.body.classList.contains("is-mobile-menu-open");
      setMobileMenuState(isOpen);
    });

    document.addEventListener("click", function(event) {
      const sidebar = mobileMenuToggle.closest(".app-sidebar");

      if (sidebar && !sidebar.contains(event.target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", function(event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  appNavButtons.forEach(function(button) {
    button.addEventListener("click", function() {
      const sectionName = button.dataset.appSection;

      setAppSection(sectionName);
      closeMobileMenu();

      if (sectionName === "explore") {
        renderExploreMemories();
      }

      if (sectionName === "collections") {
        renderCollection("dublinStreets", "Dublin Streets");
      }
    });
  });

  homeLink.addEventListener("click", function() {
    setAppSection("home");
    closeMobileMenu();
  });

  homeExploreLink.addEventListener("click", function() {
    setAppSection("explore");
    renderExploreMemories();
    closeMobileMenu();
  });
}