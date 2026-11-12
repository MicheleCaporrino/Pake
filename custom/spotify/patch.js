/* PAKE Spotify Revamp v4 — lightweight enhancements.
   No forced GC, no periodic DOM polling, no interception of browser reload keys. */
(() => {
  "use strict";

  const ROOT_CLASS = "pake-custom-theme";
  const THEME_KEY = "pake_custom_theme_enabled";
  const PALETTE_ID = "pake-command-palette-v4";
  const STYLE_ID = "pake-command-palette-style-v4";

  let themeEnabled = true;
  try { themeEnabled = localStorage.getItem(THEME_KEY) !== "false"; } catch (_) {}

  const applyTheme = () => document.documentElement?.classList.toggle(ROOT_CLASS, themeEnabled);
  applyTheme();

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PALETTE_ID}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-start;justify-content:center;padding:14vh 16px 20px;background:rgba(0,0,0,.62);font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #${PALETTE_ID}[data-open="true"]{display:flex}
    #${PALETTE_ID} .pake-palette-box{width:min(520px,94vw);overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:#17191e;box-shadow:0 24px 80px rgba(0,0,0,.5);color:#f5f6f7}
    #${PALETTE_ID} .pake-palette-head{padding:17px 19px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:12px}
    #${PALETTE_ID} .pake-palette-title{font-weight:750;letter-spacing:.08em;color:#1ed760}
    #${PALETTE_ID} .pake-palette-hint{font-size:11px;color:#969ba5}
    #${PALETTE_ID} .pake-palette-action{display:flex;width:100%;align-items:center;justify-content:space-between;padding:13px 16px;border:0;border-radius:9px;background:transparent;color:inherit;text-align:left;cursor:pointer}
    #${PALETTE_ID} .pake-palette-action:hover,#${PALETTE_ID} .pake-palette-action:focus-visible{background:rgba(255,255,255,.08);outline:none}
    #${PALETTE_ID} .pake-palette-actions{padding:8px}
  `;
  (document.head || document.documentElement).appendChild(style);

  function ensurePalette() {
    if (document.getElementById(PALETTE_ID)) return document.getElementById(PALETTE_ID);
    const overlay = document.createElement("div");
    overlay.id = PALETTE_ID;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Spotify Commander");
    const box = document.createElement("div");
    box.className = "pake-palette-box";
    const head = document.createElement("div");
    head.className = "pake-palette-head";
    const title = document.createElement("span");
    title.className = "pake-palette-title";
    title.textContent = "SPOTIFY COMMANDER";
    const hint = document.createElement("span");
    hint.className = "pake-palette-hint";
    hint.textContent = "Ctrl/⌘ + Q · Esc";
    head.append(title, hint);
    const actions = document.createElement("div");
    actions.className = "pake-palette-actions";
    const themeButton = document.createElement("button");
    themeButton.className = "pake-palette-action";
    themeButton.type = "button";
    themeButton.dataset.action = "theme";
    const themeLabel = document.createElement("span");
    themeLabel.textContent = "Appearance · Premium theme";
    const themeState = document.createElement("span");
    themeState.dataset.themeState = "true";
    themeButton.append(themeLabel, themeState);
    const reloadButton = document.createElement("button");
    reloadButton.className = "pake-palette-action";
    reloadButton.type = "button";
    reloadButton.dataset.action = "reload";
    reloadButton.textContent = "Reload Spotify";
    actions.append(themeButton, reloadButton);
    box.append(head, actions);
    overlay.appendChild(box);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closePalette();
    });
    actions.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      if (button.dataset.action === "theme") {
        themeEnabled = !themeEnabled;
        try { localStorage.setItem(THEME_KEY, String(themeEnabled)); } catch (_) {}
        applyTheme();
        updateThemeLabel();
      } else if (button.dataset.action === "reload") {
        window.location.reload();
      }
    });
    document.body.appendChild(overlay);
    updateThemeLabel();
    return overlay;
  }

  function updateThemeLabel() {
    const state = document.querySelector(`#${PALETTE_ID} [data-theme-state]`);
    if (state) state.textContent = themeEnabled ? "ON" : "OFF";
  }
  function openPalette() {
    if (!document.body) return;
    const palette = ensurePalette();
    palette.dataset.open = "true";
    palette.querySelector("button")?.focus();
  }
  function closePalette() {
    const palette = document.getElementById(PALETTE_ID);
    if (palette) {
      delete palette.dataset.open;
      palette.querySelector("button")?.blur();
    }
  }

  function mountEqualizer() {
    const player = document.querySelector('[data-testid="now-playing-bar"]');
    if (!player || player.querySelector(".pake-eq")) return;
    const track = player.querySelector('[data-testid="track"]');
    if (!track) return;
    const eq = document.createElement("span");
    eq.className = "pake-eq";
    eq.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) eq.appendChild(document.createElement("i"));
    track.insertBefore(eq, track.firstChild);
  }

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      mountEqualizer();
    });
  });
  const startObserver = () => {
    if (!document.body) return;
    mountEqualizer();
    observer.observe(document.body, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  } else {
    startObserver();
  }

  window.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "q") {
      event.preventDefault();
      event.stopPropagation();
      const palette = document.getElementById(PALETTE_ID);
      if (palette?.dataset.open === "true") closePalette();
      else openPalette();
    } else if (event.key === "Escape") {
      closePalette();
    }
  }, true);

  console.info("[PAKE v4] custom layer loaded", {
    theme: themeEnabled ? "on" : "off",
    playerFound: Boolean(document.querySelector('[data-testid="now-playing-bar"]'))
  });
})();
