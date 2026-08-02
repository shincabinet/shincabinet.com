(() => {
  "use strict";

  const data = window.SHIN_SITE;
  const pageConfig = window.SHIN_PAGES || { options: {}, items: [] };
  const customPages = window.SHIN_CUSTOM_PAGES || {};

  if (!data) {
    console.error("SHIN_SITE content data is missing.");
    return;
  }

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

  function flattenPages(items, parentIds = [], parentEnabled = true, depth = 0, output = []) {
    (items || []).forEach((page, index) => {
      const effectiveEnabled = parentEnabled && page.enabled !== false;
      const record = {
        ...page,
        path: normalizePath(page.path),
        parentIds: [...parentIds],
        effectiveEnabled,
        depth,
        order: index
      };
      output.push(record);
      flattenPages(page.children || [], [...parentIds, page.id], effectiveEnabled, depth + 1, output);
    });
    return output;
  }

  const pages = flattenPages(pageConfig.items || []);
  const pageById = new Map(pages.map(page => [page.id, page]));
  const pageByPath = new Map(pages.map(page => [page.path, page]));
  const currentPageId = document.body.dataset.page || "";
  const currentPage = pageById.get(currentPageId) || pageByPath.get(normalizePath(location.pathname));

  function getConfiguredChildren(page) {
    return (page.children || [])
      .map(child => pageById.get(child.id))
      .filter(Boolean);
  }

  function isVisiblePage(page) {
    return Boolean(page && page.effectiveEnabled);
  }

  function setMetadata(page) {
    if (!page) return;
    if (page.title) document.title = page.title;
    const description = qs('meta[name="description"]');
    if (description && page.description) description.content = page.description;
  }

  function applySiteContent() {
    const map = {
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

    Object.entries(map).forEach(([selector, value]) => {
      qsa(selector).forEach(element => { element.textContent = value; });
    });

    qsa("[data-email-link]").forEach(element => {
      element.textContent = data.site.email;
      element.href = `mailto:${data.site.email}`;
    });

    qsa("[data-commission-email]").forEach(element => {
      element.href = `mailto:${data.site.email}?subject=Commission%20request`;
    });

    qsa("[data-social-links]").forEach(element => {
      element.innerHTML = data.site.socialLinks
        .map(link => `<a href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`)
        .join("");
    });

    qsa("[data-specialties]").forEach(element => {
      element.innerHTML = data.site.specialties.map(item => `<span>${esc(item)}</span>`).join("");
    });
  }

  function navLink(page, extraClass = "") {
    const active = currentPage && (currentPage.id === page.id || currentPage.parentIds.includes(page.id));
    return `<a class="${extraClass}" href="${esc(page.path)}" data-nav-page="${esc(page.id)}"${active ? ' aria-current="page"' : ""}>${esc(page.label)}</a>`;
  }

  function renderNavigation() {
    const nav = qs("[data-site-nav]");
    if (!nav) return;

    nav.setAttribute("aria-label", pageConfig.options?.navigationLabel || "Primary navigation");

    const topLevel = (pageConfig.items || [])
      .map(item => pageById.get(item.id))
      .filter(page => page && page.menu !== false && isVisiblePage(page));

    const renderNavNode = (page, level = 0) => {
      const children = getConfiguredChildren(page)
        .filter(child => child.menu !== false && isVisiblePage(child));

      if (!children.length) return navLink(page);

      return `<div class="site-nav__group site-nav__group--level-${level}">
        ${navLink(page, "site-nav__parent")}
        <div class="site-nav__submenu" aria-label="${esc(page.label)} pages">
          ${children.map(child => renderNavNode(child, level + 1)).join("")}
        </div>
      </div>`;
    };

    const items = topLevel.map(page => renderNavNode(page));

    const cta = pageConfig.options?.cta || {};
    const ctaPage = pageById.get(cta.page);
    if (isVisiblePage(ctaPage)) {
      items.push(`<a class="nav-cta" href="${esc(ctaPage.path)}">${esc(cta.label || ctaPage.label)}</a>`);
    } else if (cta.fallbackToEmail) {
      items.push(`<a class="nav-cta" href="mailto:${esc(data.site.email)}?subject=Commission%20request">${esc(cta.label || "Contact")}</a>`);
    }

    nav.innerHTML = items.join("");
  }

  function renderFooter() {
    const links = qs("[data-footer-links]");
    if (!links) return;

    const pageLinks = pages
      .filter(page => page.footer !== false && page.id !== "home" && isVisiblePage(page))
      .map(page => {
        const prefix = page.parentIds.length
          ? `${page.parentIds.map(id => pageById.get(id)?.label).filter(Boolean).join(" / ")} / `
          : "";
        return `<a class="text-link" href="${esc(page.path)}">${esc(prefix + page.label)} ↗</a>`;
      });

    links.innerHTML = `${pageLinks.join("")}<div data-social-links></div>`;
    const socialContainer = qs("[data-social-links]", links);
    if (socialContainer) {
      socialContainer.innerHTML = data.site.socialLinks
        .map(link => `<a href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.label)}</a>`)
        .join("");
    }
  }

  function renderHomeRoutes() {
    const grid = qs("[data-route-grid]");
    if (!grid) return;

    const routePages = pages
      .filter(page => isVisiblePage(page) && page.homeCard?.show)
      .sort((a, b) => (a.homeCard?.order ?? 999) - (b.homeCard?.order ?? 999));

    grid.innerHTML = routePages.map((page, index) => `
      <a class="route-card reveal" href="${esc(page.path)}">
        <span class="route-card__number">${String(index + 1).padStart(2, "0")}</span>
        <div><p class="eyebrow">${esc(page.homeCard?.eyebrow || page.description || "Open section")}</p><h3>${esc(page.label)}</h3></div>
        <span class="route-card__arrow">↗</span>
      </a>`).join("");

    grid.style.setProperty("--route-count", String(Math.max(1, routePages.length)));

    const heading = qs("[data-route-heading]");
    if (heading) {
      const numberWords = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six" };
      heading.textContent = routePages.length <= 6
        ? `${numberWords[routePages.length] || routePages.length} clear ${routePages.length === 1 ? "door" : "doors"}.`
        : "Choose a drawer.";
    }
  }

  function applyConfiguredLinks() {
    qsa("[data-page-link]").forEach(link => {
      const page = pageById.get(link.dataset.pageLink);
      if (isVisiblePage(page)) {
        link.href = page.path;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    });

    qsa('a[href^="/"]').forEach(link => {
      const target = pageByPath.get(normalizePath(link.getAttribute("href")));
      if (target && !isVisiblePage(target)) link.hidden = true;
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
    const behavior = pageConfig.options?.disabledBehavior || "notice";
    const redirect = pageConfig.options?.disabledRedirect || "/";

    if (behavior === "redirect") {
      location.replace(redirect);
      return false;
    }

    const robots = qs('meta[name="robots"]') || document.head.appendChild(document.createElement("meta"));
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.title = `Closed — ${data.site.name}`;
    document.body.classList.add("page-is-disabled");

    const main = qs("main");
    if (main) {
      main.innerHTML = `<section class="disabled-page">
        <div class="disabled-page__inner reveal is-visible">
          <p class="eyebrow">Cabinet / Unpublished</p>
          <span class="disabled-page__label">${esc(page?.label || "Page")}</span>
          <h1>${esc(pageConfig.options?.disabledTitle || "This drawer is closed.")}</h1>
          <p>${esc(pageConfig.options?.disabledMessage || "This section is not currently published.")}</p>
          <div class="hero__actions">
            <a class="button button--primary" href="/">Return home</a>
            ${isVisiblePage(pageById.get("gallery")) ? `<a class="button button--ghost" href="${esc(pageById.get("gallery").path)}">Open gallery</a>` : ""}
          </div>
        </div>
      </section>`;
    }
    return false;
  }

  function characterCard(character) {
    const search = [character.name, character.species, character.role, character.category, ...character.tags].join(" ").toLowerCase();
    return `<article class="character-card reveal" data-character-category="${esc(character.category)}" data-character-searchable="${esc(search)}"><button class="character-card__button" type="button" data-character-id="${esc(character.id)}" aria-label="Open ${esc(character.name)} details"><span class="character-card__image-wrap"><img class="character-card__image" src="${esc(character.image)}" alt="Portrait of ${esc(character.name)}" loading="lazy"><span class="character-card__role">${esc(character.role)}</span></span><span class="character-card__body"><span class="character-card__species">${esc(character.species)} · ${esc(character.pronouns)}</span><strong>${esc(character.name)}</strong><span>${esc(character.tagline)}</span><span class="mini-tags">${character.tags.slice(0, 3).map(tag => `<i>${esc(tag)}</i>`).join("")}</span><span class="text-link">Open file <span aria-hidden="true">↗</span></span></span></button></article>`;
  }

  function renderCharacters() {
    const grid = qs("[data-character-grid]");
    if (!grid) return;
    const limit = Number(grid.dataset.limit || data.characters.length);
    grid.innerHTML = data.characters.slice(0, limit).map(characterCard).join("");
    qsa("[data-character-id]", grid).forEach(button => button.addEventListener("click", () => openCharacter(button.dataset.characterId)));
    qsa("[data-character-count]").forEach(element => { element.textContent = data.characters.length; });
    initCharacterDirectory();
    observeReveals();
  }

  function openCharacter(id) {
    const character = data.characters.find(item => item.id === id);
    const dialog = qs("#character-dialog");
    if (!character || !dialog) return;

    qs("[data-character-dialog-content]", dialog).innerHTML = `<div class="character-dialog__visual"><img src="${esc(character.image)}" alt="Portrait of ${esc(character.name)}"></div><div class="character-dialog__copy"><p class="eyebrow">${esc(character.role)} · ${esc(character.pronouns)}</p><h2>${esc(character.name)}</h2><p class="character-dialog__species">${esc(character.species)}</p><p>${esc(character.bio)}</p><dl class="fact-grid">${(character.facts || []).map(fact => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join("")}</dl><div class="palette" aria-label="Character color palette">${character.palette.map(color => `<span title="${esc(color)}" style="--swatch:${esc(color)}"><span class="sr-only">${esc(color)}</span></span>`).join("")}</div><div class="tag-list">${character.tags.map(tag => `<span>${esc(tag)}</span>`).join("")}</div><a class="button button--dark" href="${esc(character.toyhouse)}" target="_blank" rel="noreferrer">View Toyhouse profile</a></div>`;
    dialog.showModal();
  }

  function initCharacterDirectory() {
    const buttons = qsa("[data-character-filter]");
    const input = qs("[data-character-search]");
    const cards = () => qsa(".character-card");
    const empty = qs("[data-character-empty]");
    let filter = "all";
    let term = "";

    const apply = () => {
      let count = 0;
      cards().forEach(card => {
        const visible = (filter === "all" || card.dataset.characterCategory === filter)
          && (!term || card.dataset.characterSearchable.includes(term));
        card.hidden = !visible;
        if (visible) count += 1;
      });
      if (empty) empty.hidden = count !== 0;
    };

    buttons.forEach(button => button.addEventListener("click", () => {
      filter = button.dataset.filter;
      buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      apply();
    }));

    if (input) input.addEventListener("input", () => {
      term = input.value.trim().toLowerCase();
      apply();
    });
  }

  function artworkCard(artwork) {
    return `<article class="gallery-card gallery-card--${esc(artwork.size)} reveal" data-gallery-category="${esc(artwork.category)}"><button type="button" data-artwork-id="${esc(artwork.id)}" aria-label="View ${esc(artwork.title)}"><img src="${esc(artwork.image)}" alt="${esc(artwork.alt)}" loading="lazy"><span class="gallery-card__overlay"><span><small>${esc(artwork.category)} · ${esc(artwork.year)}</small><strong>${esc(artwork.title)}</strong></span><span aria-hidden="true">↗</span></span></button></article>`;
  }

  function renderGallery() {
    const grid = qs("[data-gallery-grid]");
    if (!grid) return;
    const limit = Number(grid.dataset.limit || data.artworks.length);
    grid.innerHTML = data.artworks.slice(0, limit).map(artworkCard).join("");
    qsa("[data-artwork-id]", grid).forEach(button => button.addEventListener("click", () => openArtwork(button.dataset.artworkId)));
    initFilters("[data-gallery-filter]", ".gallery-card", "galleryCategory");
    observeReveals();
  }

  function openArtwork(id) {
    const artwork = data.artworks.find(item => item.id === id);
    const dialog = qs("#art-dialog");
    if (!artwork || !dialog) return;
    const image = qs("[data-art-dialog-image]", dialog);
    image.src = artwork.image;
    image.alt = artwork.alt;
    qs("[data-art-dialog-title]", dialog).textContent = artwork.title;
    qs("[data-art-dialog-meta]", dialog).textContent = `${artwork.category} · ${artwork.character} · ${artwork.year}`;
    dialog.showModal();
  }

  function renderDashboard() {
    const stats = qs("[data-dashboard-stats]");
    if (stats) {
      stats.innerHTML = [
        { n: data.characters.length, l: "characters" },
        { n: data.artworks.length, l: "gallery pieces" },
        { n: data.site.commissionStatus, l: "art queue" },
        { n: data.site.fursuitStatus, l: "fursuit queue" }
      ].map(item => `<div><strong>${esc(item.n)}</strong><span>${esc(item.l)}</span></div>`).join("");
    }

    const cast = qs("[data-featured-cast]");
    if (cast) {
      cast.innerHTML = data.characters.filter(character => character.featured).slice(0, 4).map((character, index) => `<button class="cast-tile cast-tile--${index + 1}" type="button" data-character-id="${esc(character.id)}"><img src="${esc(character.image)}" alt="${esc(character.name)}"><span><small>${esc(character.species)}</small><strong>${esc(character.name)}</strong></span></button>`).join("");
      qsa("[data-character-id]", cast).forEach(button => button.addEventListener("click", () => openCharacter(button.dataset.characterId)));
    }

    const latest = qs("[data-latest-strip]");
    if (latest) {
      latest.innerHTML = data.artworks.slice(0, 3).map(artwork => `<button type="button" data-artwork-id="${esc(artwork.id)}"><img src="${esc(artwork.image)}" alt="${esc(artwork.alt)}"><span>${esc(artwork.title)}</span></button>`).join("");
      qsa("[data-artwork-id]", latest).forEach(button => button.addEventListener("click", () => openArtwork(button.dataset.artworkId)));
    }

    const notices = qs("[data-notice-stack]");
    if (notices) notices.innerHTML = data.site.notices.map(notice => `<div class="notice-row"><span>${esc(notice.label)}</span><strong data-tone="${esc(notice.tone)}">${esc(notice.value)}</strong></div>`).join("");
  }

  function renderFursuits() {
    const builds = qs("[data-build-grid]");
    if (builds) builds.innerHTML = data.fursuitProjects.map(project => `<article class="build-card reveal"><img src="${esc(project.image)}" alt="${esc(project.title)} placeholder"><div><span class="build-card__status">${esc(project.status)}</span><p class="eyebrow">${esc(project.phase)}</p><h3>${esc(project.title)}</h3><p>${esc(project.description)}</p></div></article>`).join("");

    const services = qs("[data-fursuit-services]");
    if (services) services.innerHTML = data.fursuitServices.map((service, index) => `<article class="service-card reveal"><span>0${index + 1}</span><h3>${esc(service.name)}</h3><p>${esc(service.text)}</p><strong>${esc(service.availability)}</strong></article>`).join("");

    const process = qs("[data-fursuit-process]");
    if (process) process.innerHTML = data.fursuitProcess.map(step => `<article class="process-step reveal"><span>${esc(step.number)}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></article>`).join("");
    observeReveals();
  }

  function renderCommissions() {
    const packages = qs("[data-commission-packages]");
    if (packages) packages.innerHTML = data.commissions.map((commission, index) => `<article class="price-card reveal ${index === 1 ? "price-card--featured" : ""}"><p class="eyebrow">${esc(commission.eyebrow)}</p><h2>${esc(commission.name)}</h2><p class="price-card__price">${esc(commission.price)}</p><p>${esc(commission.description)}</p><ul>${commission.includes.map(item => `<li>${esc(item)}</li>`).join("")}</ul><a class="text-link" href="mailto:${esc(data.site.email)}?subject=${encodeURIComponent(`${commission.name} commission request`)}">Request this option <span aria-hidden="true">→</span></a></article>`).join("");

    const process = qs("[data-process-grid]");
    if (process) process.innerHTML = data.process.map(step => `<article class="process-step reveal"><span>${esc(step.number)}</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></article>`).join("");
    observeReveals();
  }

  function renderCustomPage(page) {
    const root = qs("[data-generic-page]");
    if (!root || !page) return;
    const content = customPages[page.id];

    if (!content) {
      root.innerHTML = `<section class="disabled-page"><div class="disabled-page__inner reveal is-visible"><p class="eyebrow">Cabinet / Empty file</p><h1>${esc(page.label)}</h1><p>This page exists in the hierarchy, but no custom content has been added in <code>config/custom-pages.js</code>.</p></div></section>`;
      return;
    }

    const hero = content.hero || {};
    const sections = (content.sections || []).map(section => renderCustomSection(section)).join("");
    root.innerHTML = `<section class="page-hero"><div class="page-hero__inner"><div class="reveal"><p class="eyebrow">${esc(hero.eyebrow || `Cabinet / ${page.label}`)}</p><h1>${esc(hero.title || page.label)}</h1></div><div class="page-hero__aside reveal"><p>${esc(hero.intro || page.description || "")}</p></div></div></section>${sections}`;
  }

  function renderCustomSection(section) {
    const heading = `<header class="section__header reveal"><div><p class="eyebrow">${esc(section.eyebrow || "Cabinet file")}</p><h2>${esc(section.title || "")}</h2></div>${section.intro ? `<p>${esc(section.intro)}</p>` : ""}</header>`;

    if (section.type === "text") {
      return `<section class="section"><div class="section__inner generic-prose">${heading}<div class="generic-prose__body reveal">${(section.paragraphs || []).map(paragraph => `<p>${esc(paragraph)}</p>`).join("")}</div></div></section>`;
    }

    if (section.type === "cards") {
      return `<section class="section section--dark"><div class="section__inner">${heading}<div class="generic-card-grid">${(section.items || []).map(item => `<article class="generic-card reveal"><span>${esc(item.meta || "File")}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
    }

    if (section.type === "gallery") {
      return `<section class="section"><div class="section__inner">${heading}<div class="generic-gallery">${(section.items || []).map(item => `<figure class="generic-gallery__item reveal"><img src="${esc(item.image)}" alt="${esc(item.alt || item.title)}" loading="lazy"><figcaption><strong>${esc(item.title)}</strong><p>${esc(item.text || "")}</p></figcaption></figure>`).join("")}</div></div></section>`;
    }

    if (section.type === "timeline") {
      return `<section class="section section--dark"><div class="section__inner">${heading}<div class="process-grid">${(section.items || []).map(item => `<article class="process-step reveal"><span>${esc(item.number)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
    }

    if (section.type === "links") {
      const targets = (section.pages || []).map(id => pageById.get(id)).filter(isVisiblePage);
      return `<section class="section section--dark"><div class="section__inner">${heading}<div class="route-grid">${targets.map((page, index) => `<a class="route-card reveal" href="${esc(page.path)}"><span class="route-card__number">${String(index + 1).padStart(2, "0")}</span><div><p class="eyebrow">${esc(page.description || "Open file")}</p><h3>${esc(page.label)}</h3></div><span class="route-card__arrow">↗</span></a>`).join("")}</div></div></section>`;
    }

    if (section.type === "callout") {
      const target = pageById.get(section.button?.page);
      const button = section.button && isVisiblePage(target)
        ? `<a class="button button--dark" href="${esc(target.path)}">${esc(section.button.label || target.label)}</a>`
        : "";
      return `<section class="section section--orange"><div class="section__inner"><div class="commission-banner reveal"><div><p class="eyebrow">${esc(section.eyebrow || "Notice")}</p><strong>${esc(section.title || "")}</strong><p>${esc(section.text || "")}</p></div>${button}</div></div></section>`;
    }

    return "";
  }

  function initFilters(buttonSelector, cardSelector, key) {
    const buttons = qsa(buttonSelector);
    buttons.forEach(button => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      qsa(cardSelector).forEach(card => { card.hidden = filter !== "all" && card.dataset[key] !== filter; });
    }));
  }

  function initDialogs() {
    qsa("dialog").forEach(dialog => {
      qsa("[data-dialog-close]", dialog).forEach(button => button.addEventListener("click", () => dialog.close()));
      dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    });
  }

  function initCopyEmail() {
    const button = qs("[data-copy-email]");
    if (!button) return;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.site.email);
        const original = button.textContent;
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = original; }, 1400);
      } catch {
        location.href = `mailto:${data.site.email}`;
      }
    });
  }

  function observeReveals() {
    const items = qsa(".reveal:not(.is-visible)");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    items.forEach(item => observer.observe(item));
  }

  document.addEventListener("DOMContentLoaded", () => {
    setMetadata(currentPage);
    applySiteContent();
    renderNavigation();
    renderFooter();
    renderHomeRoutes();
    applyConfiguredLinks();
    initNavigation();

    if (currentPage && !isVisiblePage(currentPage)) {
      renderDisabledPage(currentPage);
      observeReveals();
      return;
    }

    renderCustomPage(currentPage);
    renderDashboard();
    renderCharacters();
    renderGallery();
    renderFursuits();
    renderCommissions();
    applyConfiguredLinks();
    initDialogs();
    initCopyEmail();
    observeReveals();
  });
})();
