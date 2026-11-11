(function () {
    // 1. GARBAGE COLLECTOR (MANUTENZIONE RAM)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);
    window.addEventListener('online', () => window.location.reload());

    // 2. TEMA SEAMLESS FLUENT (Elegante, nativo, senza margini)
    const THEME_CSS = `
        /* Palette Premium */
        html.pake-custom-theme {
            --background-base: #121212 !important;
            --background-highlight: #1f1f1f !important;
            --background-press: #000000 !important;
            --background-elevated-base: #242424 !important;
            --background-elevated-highlight: #2a2a2a !important;
            --text-base: #ffffff !important;
            --text-subdued: #a7a7a7 !important;
            --essential-positive: #1ed760 !important;
        }

        /* 1. RESET DEI MARGINI E SFONDO GLOBALE */
        html.pake-custom-theme body,
        html.pake-custom-theme .Root__top-container,
        html.pake-custom-theme [data-testid="root"] {
            background-color: #000000 !important;
            padding: 0 !important; /* Rimuove tutti i margini esterni errati! */
            margin: 0 !important;
        }

        /* 2. SIDEBAR E PLAYER (Nero Assoluto, Flat) */
        html.pake-custom-theme nav, 
        html.pake-custom-theme .Root__nav-bar {
            background-color: #000000 !important;
            border: none !important;
        }
        
        html.pake-custom-theme .Root__now-playing-bar,
        html.pake-custom-theme footer,
        html.pake-custom-theme [data-testid="now-playing-bar"] {
            background-color: #000000 !important;
            border: none !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
            margin: 0 !important;
            width: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
        }

        /* 3. VISTA PRINCIPALE (Grigio scuro con bordo nativo arrotondato) */
        html.pake-custom-theme .main-view-container,
        html.pake-custom-theme .Root__main-view,
        html.pake-custom-theme .Root__right-sidebar {
            background-color: var(--background-base) !important;
            border-radius: 8px !important;
            border: none !important;
        }

        /* 4. CARD ALBUM/PLAYLIST (Niente bordi, hover elegante) */
        html.pake-custom-theme [data-testid="card-click-handler"],
        html.pake-custom-theme div[data-testid="grid-container"] > div {
            background-color: transparent !important;
            border-radius: 8px !important;
            border: none !important;
            transition: background-color 0.2s ease !important;
        }
        html.pake-custom-theme [data-testid="card-click-handler"]:hover,
        html.pake-custom-theme div[data-testid="grid-container"] > div:hover {
            background-color: rgba(255, 255, 255, 0.06) !important;
            transform: none !important; /* Disattiva sobbalzi strani */
        }

        /* 5. BARRA PROGRESSIONE (Bianca nativa, Verde all'hover) */
        html.pake-custom-theme .progress-bar__slider {
            background-color: #ffffff !important;
            border-radius: 4px !important;
            height: 4px !important;
            box-shadow: none !important;
            transition: background-color 0.2s ease !important;
        }
        html.pake-custom-theme .progress-bar:hover .progress-bar__slider {
            background-color: var(--essential-positive) !important;
        }

        /* 6. PULIZIA UI (Nasconde i bottoni fastidiosi) */
        html.pake-custom-theme a[href*="download"],
        html.pake-custom-theme a[href*="premium"],
        html.pake-custom-theme button[aria-label*="Install"],
        html.pake-custom-theme button[aria-label*="Upgrade"],
        html.pake-custom-theme [data-testid="upgrade-button"] {
            display: none !important;
        }

        /* 7. SCROLLBAR E PERFORMANCES (Niente Blur) */
        html.pake-custom-theme * {
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        html.pake-custom-theme video, 
        html.pake-custom-theme canvas {
            display: none !important;
        }
        html.pake-custom-theme ::-webkit-scrollbar { width: 10px !important; }
        html.pake-custom-theme ::-webkit-scrollbar-track { background: transparent !important; }
        html.pake-custom-theme ::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.2) !important; 
            border-radius: 10px !important; 
            border: 3px solid var(--background-base) !important;
        }
        html.pake-custom-theme ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4) !important; }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'pake-custom-style';
    styleEl.textContent = THEME_CSS;

    const THEME_KEY = 'pake_custom_theme_enabled';
    let isThemeEnabled = localStorage.getItem(THEME_KEY) !== 'false';

    function applyTheme() {
        if (!document.documentElement) return;
        if (isThemeEnabled) {
            document.documentElement.classList.add('pake-custom-theme');
            if (document.head && !document.head.contains(styleEl)) document.head.appendChild(styleEl);
        } else {
            document.documentElement.classList.remove('pake-custom-theme');
            if (document.head && document.head.contains(styleEl)) styleEl.remove();
        }
    }
    
    setInterval(applyTheme, 1500); 
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
        background: #121212; border: 1px solid rgba(255, 255, 255, 0.1);
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
                    <span>✨ <b>Tema Seamless Modern</b></span>
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
        if (!document.body) return;
        if (!document.body.contains(palette)) document.body.appendChild(palette);
        const isOpen = palette.style.display === 'flex';
        if (!isOpen) updatePaletteHTML();
        palette.style.display = isOpen ? 'none' : 'flex';
    }

    palette.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.pake-item');
        if (item) item.style.background = 'rgba(255,255,255,0.05)';
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