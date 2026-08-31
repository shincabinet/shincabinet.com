(() => {
  "use strict";

  const STORAGE_KEY = "shin-theme";
  const COOKIE_KEY = "shin-theme";
  const DARK_COLOR = "#21201c";
  const LIGHT_COLOR = "#fbfaf6";

  const validTheme = (value) => value === "dark" || value === "light";

  function readCookieTheme() {
    try {
      const match = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_KEY}=`));
      if (!match) return null;
      const value = decodeURIComponent(match.slice(COOKIE_KEY.length + 1));
      return validTheme(value) ? value : null;
    } catch {
      return null;
    }
  }

  function readStoredTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      if (validTheme(value)) return value;
    } catch {}
    return readCookieTheme();
  }

  function systemTheme() {
    try {
      return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    try {
      const secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(theme)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    } catch {}
  }

  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? DARK_COLOR : LIGHT_COLOR;
  }

  function applyTheme(theme, options = {}) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    updateThemeColor(nextTheme);
    if (options.persist) saveTheme(nextTheme);
    return nextTheme;
  }

  function getTheme() {
    const current = document.documentElement.dataset.theme;
    if (validTheme(current)) return current;
    return readStoredTheme() || systemTheme();
  }

  function toggleTheme(options = { persist: true }) {
    return applyTheme(getTheme() === "dark" ? "light" : "dark", options);
  }

  window.SHIN_THEME = {
    applyTheme,
    getTheme,
    readStoredTheme,
    systemTheme,
    toggleTheme
  };

  // Runs synchronously in <head> before the stylesheet, preventing a light-theme flash.
  applyTheme(readStoredTheme() || systemTheme());
})();
