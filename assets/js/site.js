(() => {
  "use strict";

  const data = window.SHIN_SITE;
  const pageConfig = window.SHIN_PAGES || { options: {}, items: [] };
  const customPages = window.SHIN_CUSTOM_PAGES || {};
  if (!data) return;

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalizePath = (value = "/") => {
    let path = String(value).split("?")[0].split("#")[0] || "/";
    if (!path.startsWith("/")) path = `/${path}`;
    if (!path.includes(".") && !path.endsWith("/")) path += "/";
    return path.replace(/\/+/g, "/");
  };

  function flattenPages(items, parents = [], parentEnabled = true, output = []) {
    (items || []).forEach((page) => {
      const effectiveEnabled = parentEnabled && page.enabled !== false;
      const record = {
        ...page,
        path: normalizePath(page.path),
        parentIds: [...parents],
        effectiveEnabled
      };
      output.push(record);
      flattenPages(page.children || [], [...parents, page.id], effectiveEnabled, output);
    });
    return output;
  }

  const pages = flattenPages(pageConfig.items || []);
  const pageById = new Map(pages.map((page) => [page.id, page]));
  const pageByPath = new Map(pages.map((page) => [page.path, page]));
  const currentPageId = document.body.dataset.page || "";
  const currentPage = pageById.get(currentPageId) || pageByPath.get(normalizePath(location.pathname));
  const isVisible = (page) => Boolean(page && page.effectiveEnabled);

  function configuredChildren(page) {
    return (page?.children || []).map((child) => pageById.get(child.id)).filter(Boolean);
  }

  function setMetadata(page) {
    if (!page) return;
    if (page.title) document.title = page.title;
    const description = qs('meta[name="description"]');
    if (description && page.description) description.content = page.description;
  }

  function applySiteContent() {
    const values = {
      "[data-site-name]": data.site.name,
      "[data-short-name]": data.site.shortName,
      "[data-artist-name]": data.site.artistName,
      "[data-site-handle]": data.site.handle,
      "[data-site-intro]": data.site.intro,
      "[data-profile-blurb]": data.site.profileBlurb,
      "[data-commission-status]": data.site.commissionStatus,
      "[data-commission-note]": data.site.commissionNote,
      "[data-fursuit-status]": data.site.fursuitStatus,
      "[data-fursuit-note]": data.site.fursuitNote
    };

    Object.entries(values).forEach(([selector, value]) => {
      qsa(selector).forEach((element) => { element.textContent = value; });
    });

    qsa("[data-email-link]").forEach((element) => {
      element.textContent = data.site.email;
      element.href = `mailto:${data.site.email}`;
    });

    qsa("[data-commission-email]").forEach((element) => {
      element.href = `mailto:${data.site.email}?subject=Commission%20request`;
    });

    qsa("[data-social-links]").forEach((element) => {
      element.innerHTML = data.site.socialLinks
        .map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`)
        .join("");
    });
  }

  function navLink(page, className = "") {
    const active = currentPage && (currentPage.id === page.id || currentPage.parentIds.includes(page.id));
    return `<a class="${className}" href="${esc(page.path)}"${active ? ' aria-current="page"' : ""}>${esc(page.label)}</a>`;
  }

  function renderNavigation() {
    const nav = qs("[data-site-nav]");
    if (!nav) return;

    const topLevel = (pageConfig.items || [])
      .map((item) => pageById.get(item.id))
      .filter((page) => page && page.menu !== false && isVisible(page));

    const renderNode = (page) => {
      const children = configuredChildren(page).filter((child) => child.menu !== false && isVisible(child));
      if (!children.length) return navLink(page);
      return `<div class="site-nav__group">${navLink(page, "site-nav__parent")}<div class="site-nav__submenu">${children.map(renderNode).join("")}</div></div>`;
    };

    const links = topLevel.map(renderNode);
    const cta = pageConfig.options?.cta || {};
    const ctaPage = pageById.get(cta.page);
    if (isVisible(ctaPage)) links.push(`<a class="nav-cta" href="${esc(ctaPage.path)}">${esc(cta.label || ctaPage.label)}</a>`);
    nav.innerHTML = links.join("");
  }

  function renderFooter() {
    const links = qs("[data-footer-links]");
    if (!links) return;
    const pageLinks = pages
      .filter((page) => page.id !== "home" && page.footer !== false && isVisible(page))
      .map((page) => `<a href="${esc(page.path)}">${esc(page.label)}</a>`);
    const socials = data.site.socialLinks.map((link) => `<a href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`);
    links.innerHTML = [...pageLinks, ...socials].join("");
  }

  function renderHomeRoutes() {
    const grid = qs("[data-route-grid]");
    if (!grid) return;
    const routePages = pages
      .filter((page) => isVisible(page) && page.homeCard?.show)
      .sort((a, b) => (a.homeCard?.order ?? 999) - (b.homeCard?.order ?? 999));

    grid.innerHTML = routePages.map((page) => `
      <a class="route-card" href="${esc(page.path)}">
        <span>${esc(page.homeCard?.eyebrow || page.description || "Open page")}</span>
        <strong>${esc(page.label)}</strong>
        <i aria-hidden="true">→</i>
      </a>`).join("");
  }

  function applyConfiguredLinks() {
    qsa("[data-page-link]").forEach((link) => {
      const page = pageById.get(link.dataset.pageLink);
      link.hidden = !isVisible(page);
      if (isVisible(page)) link.href = page.path;
    });

    qsa('a[href^="/"]').forEach((link) => {
      const target = pageByPath.get(normalizePath(link.getAttribute("href")));
      if (target && !isVisible(target)) link.hidden = true;
    });
  }

  function initNavigation() {
    const toggle = qs("[data-menu-toggle]");
    const nav = qs("[data-site-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.dataset.open = String(!open);
    });
  }

  function renderDisabledPage(page) {
    const main = qs("main");
    if (!main) return;
    if (pageConfig.options?.disabledBehavior === "redirect") {
      location.replace(pageConfig.options.disabledRedirect || "/");
      return;
    }
    main.innerHTML = `<section class="disabled-page"><h1>${esc(pageConfig.options?.disabledTitle || "This page is not published yet.")}</h1><p>${esc(pageConfig.options?.disabledMessage || "The content is saved, but it is currently hidden.")}</p><a class="button" href="/">Back home</a></section>`;
  }

  function characterCard(character) {
    const searchable = [character.name, character.species, character.role, ...(character.tags || [])].join(" ").toLowerCase();
    return `<article class="character-card" data-character-category="${esc(character.category)}" data-character-searchable="${esc(searchable)}">
      <button type="button" data-character-id="${esc(character.id)}">
        <span class="character-card__image"><img src="${esc(character.image)}" alt="${esc(character.name)}" loading="lazy"></span>
        <span class="character-card__copy"><strong>${esc(character.name)}</strong><small>${esc(character.species)} · ${esc(character.pronouns)}</small></span>
      </button>
    </article>`;
  }

  function renderCharacters() {
    const grid = qs("[data-character-grid]");
    if (!grid) return;
    grid.innerHTML = data.characters.map(characterCard).join("");
    const count = qs("[data-character-count]");
    if (count) count.textContent = String(data.characters.length);
    qsa("[data-character-id]", grid).forEach((button) => button.addEventListener("click", () => openCharacter(button.dataset.characterId)));
    initCharacterDirectory();
  }

  function openCharacter(id) {
    const character = data.characters.find((item) => item.id === id);
    const dialog = qs("#character-dialog");
    const root = qs("[data-character-dialog-content]", dialog);
    if (!character || !dialog || !root) return;
    const toyhouseLink = character.toyhouse
      ? `<a class="text-link" href="${esc(character.toyhouse)}" target="_blank" rel="noreferrer">Toyhouse profile</a>`
      : "";
    root.innerHTML = `<div class="character-dialog__visual"><img src="${esc(character.image)}" alt="${esc(character.name)}"></div>
      <div class="character-dialog__copy"><h2>${esc(character.name)}</h2><p class="character-dialog__species">${esc(character.species)} · ${esc(character.pronouns)}</p><p>${esc(character.bio)}</p>
      <dl class="fact-grid">${(character.facts || []).map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join("")}</dl>
      <div class="palette">${(character.palette || []).map((color) => `<span title="${esc(color)}" style="--swatch:${esc(color)}"></span>`).join("")}</div>
      ${toyhouseLink}</div>`;
    dialog.showModal();
  }

  function initCharacterDirectory() {
    const buttons = qsa("[data-character-filter]");
    const input = qs("[data-character-search]");
    const empty = qs("[data-character-empty]");
    let filter = "all";
    let term = "";

    const apply = () => {
      let visible = 0;
      qsa(".character-card").forEach((card) => {
        const show = (filter === "all" || card.dataset.characterCategory === filter)
          && (!term || card.dataset.characterSearchable.includes(term));
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    };

    buttons.forEach((button) => button.addEventListener("click", () => {
      filter = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      apply();
    }));
    if (input) input.addEventListener("input", () => { term = input.value.trim().toLowerCase(); apply(); });
  }

  function artworkCard(artwork) {
    const mature = artwork.mature === true;
    return `<article class="gallery-card${mature ? " gallery-card--mature" : ""}" data-gallery-category="${esc(artwork.category)}" data-gallery-mature="${mature}">
      <button type="button" data-artwork-id="${esc(artwork.id)}" data-mature="${mature}" aria-label="View ${esc(artwork.title)}">
        <span class="gallery-card__media"><img src="${esc(artwork.image)}" alt="${esc(artwork.alt)}" loading="lazy">${mature ? '<span class="mature-cover"><strong>Mature</strong><small>Tap to reveal</small></span>' : ""}</span>
        <span class="gallery-card__caption"><strong>${esc(artwork.title)}</strong><small>${esc(artwork.character)} · ${esc(artwork.year)}</small></span>
      </button>
    </article>`;
  }

  function renderGallery() {
    const grid = qs("[data-gallery-grid]");
    if (!grid) return;
    let artworks = [...data.artworks];
    if (grid.dataset.featuredOnly === "true") artworks = artworks.filter((artwork) => artwork.featured && !artwork.mature);
    const limit = Number(grid.dataset.limit || artworks.length);
    grid.innerHTML = artworks.slice(0, limit).map(artworkCard).join("");
    qsa("[data-artwork-id]", grid).forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.mature === "true" && button.dataset.revealed !== "true") {
          button.dataset.revealed = "true";
          return;
        }
        openArtwork(button.dataset.artworkId);
      });
    });
    initFilters("[data-gallery-filter]", ".gallery-card", "galleryCategory");
  }

  function openArtwork(id) {
    const artwork = data.artworks.find((item) => item.id === id);
    const dialog = qs("#art-dialog");
    if (!artwork || !dialog) return;
    const image = qs("[data-art-dialog-image]", dialog);
    image.src = artwork.full || artwork.image;
    image.alt = artwork.alt;
    qs("[data-art-dialog-title]", dialog).textContent = artwork.title;
    qs("[data-art-dialog-meta]", dialog).textContent = `${artwork.category} · ${artwork.character} · ${artwork.year}`;
    dialog.showModal();
  }

  function renderFursuits() {
    const builds = qs("[data-build-grid]");
    if (builds) {
      builds.innerHTML = (data.fursuitProjects || []).map((project) => `<article class="build-card"><img src="${esc(project.image)}" alt="${esc(project.title)}" loading="lazy"><div><small>${esc(project.phase)} · ${esc(project.status)}</small><h3>${esc(project.title)}</h3><p>${esc(project.description)}</p></div></article>`).join("");
    }
  }

  function renderCommissions() {
    const packages = qs("[data-commission-packages]");
    if (packages) packages.innerHTML = data.commissions.map((commission) => `<article class="price-card">
      ${commission.image ? (commission.mature ? `<details class="price-card__mature"><summary>Mature example</summary><img class="price-card__image" src="${esc(commission.image)}" alt="Mature example of ${esc(commission.name)}" loading="lazy"></details>` : `<img class="price-card__image" src="${esc(commission.image)}" alt="Example of ${esc(commission.name)}" loading="lazy">`) : ""}
      <div class="price-card__body"><div class="price-card__heading"><h2>${esc(commission.name)}</h2><strong>${esc(commission.price)}</strong></div><p>${esc(commission.description)}</p><ul>${(commission.includes || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>
    </article>`).join("");
  }

  function renderCustomPage(page) {
    const root = qs("[data-generic-page]");
    if (!root || !page) return;
    const content = customPages[page.id];
    if (!content) {
      root.innerHTML = `<section class="disabled-page"><p class="eyebrow">Empty page</p><h1>${esc(page.label)}</h1><p>Add this page's content in <code>config/custom-pages.js</code>.</p></section>`;
      return;
    }
    const hero = content.hero || {};
    root.innerHTML = `<section class="page-hero"><div class="page-hero__inner"><p class="eyebrow">${esc(hero.eyebrow || page.label)}</p><h1>${esc(hero.title || page.label)}</h1><p>${esc(hero.intro || page.description || "")}</p></div></section>${(content.sections || []).map(renderCustomSection).join("")}`;
  }

  function sectionHeading(section) {
    return `<header class="section__header"><div><p class="eyebrow">${esc(section.eyebrow || "")}</p><h2>${esc(section.title || "")}</h2></div>${section.intro ? `<p>${esc(section.intro)}</p>` : ""}</header>`;
  }

  function renderCustomSection(section) {
    const heading = sectionHeading(section);
    if (section.type === "text") return `<section class="section"><div class="section__inner generic-prose">${heading}<div class="generic-prose__body">${(section.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}</div></div></section>`;
    if (section.type === "cards") return `<section class="section"><div class="section__inner">${heading}<div class="generic-card-grid">${(section.items || []).map((item) => `<article class="generic-card"><small>${esc(item.meta || "")}</small><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
    if (section.type === "gallery") return `<section class="section"><div class="section__inner">${heading}<div class="generic-gallery">${(section.items || []).map((item) => `<figure><img src="${esc(item.image)}" alt="${esc(item.alt || item.title)}" loading="lazy"><figcaption><strong>${esc(item.title)}</strong><p>${esc(item.text || "")}</p></figcaption></figure>`).join("")}</div></div></section>`;
    if (section.type === "timeline") return `<section class="section"><div class="section__inner">${heading}<div class="process-grid">${(section.items || []).map((item) => `<article class="process-step"><span>${esc(item.number)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join("")}</div></div></section>`;
    if (section.type === "links") {
      const targets = (section.pages || []).map((id) => pageById.get(id)).filter(isVisible);
      return `<section class="section"><div class="section__inner">${heading}<div class="route-grid">${targets.map((page) => `<a class="route-card" href="${esc(page.path)}"><span>${esc(page.description || "Open page")}</span><strong>${esc(page.label)}</strong><i>→</i></a>`).join("")}</div></div></section>`;
    }
    if (section.type === "callout") return `<section class="section"><div class="section__inner"><div class="callout"><p class="eyebrow">${esc(section.eyebrow || "")}</p><h2>${esc(section.title || "")}</h2><p>${esc(section.text || "")}</p></div></div></section>`;
    return "";
  }

  function initFilters(buttonSelector, cardSelector, key) {
    const buttons = qsa(buttonSelector);
    buttons.forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      qsa(cardSelector).forEach((card) => {
        const matches = filter === "all" || (filter === "mature" && card.dataset.galleryMature === "true") || card.dataset[key] === filter;
        card.hidden = !matches;
      });
    }));
  }

  function initDialogs() {
    qsa("dialog").forEach((dialog) => {
      qsa("[data-dialog-close]", dialog).forEach((button) => button.addEventListener("click", () => dialog.close()));
      dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    });
  }

  function initCopyEmail() {
    const button = qs("[data-copy-email]");
    if (!button) return;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.site.email);
        const old = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = old; }, 1200);
      } catch {
        location.href = `mailto:${data.site.email}`;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setMetadata(currentPage);
    applySiteContent();
    renderNavigation();
    renderFooter();
    renderHomeRoutes();
    applyConfiguredLinks();
    initNavigation();

    if (currentPage && !isVisible(currentPage)) {
      renderDisabledPage(currentPage);
      return;
    }

    renderCustomPage(currentPage);
    renderCharacters();
    renderGallery();
    renderFursuits();
    renderCommissions();
    applyConfiguredLinks();
    initDialogs();
    initCopyEmail();
  });
})();
