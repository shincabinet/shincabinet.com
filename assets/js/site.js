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


  const mediaConfig = data.site?.media || {};

  function mediaHost() {
    return String(mediaConfig.imageHost || "").trim().replace(/\/+$/, "");
  }

  function isManagedLocalImage(value) {
    return String(value || "").startsWith("/assets/images/");
  }

  function isAbsoluteHttpUrl(value) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  function originalImageUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return raw;

    // Explicit remote URLs are the preferred format for new artwork. Legacy
    // /assets/images/... references remain supported during migration.
    if (isAbsoluteHttpUrl(raw)) return raw;

    const host = mediaHost();
    if (mediaConfig.remoteImagesEnabled !== true || !host || !isManagedLocalImage(raw)) return raw;

    const [pathAndQuery, hash = ""] = raw.split("#", 2);
    const relative = pathAndQuery.replace(/^\/assets\/images\//, "");
    return `${host}/${relative}${hash ? `#${hash}` : ""}`;
  }

  function canTransformImage(original) {
    if (mediaConfig.cloudflareTransformationsEnabled !== true) return false;
    const max = Number(mediaConfig.maxImageDimension || 0);
    if (!Number.isFinite(max) || max <= 0) return false;
    const host = mediaHost();
    if (!host || !original) return false;
    try {
      const source = new URL(original, location.origin);
      const imageHost = new URL(host, location.origin);
      return source.origin === imageHost.origin;
    } catch {
      return false;
    }
  }

  function servedImageUrl(value) {
    const original = originalImageUrl(value);
    if (!canTransformImage(original)) return original;

    const max = Math.max(1, Math.round(Number(mediaConfig.maxImageDimension)));
    const host = mediaHost();
    const source = new URL(original);
    const sourcePath = source.pathname.replace(/^\/+/, "");
    const options = `fit=scale-down,width=${max},height=${max},format=auto,onerror=redirect`;
    return `${host}/cdn-cgi/image/${options}/${sourcePath}${source.search}`;
  }

  function originalFromTransformedUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, location.origin);
      const marker = "/cdn-cgi/image/";
      const markerIndex = url.pathname.indexOf(marker);
      if (markerIndex < 0) return "";
      const remainder = url.pathname.slice(markerIndex + marker.length);
      const optionEnd = remainder.indexOf("/");
      if (optionEnd < 0) return "";
      const sourcePath = remainder.slice(optionEnd + 1);
      if (!sourcePath) return "";
      return `${url.origin}/${sourcePath}${url.search}`;
    } catch {
      return "";
    }
  }

  // Cloudflare Image Transformations are an optimization, not a hard
  // dependency. If the transformed request fails (disabled feature, stale
  // edge response, unsupported source, etc.), retry the untouched original
  // exactly once so artwork never disappears from the site.
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    if (image.dataset.originalFallbackTried === "1") return;

    const current = image.currentSrc || image.src || "";
    const fallback = image.dataset.originalImage || originalFromTransformedUrl(current);
    if (!fallback || fallback === current) return;

    image.dataset.originalFallbackTried = "1";
    image.src = fallback;
  }, true);

  function applyStaticHostedImages() {
    qsa("img[data-site-image]").forEach((image) => {
      const canonical = image.dataset.siteImage || "";
      image.src = servedImageUrl(canonical);
      image.dataset.originalImage = originalImageUrl(canonical);
    });

    // Manager-owned static layout images (for example the homepage hero) live
    // in site data rather than being hard-coded into HTML. This ensures a
    // legacy -> images.shincabinet.com migration updates the visible preview.
    qsa("img[data-site-image-key]").forEach((image) => {
      const key = image.dataset.siteImageKey || "";
      const record = data.site?.[key];
      const canonical = typeof record === "string" ? record : record?.image;
      if (!canonical) return;
      image.src = servedImageUrl(canonical);
      image.dataset.originalImage = originalImageUrl(canonical);
      if (typeof record === "object" && record?.alt) image.alt = record.alt;
    });
  }

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

  function getTheme() {
    if (window.SHIN_THEME?.getTheme) return window.SHIN_THEME.getTheme();

    let saved = null;
    try { saved = localStorage.getItem("shin-theme"); } catch {}
    if (saved === "dark" || saved === "light") return saved;

    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  function applyTheme(theme, persist = false) {
    const nextTheme = theme === "dark" ? "dark" : "light";

    if (window.SHIN_THEME?.applyTheme) {
      window.SHIN_THEME.applyTheme(nextTheme, { persist });
    } else {
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      if (persist) {
        try { localStorage.setItem("shin-theme", nextTheme); } catch {}
      }

      const themeMeta = qs('meta[name="theme-color"]');
      if (themeMeta) themeMeta.content = nextTheme === "dark" ? "#21201c" : "#fbfaf6";
    }

    qsa("[data-theme-toggle]").forEach((button) => {
      const dark = nextTheme === "dark";
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("aria-pressed", String(dark));
    });
  }

  function renderThemeToggle() {
    if (qs("[data-theme-toggle]")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode" title="Switch to dark mode">
        <span class="theme-toggle__thumb" aria-hidden="true"></span>
      </button>`);
  }

  function initThemeToggle() {
    applyTheme(getTheme());
    qsa("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        applyTheme(getTheme() === "dark" ? "light" : "dark", true);
      });
    });
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

      if (page.navOnly) {
        const active = currentPage && currentPage.parentIds.includes(page.id);
        return `<details class="site-nav__group site-nav__details"${active ? ' data-active="true"' : ""}><summary class="site-nav__parent">${esc(page.label)}</summary><div class="site-nav__submenu">${children.map(renderNode).join("")}</div></details>`;
      }

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

  function characterPath(character) {
    return character.path || `/characters/${encodeURIComponent(character.id)}/`;
  }

  function characterCard(character) {
    const searchable = [character.name, character.species, character.role, ...(character.tags || [])].join(" ").toLowerCase();
    return `<article class="character-card" data-character-category="${esc(character.category)}" data-character-searchable="${esc(searchable)}">
      <button type="button" data-character-id="${esc(character.id)}" aria-label="Open ${esc(character.name)} profile">
        <span class="character-card__image"><img src="${esc(servedImageUrl(character.image))}" alt="${esc(character.alt || character.name)}" loading="lazy"></span>
        <span class="character-card__copy"><strong>${esc(character.name)}</strong><small>${esc(character.species)} · ${esc(character.pronouns)}</small></span>
      </button>
    </article>`;
  }

  function renderCharacters() {
    const grid = qs("[data-character-grid]");
    if (!grid) return;
    const visibleCharacters = (data.characters || []).filter((character) => character.enabled !== false);
    grid.innerHTML = visibleCharacters.map(characterCard).join("");
    const count = qs("[data-character-count]");
    if (count) count.textContent = String(visibleCharacters.length);
    qsa("[data-character-id]", grid).forEach((button) => button.addEventListener("click", () => {
      const character = (data.characters || []).find((item) => item.id === button.dataset.characterId && item.enabled !== false);
      if (character) location.href = characterPath(character);
    }));
    initCharacterDirectory();
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

  function normalizePalette(palette = []) {
    return palette.map((item, index) => {
      if (typeof item === "string") return { name: `Color ${index + 1}`, hex: item };
      return { name: item.name || `Color ${index + 1}`, hex: item.hex || item.value || "" };
    }).filter((item) => item.hex);
  }

  function textItems(items = []) {
    return items.length ? `<ul class="character-profile__text-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : "";
  }

  function profileSection(id, eyebrow, title, content, className = "") {
    if (!content) return "";
    return `<section class="character-profile__section ${className}" id="${esc(id)}"><header><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2></header>${content}</section>`;
  }

  function artistCredit(item, className = "art-credit") {
    const artist = String(item?.artist || "").trim();
    if (!artist) return "";
    const rawUrl = String(item?.artistUrl || "").trim();
    const safeUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : "";
    const name = safeUrl
      ? `<a href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer">${esc(artist)}</a>`
      : `<span>${esc(artist)}</span>`;
    return `<small class="${esc(className)}">Art by ${name}</small>`;
  }

  function referenceCard(reference, index) {
    const mature = reference.mature === true;
    const alternativeCount = (reference.alternatives || []).filter((item) => item && item.image).length;
    return `<article class="reference-card${mature ? " reference-card--mature" : ""}">
      <button type="button" data-reference-index="${index}" data-mature="${mature}" aria-label="View ${esc(reference.title || "reference image")}">
        <span class="reference-card__media"><img src="${esc(servedImageUrl(reference.image))}" alt="${esc(reference.alt || reference.title || "Character reference")}" loading="lazy">${alternativeCount ? `<span class="media-version-badge">${alternativeCount + 1} versions</span>` : ""}${mature ? '<span class="mature-cover"><strong>Mature</strong><small>Tap to reveal</small></span>' : ""}</span>
        <span class="reference-card__caption">${esc(reference.title || "Reference")}</span>
      </button>
      ${artistCredit(reference, "reference-card__credit")}
    </article>`;
  }

  function mediaVersions(item, primaryLabel = "Primary") {
    const versions = [{
      title: primaryLabel,
      image: item.full || item.image,
      alt: item.alt || item.title || primaryLabel
    }];
    (item.alternatives || []).forEach((alternative, index) => {
      if (!alternative || !alternative.image) return;
      versions.push({
        title: alternative.title || `Alternative ${index + 1}`,
        image: alternative.full || alternative.image,
        alt: alternative.alt || alternative.title || item.alt || item.title || `Alternative ${index + 1}`
      });
    });
    return versions;
  }

  function openMediaDialog(item, title, meta, fallbackAlt) {
    const dialog = qs("#art-dialog");
    if (!item || !dialog) return;
    const image = qs("[data-art-dialog-image]", dialog);
    const figure = qs(".art-dialog__figure", dialog);
    if (!image || !figure) return;

    let variants = qs("[data-art-dialog-variants]", dialog);
    if (!variants) {
      variants = document.createElement("div");
      variants.className = "art-dialog__variants";
      variants.dataset.artDialogVariants = "";
      variants.setAttribute("aria-label", "Image versions");
      image.insertAdjacentElement("afterend", variants);
    }

    const versions = mediaVersions(item);
    const metaElement = qs("[data-art-dialog-meta]", dialog);
    let creditElement = qs("[data-art-dialog-credit]", dialog);
    if (!creditElement) {
      creditElement = document.createElement("div");
      creditElement.className = "art-dialog__credit";
      creditElement.dataset.artDialogCredit = "";
      const caption = qs(".art-dialog__caption", dialog);
      if (caption) caption.insertAdjacentElement("afterend", creditElement);
    }
    creditElement.innerHTML = artistCredit(item, "art-dialog__credit-text");
    creditElement.hidden = !String(item.artist || "").trim();

    let originalLink = qs("[data-art-dialog-original]", dialog);
    if (!originalLink) {
      originalLink = document.createElement("a");
      originalLink.className = "art-dialog__original";
      originalLink.dataset.artDialogOriginal = "";
      originalLink.target = "_blank";
      originalLink.rel = "noopener noreferrer";
      originalLink.textContent = "Open original image ↗";
      creditElement.insertAdjacentElement("afterend", originalLink);
    }

    const selectVersion = (version, button = null, index = 0) => {
      image.src = servedImageUrl(version.image);
      image.alt = version.alt || fallbackAlt || title || "Artwork preview";
      originalLink.href = originalImageUrl(version.image);
      originalLink.hidden = !originalLink.href;
      qsa("button", variants).forEach((itemButton) => itemButton.setAttribute("aria-pressed", String(itemButton === button)));
      if (metaElement) metaElement.textContent = index === 0 || !version.title ? (meta || "") : `${meta || ""} · ${version.title}`;
    };

    dialog.classList.toggle("art-dialog--has-variants", versions.length > 1);
    variants.innerHTML = versions.length > 1 ? versions.map((version, index) => `<button type="button" class="art-dialog__variant" data-version-index="${index}" aria-pressed="${index === 0}" title="${esc(version.title)}"><img src="${esc(servedImageUrl(version.image))}" alt=""><span>${esc(version.title)}</span></button>`).join("") : "";
    variants.hidden = versions.length <= 1;
    qsa("[data-version-index]", variants).forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.versionIndex);
      const version = versions[index];
      if (version) selectVersion(version, button, index);
    }));

    selectVersion(versions[0], qs('[data-version-index="0"]', variants), 0);
    qs("[data-art-dialog-title]", dialog).textContent = title || item.title || "Artwork";
    dialog.showModal();
  }

  function openReferenceImage(character, index) {
    const reference = (character.references || [])[Number(index)];
    if (!reference) return;
    openMediaDialog(
      reference,
      reference.title || `${character.name} reference`,
      `${character.name} · Reference`,
      reference.alt || `${character.name} reference`
    );
  }

  function renderCharacterProfile() {
    const root = qs("[data-character-profile]");
    if (!root) return;

    const id = root.dataset.characterProfile || document.body.dataset.characterId || "";
    const character = (data.characters || []).find((item) => item.id === id);
    if (!character) {
      root.innerHTML = `<section class="disabled-page"><p class="eyebrow">Character not found</p><h1>Unknown character</h1><p>This profile does not match a character in <code>assets/js/content.js</code>.</p><a class="button" href="/characters/">Back to Characters</a></section>`;
      return;
    }
    if (character.enabled === false) {
      root.innerHTML = `<section class="disabled-page"><p class="eyebrow">Character profile</p><h1>This character is not published yet.</h1><p>The profile is saved, but it is currently hidden.</p><a class="button" href="/characters/">Back to Characters</a></section>`;
      return;
    }

    document.title = `${character.name} — Characters — ${data.site.name}`;
    const metaDescription = qs('meta[name="description"]');
    if (metaDescription) metaDescription.content = character.tagline || `${character.name}, ${character.species || "original character"} by ${data.site.artistName}.`;

    const bio = Array.isArray(character.bio) ? character.bio : (character.bio ? [character.bio] : []);
    const palette = normalizePalette(character.palette || []);
    const artwork = (data.artworks || []).filter((item) => item.character === character.name);
    const references = character.references || [];
    const facts = character.facts || [];
    const links = character.links || [];

    const bioHtml = bio.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
    const factsHtml = facts.length ? `<dl class="character-profile__facts">${facts.map((fact) => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join("")}</dl>` : "";
    const paletteHtml = palette.length ? `<div class="character-palette">${palette.map((color) => `<button type="button" class="character-palette__swatch" data-copy-color="${esc(color.hex)}" title="Copy ${esc(color.hex)}"><span style="--swatch:${esc(color.hex)}"></span><strong>${esc(color.name)}</strong><small>${esc(color.hex)}</small></button>`).join("")}</div>` : "";
    const designHtml = [paletteHtml, textItems(character.designNotes || [])].filter(Boolean).join("");
    const refsHtml = references.length ? `<div class="reference-grid">${references.map(referenceCard).join("")}</div>` : "";
    const artworkHtml = artwork.length ? `<div class="gallery-grid character-profile__gallery">${artwork.map(artworkCard).join("")}</div>` : "";
    const linksHtml = links.length ? `<div class="character-profile__links">${links.map((link) => `<a class="text-link" href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(link.display || link.label || link.url)} →</a>`).join("")}</div>` : "";
    const tagsHtml = (character.tags || []).length ? `<div class="character-profile__tags">${character.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>` : "";

    const sectionNav = [
      bioHtml && ["about", "About"],
      factsHtml && ["details", "Details"],
      (designHtml || refsHtml) && ["design", "Design & references"],
      (character.personality || []).length && ["personality", "Personality"],
      ((character.likes || []).length || (character.dislikes || []).length) && ["preferences", "Likes / dislikes"],
      artworkHtml && ["artwork", "Artwork"]
    ].filter(Boolean);

    const prefHtml = ((character.likes || []).length || (character.dislikes || []).length)
      ? `<div class="character-profile__split">${(character.likes || []).length ? `<div><h3>Likes</h3>${textItems(character.likes)}</div>` : ""}${(character.dislikes || []).length ? `<div><h3>Dislikes</h3>${textItems(character.dislikes)}</div>` : ""}</div>`
      : "";

    root.innerHTML = `
      <section class="character-profile__hero">
        <div class="character-profile__hero-inner">
          <div class="character-profile__visual"><img src="${esc(servedImageUrl(character.profileImage || character.image || character.icon))}" alt="${esc(character.alt || character.name)}"></div>
          <div class="character-profile__intro">
            <a class="character-profile__back" href="/characters/">← Characters</a>
            <p class="eyebrow">${esc(character.role || "Character")}</p>
            <div class="character-profile__identity">${character.icon ? `<img src="${esc(character.icon)}" alt="" aria-hidden="true">` : ""}<div><h1>${esc(character.name)}</h1><p>${esc(character.species || "")}${character.pronouns ? ` · ${esc(character.pronouns)}` : ""}</p></div></div>
            ${character.tagline ? `<p class="character-profile__tagline">${esc(character.tagline)}</p>` : ""}
            ${tagsHtml}
            ${linksHtml}
          </div>
        </div>
      </section>
      <section class="character-profile__body">
        <div class="character-profile__body-inner">
          <nav class="character-profile__index" aria-label="Character profile sections">${sectionNav.map(([href, label]) => `<a href="#${esc(href)}">${esc(label)}</a>`).join("")}</nav>
          <div class="character-profile__content">
            ${profileSection("about", "Profile", "About", bioHtml)}
            ${profileSection("details", "Information", "Details", factsHtml)}
            ${profileSection("design", "Reference", "Design & references", `${designHtml}${refsHtml}`)}
            ${profileSection("personality", "Character", "Personality", textItems(character.personality || []))}
            ${profileSection("preferences", "Character", "Likes / dislikes", prefHtml)}
            ${profileSection("artwork", "Archive", `Artwork featuring ${character.name}`, artworkHtml, "character-profile__section--wide")}
          </div>
        </div>
      </section>`;

    qsa("[data-copy-color]", root).forEach((button) => button.addEventListener("click", async () => {
      const value = button.dataset.copyColor;
      try {
        await navigator.clipboard.writeText(value);
        const label = qs("small", button);
        if (!label) return;
        const old = label.textContent;
        label.textContent = "Copied";
        setTimeout(() => { label.textContent = old; }, 1000);
      } catch {}
    }));

    qsa("[data-reference-index]", root).forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.mature === "true" && button.dataset.revealed !== "true") {
        button.dataset.revealed = "true";
        return;
      }
      openReferenceImage(character, button.dataset.referenceIndex);
    }));

    qsa("[data-artwork-id]", root).forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.mature === "true" && button.dataset.revealed !== "true") {
        button.dataset.revealed = "true";
        return;
      }
      openArtwork(button.dataset.artworkId);
    }));
  }

  function artworkCard(artwork) {
    const mature = artwork.mature === true;
    const alternativeCount = (artwork.alternatives || []).filter((item) => item && item.image).length;
    return `<article class="gallery-card${mature ? " gallery-card--mature" : ""}" data-gallery-category="${esc(artwork.category)}" data-gallery-mature="${mature}">
      <button type="button" data-artwork-id="${esc(artwork.id)}" data-mature="${mature}" aria-label="View ${esc(artwork.title)}">
        <span class="gallery-card__media"><img src="${esc(servedImageUrl(artwork.image))}" alt="${esc(artwork.alt)}" loading="lazy">${alternativeCount ? `<span class="media-version-badge">${alternativeCount + 1} versions</span>` : ""}${mature ? '<span class="mature-cover"><strong>Mature</strong><small>Tap to reveal</small></span>' : ""}</span>
        <span class="gallery-card__caption"><strong>${esc(artwork.title)}</strong><small>${esc(artwork.character)} · ${esc(artwork.year)}</small></span>
      </button>
      ${artistCredit(artwork, "gallery-card__credit")}
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
    if (!artwork) return;
    openMediaDialog(
      artwork,
      artwork.title,
      `${artwork.category} · ${artwork.character} · ${artwork.year}`,
      artwork.alt || artwork.title
    );
  }

  function renderFursuits() {
    const builds = qs("[data-build-grid]");
    if (builds) {
      builds.innerHTML = (data.fursuitProjects || []).map((project) => `<article class="build-card"><img src="${esc(servedImageUrl(project.image))}" alt="${esc(project.title)}" loading="lazy"><div><small>${esc(project.phase)} · ${esc(project.status)}</small><h3>${esc(project.title)}</h3><p>${esc(project.description)}</p></div></article>`).join("");
    }
  }

  function renderAdoptables() {
    const grid = qs("[data-adoptable-grid]");
    const empty = qs("[data-adoptable-empty]");
    if (!grid) return;

    const adoptables = data.adoptables || [];
    if (!adoptables.length) {
      grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    grid.innerHTML = adoptables.map((adoptable) => {
      const status = adoptable.status || "Available";
      const statusKey = String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const image = `<img src="${esc(servedImageUrl(adoptable.image))}" alt="${esc(adoptable.alt || adoptable.name)}" loading="lazy">`;
      const visual = adoptable.url
        ? `<a class="adoptable-card__visual" href="${esc(adoptable.url)}" target="_blank" rel="noreferrer">${image}</a>`
        : `<div class="adoptable-card__visual">${image}</div>`;
      const action = adoptable.url
        ? `<a class="text-link adoptable-card__link" href="${esc(adoptable.url)}" target="_blank" rel="noreferrer">View / purchase →</a>`
        : "";

      return `<article class="adoptable-card" data-adoptable-status="${esc(statusKey)}">
        ${visual}
        <div class="adoptable-card__info">
          <div class="adoptable-card__heading">
            <div><h2>${esc(adoptable.name)}</h2>${adoptable.description ? `<p>${esc(adoptable.description)}</p>` : ""}</div>
            <div class="adoptable-card__meta">${adoptable.price ? `<strong>${esc(adoptable.price)}</strong>` : ""}<span class="adoptable-status adoptable-status--${esc(statusKey)}">${esc(status)}</span></div>
          </div>
          ${action}
        </div>
      </article>`;
    }).join("");
  }

  function renderCommissions() {
    const packages = qs("[data-commission-packages]");
    if (packages) packages.innerHTML = data.commissions.map((commission) => `<article class="price-card">
      ${commission.image ? (commission.mature ? `<details class="price-card__mature"><summary>Mature example</summary><img class="price-card__image" src="${esc(servedImageUrl(commission.image))}" alt="Mature example of ${esc(commission.name)}" loading="lazy"></details>` : `<img class="price-card__image" src="${esc(servedImageUrl(commission.image))}" alt="Example of ${esc(commission.name)}" loading="lazy">`) : ""}
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
    if (section.type === "gallery") return `<section class="section"><div class="section__inner">${heading}<div class="generic-gallery">${(section.items || []).map((item) => `<figure><img src="${esc(servedImageUrl(item.image))}" alt="${esc(item.alt || item.title)}" loading="lazy"><figcaption><strong>${esc(item.title)}</strong><p>${esc(item.text || "")}</p></figcaption></figure>`).join("")}</div></div></section>`;
    if (section.type === "timeline") return `<section class="section"><div class="section__inner">${heading}<div class="process-grid">${(section.items || []).map((item) => `<article class="process-step"><span>${esc(item.number)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join("")}</div></div></section>`;
    if (section.type === "links") {
      const targets = (section.pages || []).map((id) => pageById.get(id)).filter(isVisible);
      return `<section class="section"><div class="section__inner">${heading}<div class="route-grid">${targets.map((page) => `<a class="route-card" href="${esc(page.path)}"><span>${esc(page.description || "Open page")}</span><strong>${esc(page.label)}</strong><i>→</i></a>`).join("")}</div></div></section>`;
    }
    if (section.type === "terms") {
      return `<section class="section section--compact"><div class="section__inner"><div class="terms-page">${(section.items || []).map((item) => `<article class="terms-page__row"><h2>${esc(item.title)}</h2><p>${esc(item.text)}</p></article>`).join("")}</div></div></section>`;
    }
    if (section.type === "contacts") {
      const contacts = data.site.contacts || {};
      const email = contacts.email || data.site.email || "";
      const emailRow = email ? `<div class="contact-directory__row"><span>Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : "";
      const groups = (contacts.groups || []).map((group) => `<section class="contact-directory__group"><h3>${esc(group.label)}</h3>${(group.links || []).map((link) => {
        const display = link.display || link.url.replace(/^https?:\/\/(www\.)?/, "");
        return `<div class="contact-directory__row"><span>${esc(link.label)}</span><a href="${esc(link.url)}" target="_blank" rel="noreferrer">${esc(display)}</a></div>`;
      }).join("")}</section>`).join("");
      return `<section class="section section--compact"><div class="section__inner">${heading}<div class="contact-directory">${emailRow}${groups}</div></div></section>`;
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
    applyStaticHostedImages();
    setMetadata(currentPage);
    applySiteContent();
    renderNavigation();
    renderThemeToggle();
    initThemeToggle();
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
    renderCharacterProfile();
    renderGallery();
    renderAdoptables();
    renderFursuits();
    renderCommissions();
    applyConfiguredLinks();
    initDialogs();
    initCopyEmail();
  });
})();
