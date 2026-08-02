(() => {
  "use strict";

  const data = window.SHIN_SITE || {};
  const site = data.site || {};
  const characters = Array.isArray(data.characters) ? data.characters : [];
  const artworks = Array.isArray(data.artworks) ? data.artworks : [];

  const all = (selector) => Array.from(document.querySelectorAll(selector));
  const one = (selector) => document.querySelector(selector);
  const setText = (selector, value) => {
    if (value == null || value === "") return;
    all(selector).forEach((element) => { element.textContent = value; });
  };

  setText("[data-site-name]", site.name);
  setText("[data-short-name]", site.shortName || site.name);
  setText("[data-artist-name]", site.artistName);
  setText("[data-site-handle]", site.handle);
  setText("[data-site-intro]", site.intro);
  setText("[data-profile-blurb]", site.profileBlurb);
  setText("[data-commission-status]", site.commissionStatus);
  setText("[data-commission-note]", site.commissionNote);

  all("[data-commission-email]").forEach((link) => {
    if (site.email) link.href = `mailto:${site.email}`;
  });

  all("[data-social-links]").forEach((container) => {
    container.replaceChildren();
    (site.socialLinks || []).forEach((social) => {
      const link = document.createElement("a");
      link.href = social.url;
      link.textContent = social.label;
      link.target = "_blank";
      link.rel = "noreferrer";
      container.append(link);
    });
  });

  const specialties = one("[data-specialties]");
  if (specialties && Array.isArray(site.specialties)) {
    specialties.replaceChildren();
    site.specialties.slice(0, 4).forEach((specialty) => {
      const span = document.createElement("span");
      span.textContent = specialty;
      specialties.append(span);
    });
  }

  const featuredCharacter = characters.find((character) => character.featured) || characters[0];
  if (featuredCharacter) {
    const portrait = one("[data-home-portrait]");
    const caption = one("[data-home-portrait-caption]");
    if (portrait) {
      portrait.src = featuredCharacter.image;
      portrait.alt = `${featuredCharacter.name}, ${featuredCharacter.species}`;
    }
    if (caption) caption.textContent = `${featuredCharacter.name} — ${featuredCharacter.species}`;
  }

  const artDialog = one("#art-dialog");
  const openArtwork = (artwork) => {
    if (!artDialog || !artwork) return;
    const image = one("[data-art-dialog-image]");
    const title = one("[data-art-dialog-title]");
    const meta = one("[data-art-dialog-meta]");
    if (image) {
      image.src = artwork.image;
      image.alt = artwork.alt || artwork.title;
    }
    if (title) title.textContent = artwork.title;
    if (meta) meta.textContent = [artwork.character, artwork.year].filter(Boolean).join(" · ");
    artDialog.showModal();
  };

  const showcase = one("[data-home-showcase]");
  if (showcase) {
    showcase.replaceChildren();
    artworks.slice(0, 7).forEach((artwork, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `studio-art studio-art--${(index % 6) + 1}`;
      button.setAttribute("aria-label", `View ${artwork.title}`);

      const image = document.createElement("img");
      image.src = artwork.image;
      image.alt = artwork.alt || artwork.title;
      image.loading = index > 1 ? "lazy" : "eager";

      const label = document.createElement("span");
      const strong = document.createElement("strong");
      strong.textContent = artwork.title;
      const small = document.createElement("small");
      small.textContent = [artwork.character, artwork.year].filter(Boolean).join(" · ");
      label.append(strong, small);
      button.append(image, label);
      button.addEventListener("click", () => openArtwork(artwork));
      showcase.append(button);
    });
  }

  const characterDialog = one("#character-dialog");
  const characterContent = one("[data-character-dialog-content]");
  const openCharacter = (character) => {
    if (!characterDialog || !characterContent || !character) return;
    characterContent.replaceChildren();

    const visual = document.createElement("div");
    visual.className = "character-dialog__visual";
    const image = document.createElement("img");
    image.src = character.image;
    image.alt = character.name;
    visual.append(image);

    const copy = document.createElement("div");
    copy.className = "character-dialog__copy";
    const name = document.createElement("h2");
    name.textContent = character.name;
    const species = document.createElement("p");
    species.className = "character-dialog__species";
    species.textContent = [character.species, character.pronouns].filter(Boolean).join(" · ");
    const bio = document.createElement("p");
    bio.textContent = character.bio || character.tagline || "";
    copy.append(name, species, bio);

    if (Array.isArray(character.palette) && character.palette.length) {
      const palette = document.createElement("div");
      palette.className = "palette";
      character.palette.forEach((color) => {
        const swatch = document.createElement("span");
        swatch.style.setProperty("--swatch", color);
        swatch.title = color;
        palette.append(swatch);
      });
      copy.append(palette);
    }

    characterContent.append(visual, copy);
    characterDialog.showModal();
  };

  const characterRow = one("[data-home-characters]");
  if (characterRow) {
    characterRow.replaceChildren();
    characters.slice(0, 4).forEach((character, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `studio-character studio-character--${index + 1}`;
      button.setAttribute("aria-label", `Open ${character.name}'s profile`);

      const image = document.createElement("img");
      image.src = character.image;
      image.alt = character.name;
      image.loading = "lazy";

      const copy = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = character.name;
      const species = document.createElement("small");
      species.textContent = character.species || character.role || "Character";
      copy.append(name, species);
      button.append(image, copy);
      button.addEventListener("click", () => openCharacter(character));
      characterRow.append(button);
    });
  }

  all("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
  all("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const menuButton = one("[data-menu-toggle]");
  const navigation = one("[data-site-nav]");
  menuButton?.addEventListener("click", () => {
    const open = navigation?.dataset.open !== "true";
    if (navigation) navigation.dataset.open = String(open);
    menuButton.setAttribute("aria-expanded", String(open));
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = all(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }
})();
