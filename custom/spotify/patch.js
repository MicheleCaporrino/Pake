(function () {
    // 1. BLOCCO TELEMETRIA
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        if (url.includes('/telemetry') || url.includes('/melody') || url.includes('log.spotify.com') || url.includes('analytics')) {
            return Promise.resolve(new Response(JSON.stringify({ status: 200 })));
        }
        return originalFetch.apply(this, arguments);
    };

    // 2. GARBAGE COLLECTOR (SVUOTA-RAM)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);
    window.addEventListener('online', () => window.location.reload());

    // 3. TEMA CSS BLINDATO E INIETTATO DA JS
    const THEME_CSS = `
        :root {
          --background-base: #07080a !important;
          --background-highlight: #12141a !important;
          --background-press: #0e1015 !important;
          --background-elevated-base: #0f1117 !important;
          --background-elevated-highlight: #1a1d27 !important;
          --text-base: #f0f1f5 !important;
          --text-subdued: #888d9e !important;
          --essential-positive: #1ed760 !important;
        }
        body, .Root__top-container, .main-view-container, .main-view-container__scroll-node-child {
          background-color: var(--background-base) !important;
          background-image: none !important;
        }
        nav, .Root__nav-bar {
          background-color: #040507 !important;
          border-right: 1px solid rgba(255, 255, 255, 0.03) !important;
        }
        .Root__nav-bar li a.active {
          background-color: rgba(30, 215, 96, 0.08) !important;
          border-radius: 8px !important;
          color: var(--essential-positive) !important;
        }
        [data-testid="card-click-handler"], div[data-testid="grid-container"] > div {
          border-radius: 12px !important;
          background-color: var(--background-elevated-base) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          transition: transform 0.2s cubic-bezier(0.3, 0, 0, 1), background-color 0.2s ease !important;
        }
        [data-testid="card-click-handler"]:hover, div[data-testid="grid-container"] > div:hover {
          background-color: var(--background-elevated-highlight) !important;
          border-color: rgba(30, 215, 96, 0.4) !important;
          transform: translateY(-4px) scale(1.01) !important;
        }
        footer, [data-testid="now-playing-bar"] {
          background-color: rgba(10, 11, 15, 0.98) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .playback-bar .progress-bar__slider, .volume-bar .progress-bar__slider {
          background-color: var(--essential-positive) !important;
          height: 6px !important; border-radius: 6px !important;
        }
        .progress-bar__bg { background-color: rgba(255, 255, 255, 0.1) !important; }
        button[data-testid="play-button"] {
          transform: scale(1.05) !important; transition: transform 0.15s ease, filter 0.15s ease !important;
        }
        button[data-testid="play-button"]:hover {
          transform: scale(1.1) !important; filter: brightness(1.2) !important;
        }
        * {
          backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
          box-shadow: none !important; text-shadow: none !important;
        }
        div[data-testid="now-playing-widget"] video, .main-view-container video, canvas {
          display: none !important;
        }
        ::-webkit-scrollbar { width: 8px !important; }
        ::-webkit-scrollbar-track { background: transparent !important; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important; border: 2px solid var(--background-base) !important;
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(30, 215, 96, 0.6) !important; }
        div[role="row"], [data-testid="tracklist-row"] {
          content-visibility: auto !important; contain-intrinsic-size: 56px !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'pake-custom-style';
    styleEl.textContent = THEME_CSS;

    const THEME_KEY = 'pake_custom_theme_enabled';
    let isThemeEnabled = localStorage.getItem(THEME_KEY) !== 'false';

    function applyTheme() {
        if (isThemeEnabled) {
            if (!document.head.contains(styleEl)) document.head.appendChild(styleEl);
        } else {
            if (document.head.contains(styleEl)) styleEl.remove();
        }
    }
    // Forza l'applicazione ogni 2 secondi per difendersi dai reset di React
    setInterval(applyTheme, 2000);
    applyTheme();

    // 4. COMMAND PALETTE (CTRL + Q)
    const palette = document.createElement('div');
    palette.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.65); display: none;
        align-items: flex-start; justify-content: center;
        padding-top: 15vh; z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background: #141622; border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px; width: 490px; max-width: 90vw;
        box-shadow: 0 20px 40px rgba(0,0,0,0.8); overflow: hidden;
    `;

    function updatePaletteHTML() {
        box.innerHTML = `
            <div style="padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #1ed760; font-size: 13px; font-weight: 700; text-transform: uppercase;">Spotify Command Center</span>
                <span style="color: #6a6f85; font-size: 11px;">ESC per chiudere</span>
            </div>
            <div id="pake-palette-items" style="padding: 8px;">
                <div class="pake-item" data-action="clean-ram" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>⚡ <b>Libera RAM (Forza GC)</b></span>
                </div>
                <div class="pake-item" data-action="toggle-theme" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>🎨 <b>Tema Moderno</b></span>
                    <span style="background: ${isThemeEnabled ? '#1ed760' : '#33374b'}; color: ${isThemeEnabled ? '#000' : '#aaa'}; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                        ${isThemeEnabled ? 'ATTIVO' : 'DISATTIVATO'}
                    </span>
                </div>
                <div class="pake-item" data-action="reload" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>🔄 <b>Ricarica (F5)</b></span>
                </div>
            </div>
        `;
    }

    updatePaletteHTML();
    palette.appendChild(box);

    function togglePalette() {
        if (!document.body.contains(palette)) document.body.appendChild(palette);
        const isOpen = palette.style.display === 'flex';
        if (!isOpen) updatePaletteHTML();
        palette.style.display = isOpen ? 'none' : 'flex';
    }

    palette.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.pake-item');
        if (item) item.style.background = '#23273c';
    });
    palette.addEventListener('mouseout', (e) => {
        const item = e.target.closest('.pake-item');
        if (item) item.style.background = 'transparent';
    });

    palette.addEventListener('click', (e) => {
        if (e.target === palette) { palette.style.display = 'none'; return; }
        const item = e.target.closest('.pake-item');
        if (!item) return;

        const action = item.getAttribute('data-action');
        if (action === 'clean-ram') {
            cleanRAM();
        } else if (action === 'toggle-theme') {
            isThemeEnabled = !isThemeEnabled;
            localStorage.setItem(THEME_KEY, isThemeEnabled);
            applyTheme();
            updatePaletteHTML();
            return;
        } else if (action === 'reload') {
            window.location.reload();
        }
        palette.style.display = 'none';
    });

    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            e.preventDefault(); e.stopPropagation(); togglePalette();
        } else if (e.key === 'Escape' && palette.style.display === 'flex') {
            palette.style.display = 'none';
        } else if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
            e.preventDefault(); window.location.reload();
        }
    }, true);
})();