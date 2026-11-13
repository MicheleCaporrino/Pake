/* PAKE Spotify v6 — loader, equalizzatore, palette comandi con ricerca nella libreria.
   Tema OFF: nessun observer, nessun listener di scroll; la palette resta disponibile ma non è montata finché non serve. */
(() => {
  "use strict";
  const OFF = "pake-off", READY = "pake-ready";
  const KEY = "pake_theme_off", IDX_KEY = "pake_lib_v6", PID = "pake-pal";
  const LINK_RE = /^\/(playlist|album|artist|show|collection)(\/|$)/;
  const root = document.documentElement;

  let off = false;
  try { off = localStorage.getItem(KEY) === "1"; } catch (_) {}
  let ready = false, raf = false, bodyObs = null, classObs = null;
  let navEl = null, navHandler = null, scanTimer = 0;
  let index = [];
  try { const v = JSON.parse(localStorage.getItem(IDX_KEY) || "[]"); if (Array.isArray(v)) index = v; } catch (_) {}

  const sync = () => {
    root.classList.toggle(OFF, off);
    root.classList.toggle(READY, ready || off);
  };

  /* ---------- Loader: pronto quando c'è contenuto vero (link in sidebar o titoli nella vista principale) ---------- */
  function checkReady() {
    if (ready || !document.querySelector(".Root__nav-bar a[href], .Root__main-view h1, .Root__main-view h2")) return;
    ready = true; sync();
    setTimeout(scanLibrary, 2500);
  }
  setTimeout(() => { if (!ready) { ready = true; sync(); } }, 10000); // es. pagina di login

  /* ---------- Equalizzatore ---------- */
  function mountEq() {
    if (off) return;
    const track = document.querySelector('[data-testid="now-playing-bar"] [data-testid="track"]');
    if (!track || track.querySelector(".pake-eq")) return;
    const eq = document.createElement("span");
    eq.className = "pake-eq"; eq.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) eq.appendChild(document.createElement("i"));
    track.insertBefore(eq, track.firstChild);
  }

  /* ---------- Indice della libreria (playlist, album, artisti salvati) ---------- */
  function saveIndex() {
    try { localStorage.setItem(IDX_KEY, JSON.stringify(index.slice(0, 800))); } catch (_) {}
  }
  function scanLibrary() {
    const nav = document.querySelector(".Root__nav-bar");
    if (!nav) return 0;
    const byHref = new Map(index.map(i => [i.href, i]));
    let changed = 0;
    nav.querySelectorAll("a[href]").forEach(a => {
      const href = (a.getAttribute("href") || "").split("?")[0];
      const m = LINK_RE.exec(href);
      if (!m) return;
      if (m[1] === "collection" && !/\/(tracks|episodes)$/.test(href)) return;
      const row = a.closest('[role="row"],[role="listitem"],li') || a;
      const lines = (row.innerText || a.innerText || "").split("\n").map(s => s.trim()).filter(Boolean);
      if (!lines.length) return;
      const img = row.querySelector("img");
      const item = { href, title: lines[0], sub: lines.slice(1).join(" · "), img: (img && img.src) || "", t: m[1] };
      const old = byHref.get(href);
      if (!old) { index.push(item); byHref.set(href, item); changed++; }
      else if (old.title !== item.title || old.sub !== item.sub || (item.img && old.img !== item.img)) {
        Object.assign(old, item); changed++;
      }
    });
    if (changed) saveIndex();
    return changed;
  }
  function attachNavScan() {
    const nav = document.querySelector(".Root__nav-bar");
    if (!nav || nav === navEl) return;
    detachNavScan();
    navEl = nav;
    navHandler = () => { clearTimeout(scanTimer); scanTimer = setTimeout(scanLibrary, 350); };
    nav.addEventListener("scroll", navHandler, { capture: true, passive: true });
  }
  function detachNavScan() {
    if (navEl && navHandler) navEl.removeEventListener("scroll", navHandler, true);
    navEl = null; navHandler = null; clearTimeout(scanTimer);
  }

  /* ---------- Observer (solo a tema attivo) ---------- */
  function startObservers() {
    stopObservers();
    if (off || !document.body) return;
    const tick = () => { mountEq(); checkReady(); attachNavScan(); };
    tick();
    bodyObs = new MutationObserver(() => {
      if (raf) return; raf = true;
      requestAnimationFrame(() => { raf = false; tick(); });
    });
    bodyObs.observe(document.body, { childList: true, subtree: true });
    classObs = new MutationObserver(() => {
      if (root.classList.contains(OFF) !== off || (ready && !root.classList.contains(READY))) sync();
    });
    classObs.observe(root, { attributes: true, attributeFilter: ["class"] });
  }
  function stopObservers() {
    if (bodyObs) { bodyObs.disconnect(); bodyObs = null; }
    if (classObs) { classObs.disconnect(); classObs = null; }
    detachNavScan();
    document.querySelectorAll(".pake-eq").forEach(n => n.remove());
  }
  function setTheme(nextOff) {
    off = nextOff;
    try { localStorage.setItem(KEY, off ? "1" : "0"); } catch (_) {}
    sync();
    off ? stopObservers() : startObservers();
  }

  /* ---------- Navigazione ---------- */
  function go(href) {
    const a = [...document.querySelectorAll("a[href]")].find(x => x.getAttribute("href") === href);
    if (a) { a.click(); return; }
    history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));
  }
  function doSearch(q) {
    const inp = document.querySelector('[data-testid="search-input"]');
    if (inp) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      inp.focus(); setter.call(inp, q);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    } else go("/search/" + encodeURIComponent(q));
  }

  /* ---------- Scansione completa della libreria (è virtualizzata) ---------- */
  let deep = false, deepMsg = "";
  async function deepIndex() {
    if (deep) return;
    deep = true; deepMsg = "Scansione in corso…"; render();
    try {
      const nav = document.querySelector(".Root__nav-bar");
      const first = nav && [...nav.querySelectorAll("a[href]")].find(x => LINK_RE.test(x.getAttribute("href")));
      let sc = first;
      while (sc && sc !== nav.parentElement) {
        if (sc.scrollHeight > sc.clientHeight + 8 && /(auto|scroll|hidden)/.test(getComputedStyle(sc).overflowY)) break;
        sc = sc.parentElement;
      }
      if (!sc || sc === nav.parentElement) { scanLibrary(); deepMsg = "Libreria non scorrevole: indicizzato quanto visibile."; return; }
      const start = sc.scrollTop; sc.scrollTop = 0;
      for (let g = 0; g < 250; g++) {
        await new Promise(r => setTimeout(r, 140));
        scanLibrary(); deepMsg = `Scansione… ${index.length} elementi`; render();
        if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) break;
        const before = sc.scrollTop;
        sc.scrollTop += Math.max(200, sc.clientHeight * 0.8);
        if (sc.scrollTop === before) break;
      }
      sc.scrollTop = start;
      deepMsg = `Fatto: ${index.length} elementi in libreria.`;
    } finally { deep = false; render(); }
  }

  /* ---------- Palette ---------- */
  const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const KIND = { playlist: "Playlist", album: "Album", artist: "Artista", show: "Podcast", collection: "Preferiti" };
  let pal = null, inputEl = null, listEl = null, countEl = null, items = [], sel = 0, tokens = [];

  const PAL_CSS = `
#pake-pal{--a:#fa2d48;position:fixed;inset:0;z-index:2147483647;display:none;align-items:flex-start;justify-content:center;padding:11vh 16px 20px;background:rgba(0,0,0,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:14px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI Variable Text","Segoe UI",system-ui,sans-serif;color:#f5f5f7}
#pake-pal[data-open="true"]{display:flex;animation:pake-pal-in .16s cubic-bezier(.2,.75,.25,1)}
@keyframes pake-pal-in{from{opacity:0}to{opacity:1}}
#pake-pal .box{width:min(640px,100%);max-height:72vh;display:flex;flex-direction:column;border-radius:18px;background:rgba(40,40,43,.88);-webkit-backdrop-filter:blur(40px) saturate(1.8);backdrop-filter:blur(40px) saturate(1.8);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 90px rgba(0,0,0,.6);overflow:hidden}
#pake-pal .bar{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
#pake-pal .bar svg{width:22px;height:22px;flex:none;opacity:.55}
#pake-pal .bar input{flex:1;min-width:0;border:0;outline:0!important;box-shadow:none!important;background:transparent;color:inherit;font:inherit;font-size:21px;font-weight:500;caret-color:var(--a)}
#pake-pal .bar input::placeholder{color:rgba(255,255,255,.36)}
#pake-pal kbd{font:11px/1 inherit;padding:4px 7px;border-radius:6px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.65)}
#pake-pal .list{overflow:auto;padding:8px;overscroll-behavior:contain}
#pake-pal .sec{padding:10px 12px 4px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.42)}
#pake-pal .row{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:10px;cursor:pointer}
#pake-pal .row[aria-selected="true"]{background:var(--a);color:#fff}
#pake-pal .art{width:40px;height:40px;border-radius:8px;flex:none;background:rgba(255,255,255,.09);display:grid;place-items:center;font-size:18px;overflow:hidden}
#pake-pal .art img{width:100%;height:100%;object-fit:cover;display:block}
#pake-pal .txt{min-width:0;flex:1}
#pake-pal .t,#pake-pal .s{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pake-pal .t{font-size:15px;font-weight:600}
#pake-pal .s{font-size:12.5px;color:rgba(255,255,255,.55);margin-top:1px}
#pake-pal .row[aria-selected="true"] .s{color:rgba(255,255,255,.82)}
#pake-pal mark{background:none;color:inherit;font-weight:800;text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1.5px}
#pake-pal .tag{font-size:11px;padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.7);flex:none}
#pake-pal .row[aria-selected="true"] .tag{background:rgba(255,255,255,.22);color:#fff}
#pake-pal .empty{padding:22px;text-align:center;color:rgba(255,255,255,.5)}
#pake-pal .foot{display:flex;gap:14px;align-items:center;padding:10px 16px;border-top:1px solid rgba(255,255,255,.08);font-size:12px;color:rgba(255,255,255,.5)}
#pake-pal .foot .sp{flex:1}
@media (prefers-reduced-motion:reduce){#pake-pal[data-open="true"]{animation:none}}`;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function ensurePalette() {
    if (pal) return pal;
    const st = document.createElement("style"); st.textContent = PAL_CSS;
    pal = el("div"); pal.id = PID;
    const box = el("div", "box"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Cerca");
    const bar = el("div", "bar");
    bar.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    inputEl = el("input"); inputEl.type = "text"; inputEl.placeholder = "Cerca playlist, album, artisti o azioni…";
    inputEl.spellcheck = false; inputEl.autocomplete = "off";
    bar.append(inputEl, el("kbd", "", "esc"));
    listEl = el("div", "list"); listEl.setAttribute("role", "listbox");
    const foot = el("div", "foot");
    countEl = el("span", "", "");
    foot.append(el("span", "", "↑↓ naviga"), el("span", "", "↵ apri"), el("span", "sp"), countEl);
    box.append(bar, listEl, foot);
    pal.append(st, box);
    pal.addEventListener("mousedown", e => { if (e.target === pal) closePalette(); });
    inputEl.addEventListener("input", () => { sel = 0; render(); });
    inputEl.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        markSel();
      } else if (e.key === "Enter") { e.preventDefault(); activate(sel); }
      else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    });
    document.body.appendChild(pal);
    return pal;
  }

  function score(hay, title) {
    let s = 0;
    for (const t of tokens) {
      const i = hay.indexOf(t);
      if (i < 0) return -1;
      s += title.startsWith(t) ? 5 : title.includes(" " + t) ? 3 : 1;
    }
    return s;
  }

  function build() {
    const q = inputEl.value.trim();
    tokens = norm(q).split(/\s+/).filter(Boolean);
    const lib = [], acts = [];
    const actions = [
      { title: "Tema Apple Music: " + (off ? "spento" : "attivo"), sub: "Attiva o disattiva il tema", icon: "◐", run: () => setTheme(!off) },
      { title: "Indicizza libreria", sub: deepMsg || `${index.length} elementi salvati · scorre la libreria per trovarli tutti`, icon: "↻", keep: true, run: deepIndex },
      { title: "Vai alla Home", sub: "", icon: "⌂", run: () => go("/") },
      { title: "Ricarica Spotify", sub: "", icon: "⟳", run: () => location.reload() }
    ];
    if (!tokens.length) {
      index.slice(0, 12).forEach(i => lib.push({ ...i, kind: "lib" }));
      actions.forEach(a => acts.push({ ...a, kind: "act" }));
    } else {
      index.forEach(i => {
        const s = score(norm(i.title + " " + i.sub), norm(i.title));
        if (s >= 0) lib.push({ ...i, kind: "lib", s });
      });
      lib.sort((a, b) => b.s - a.s);
      actions.forEach(a => {
        if (score(norm(a.title + " " + a.sub), norm(a.title)) >= 0) acts.push({ ...a, kind: "act" });
      });
    }
    const out = [];
    lib.slice(0, 40).forEach(i => out.push({ ...i, section: tokens.length ? "Nella tua libreria" : "Recenti" }));
    acts.forEach(a => out.push({ ...a, section: "Azioni" }));
    if (q) out.push({ kind: "search", title: `Cerca “${q}” su Spotify`, sub: "Brani, artisti, album e playlist", icon: "⌕", section: "Spotify", run: () => doSearch(q) });
    return out;
  }

  function highlight(node, text) {
    node.textContent = "";
    const nt = norm(text);
    if (!tokens.length || nt.length !== text.length) { node.textContent = text; return; }
    const mark = new Array(text.length).fill(false);
    tokens.forEach(t => { let i = nt.indexOf(t); while (i >= 0) { for (let k = i; k < i + t.length; k++) mark[k] = true; i = nt.indexOf(t, i + 1); } });
    let i = 0;
    while (i < text.length) {
      let j = i; while (j < text.length && mark[j] === mark[i]) j++;
      const seg = text.slice(i, j);
      node.appendChild(mark[i] ? el("mark", "", seg) : document.createTextNode(seg));
      i = j;
    }
  }

  function render() {
    if (!pal || pal.dataset.open !== "true") return;
    items = build();
    if (sel >= items.length) sel = Math.max(0, items.length - 1);
    listEl.textContent = "";
    if (!items.length) listEl.appendChild(el("div", "empty", "Nessun risultato"));
    let sec = "";
    items.forEach((it, idx) => {
      if (it.section !== sec) { sec = it.section; listEl.appendChild(el("div", "sec", sec)); }
      const row = el("div", "row"); row.setAttribute("role", "option"); row.dataset.i = idx;
      const art = el("div", "art");
      if (it.img) { const im = el("img"); im.src = it.img; im.loading = "lazy"; im.decoding = "async"; im.alt = ""; art.appendChild(im); }
      else art.textContent = it.icon || "♪";
      const txt = el("div", "txt"); const t = el("div", "t"); const s = el("div", "s");
      highlight(t, it.title); if (it.sub) highlight(s, it.sub);
      txt.append(t, s);
      row.append(art, txt);
      if (it.kind === "lib") row.appendChild(el("span", "tag", KIND[it.t] || "Libreria"));
      row.addEventListener("mousemove", () => { if (sel !== idx) { sel = idx; markSel(); } });
      row.addEventListener("click", () => activate(idx));
      listEl.appendChild(row);
    });
    countEl.textContent = deepMsg || `${index.length} in libreria`;
    markSel();
  }
  function markSel() {
    listEl.querySelectorAll(".row").forEach(r => {
      const on = Number(r.dataset.i) === sel;
      r.setAttribute("aria-selected", on ? "true" : "false");
      if (on) r.scrollIntoView({ block: "nearest" });
    });
  }
  function activate(i) {
    const it = items[i]; if (!it) return;
    if (it.kind === "lib") { closePalette(); go(it.href); return; }
    if (!it.keep) closePalette();
    it.run();
  }
  function openPalette() {
    if (!document.body) return;
    ensurePalette();
    scanLibrary();
    pal.dataset.open = "true";
    inputEl.value = ""; sel = 0; deepMsg = "";
    render(); inputEl.focus();
  }
  function closePalette() { if (pal) delete pal.dataset.open; }

  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      pal && pal.dataset.open === "true" ? closePalette() : openPalette();
    } else if (e.key === "Escape" && pal && pal.dataset.open === "true") closePalette();
  }, true);

  /* ---------- Avvio ---------- */
  sync();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startObservers, { once: true });
  else startObservers();
  console.info("[PAKE v6] caricato", { theme: off ? "off" : "on", libreria: index.length });
})();