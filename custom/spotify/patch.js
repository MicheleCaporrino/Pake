/* PAKE Spotify v5 — tema ON di default (il CSS funziona anche senza JS).
   Tema OFF: nessun observer, nessun elemento extra, palette non montata. */
(() => {
  "use strict";
  const OFF_CLASS = "pake-off";
  const KEY = "pake_theme_off";
  const PALETTE_ID = "pake-palette-v5";

  let off = false;
  try { off = localStorage.getItem(KEY) === "1"; } catch (_) {}

  let bodyObserver = null;
  let classObserver = null;
  let raf = false;

  const applyClass = () => document.documentElement.classList.toggle(OFF_CLASS, off);

  function mountEq() {
    if (off) return;
    const player = document.querySelector('[data-testid="now-playing-bar"]');
    const track = player && player.querySelector('[data-testid="track"]');
    if (!track || track.querySelector(".pake-eq")) return;
    const eq = document.createElement("span");
    eq.className = "pake-eq";
    eq.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) eq.appendChild(document.createElement("i"));
    track.insertBefore(eq, track.firstChild);
  }

  function startObservers() {
    stopObservers();
    if (off || !document.body) return;
    mountEq();
    bodyObserver = new MutationObserver(() => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => { raf = false; mountEq(); });
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    // Spotify può riscrivere class su <html>: ripristina solo se serve
    classObserver = new MutationObserver(() => {
      if (document.documentElement.classList.contains(OFF_CLASS) !== off) applyClass();
    });
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }

  function stopObservers() {
    if (bodyObserver) { bodyObserver.disconnect(); bodyObserver = null; }
    if (classObserver) { classObserver.disconnect(); classObserver = null; }
    document.querySelectorAll(".pake-eq").forEach(n => n.remove());
  }

  function setTheme(nextOff) {
    off = nextOff;
    try { localStorage.setItem(KEY, off ? "1" : "0"); } catch (_) {}
    applyClass();
    off ? stopObservers() : startObservers();
    const s = document.querySelector(`#${PALETTE_ID} [data-state]`);
    if (s) s.textContent = off ? "OFF" : "ON";
  }

  /* Palette creata solo alla prima apertura (zero costo prima) */
  function ensurePalette() {
    let o = document.getElementById(PALETTE_ID);
    if (o) return o;
    const st = document.createElement("style");
    st.textContent = `
      #${PALETTE_ID}{position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-start;justify-content:center;padding:14vh 16px 20px;background:rgba(0,0,0,.62);font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #${PALETTE_ID}[data-open="true"]{display:flex}
      #${PALETTE_ID} .b{width:min(480px,94vw);border:1px solid rgba(255,255,255,.14);border-radius:16px;background:#161a23;color:#f5f6f7;box-shadow:0 24px 80px rgba(0,0,0,.5);overflow:hidden}
      #${PALETTE_ID} .h{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between}
      #${PALETTE_ID} .h b{letter-spacing:.08em;color:#1ed760}
      #${PALETTE_ID} .h span{font-size:11px;color:#969ba5}
      #${PALETTE_ID} .a{padding:8px}
      #${PALETTE_ID} button{display:flex;width:100%;justify-content:space-between;padding:13px 16px;border:0;border-radius:9px;background:transparent;color:inherit;cursor:pointer;font:inherit;text-align:left}
      #${PALETTE_ID} button:hover,#${PALETTE_ID} button:focus-visible{background:rgba(255,255,255,.08);outline:none}`;
    o = document.createElement("div");
    o.id = PALETTE_ID;
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.innerHTML = `<div class="b"><div class="h"><b>SPOTIFY COMMANDER</b><span>Ctrl/⌘ + Shift + K · Esc</span></div>
      <div class="a"><button data-act="theme"><span>Tema</span><span data-state>${off ? "OFF" : "ON"}</span></button>
      <button data-act="reload"><span>Ricarica Spotify</span></button></div></div>`;
    o.appendChild(st);
    o.addEventListener("click", e => {
      if (e.target === o) return closePalette();
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      if (b.dataset.act === "theme") setTheme(!off);
      else location.reload();
    });
    document.body.appendChild(o);
    return o;
  }
  function closePalette() {
    const o = document.getElementById(PALETTE_ID);
    if (o) delete o.dataset.open;
  }

  // Ctrl/Cmd+Q chiude l'app su molte piattaforme: uso Ctrl/Cmd+Shift+K
  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const o = ensurePalette();
      if (o.dataset.open === "true") closePalette();
      else { o.dataset.open = "true"; o.querySelector("button")?.focus(); }
    } else if (e.key === "Escape") closePalette();
  }, true);

  applyClass();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startObservers, { once: true });
  else startObservers();

  console.info("[PAKE v5] caricato", { theme: off ? "off" : "on" });
})();