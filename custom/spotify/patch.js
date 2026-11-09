(function () {
    // 1. GARBAGE COLLECTOR (SVUOTA-RAM V8)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); console.log("GC eseguito"); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 120000); // Ogni 2 minuti invece che 3
    window.addEventListener('online', () => window.location.reload());

    // 2. TEMA ZINC MODERN (Look Premium macOS/Fluent)
    const THEME_CSS = `
        :root {
          --background-base: #09090b !important;       /* Zinc 950 */
          --background-highlight: #18181b !important;  /* Zinc 900 */
          --background-press: #09090b !important;
          --background-elevated-base: #18181b !important;
          --background-elevated-highlight: #27272a !important; /* Zinc 800 */
          --text-base: #f4f4f5 !important;
          --text-subdued: #a1a1aa !important;
          --essential-positive: #1ed760 !important;
        }
        
        /* Sfondo e Contenitori Principali */
        body, .Root__top-container, .main-view-container__scroll-node-child, [data-testid="top-bar-back-button"] {
          background-color: var(--background-base) !important;
          background-image: none !important;
        }
        nav, .Root__nav-bar { 
          background-color: var(--background-base) !important; 
          border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        /* Player Inferiore (Bordo superiore sottile e colore elevato) */
        footer, [data-testid="now-playing-bar"] {
          background-color: var(--background-elevated-base) !important; 
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* Card (Playlists, Album) con Bordi Arrotondati 12px e Hover "Pop" */
        [data-testid="card-click-handler"], div[data-testid="grid-container"] > div {
          border-radius: 12px !important;
          background-color: var(--background-elevated-base) !important;
          border: 1px solid rgba(255,255,255,0.03) !important;
          transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }
        [data-testid="card-click-handler"]:hover, div[data-testid="grid-container"] > div:hover {
          background-color: var(--background-elevated-highlight) !important;
          border-color: rgba(30, 215, 96, 0.3) !important;
          transform: translateY(-4px) !important; /* Sollevamento morbido */
          box-shadow: 0 10px 20px rgba(0,0,0,0.5) !important;
        }

        /* Pulsanti Play ultra-vibranti */
        button[data-testid="play-button"] {
          transition: transform 0.15s ease, filter 0.15s ease !important;
        }
        button[data-testid="play-button"]:hover {
          transform: scale(1.08) !important;
          filter: brightness(1.2) drop-shadow(0 0 10px rgba(30,215,96,0.4)) !important;
        }

        /* Cursori Volume e Avanzamento */
        .progress-bar__slider {
          background-color: var(--essential-positive) !important;
          border-radius: 50% !important;
        }

        /* Prestazioni: Blocca blur grafici */
        * {
          backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        
        /* Rimuovi sfondi animati pesanti */
        .main-home-content, .main-view-container__scroll-node-child > div:first-child {
          background-image: none !important;
        }
        div[data-testid="now-playing-widget"] video, .main-view-container video, canvas {
          display: none !important;
        }

        /* Scrollbar Minimalista Mac-style */
        ::-webkit-scrollbar { width: 6px !important; }
        ::-webkit-scrollbar-track { background: transparent !important; }
        ::-webkit-scrollbar-thumb { 
          background: rgba(255,255,255,0.15) !important; 
          border-radius: 10px; 
        }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3) !important; }

        /* VIRTUALIZZAZIONE DOM: Scarica le immagini e le righe dalla RAM quando scorri via */
        div[role="row"], [data-testid="tracklist-row"], img {
          content-visibility: auto !important;
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
    setInterval(applyTheme, 1500); // Riapplica se React sovrascrive
    applyTheme();

    // 3. COMMAND PALETTE (CTRL + Q)
    const palette = document.createElement('div');
    palette.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7); display: none;
        align-items: flex-start; justify-content: center;
        padding-top: 15vh; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background: #09090b; border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px; width: 490px; max-width: 90vw;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8); overflow: hidden;
    `;

    function updatePaletteHTML() {
        box.innerHTML = `
            <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #1ed760; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">SPOTIFY COMMANDER</span>
                <span style="color: #71717a; font-size: 11px;">ESC per chiudere</span>
            </div>
            <div id="pake-palette-items" style="padding: 8px;">
                <div class="pake-item" data-action="clean-ram" style="padding: 12px 16px; margin-bottom: 4px; border-radius: 8px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>⚡ <b>Libera RAM (Forza GC)</b></span>
                </div>
                <div class="pake-item" data-action="toggle-theme" style="padding: 12px 16px; margin-bottom: 4px; border-radius: 8px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>✨ <b>Tema Zinc Modern</b></span>
                    <span style="background: ${isThemeEnabled ? '#1ed760' : '#27272a'}; color: ${isThemeEnabled ? '#000' : '#a1a1aa'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800;">
                        ${isThemeEnabled ? 'ON' : 'OFF'}
                    </span>
                </div>
                <div class="pake-item" data-action="reload" style="padding: 12px 16px; border-radius: 8px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>🔄 <b>Ricarica / Fix Rete (F5)</b></span>
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
        if (item) item.style.background = '#18181b';
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