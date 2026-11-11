(function () {
    // 1. GARBAGE COLLECTOR
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);
    window.addEventListener('online', () => window.location.reload());

    // 2. TEMA "CYBER-PILL" (Selettori HTML Semantici e Inattaccabili)
    const THEME_CSS = `
        /* SFONDO GLOBALE NERO ASSOLUTO */
        html.pake-custom-theme, 
        html.pake-custom-theme body,
        html.pake-custom-theme #main {
            background-color: #000000 !important;
            background-image: none !important;
        }

        /* 1. SGANCIAMENTO PANNELLI DAI BORDI (Forza il gap nel grid principale di Spotify) */
        html.pake-custom-theme .Root__top-container,
        html.pake-custom-theme [data-testid="root"] {
            background-color: #000000 !important;
            padding: 12px 12px 0 12px !important;
            gap: 12px !important;
        }

        /* 2. STILE PANNELLI (Sinistra, Centro, Destra) */
        html.pake-custom-theme nav, 
        html.pake-custom-theme main, 
        html.pake-custom-theme aside,
        html.pake-custom-theme .main-view-container {
            background-color: #080808 !important;
            border-radius: 16px !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        /* 3. PLAYER "DYNAMIC ISLAND" (Pillola Flottante in basso) */
        html.pake-custom-theme footer,
        html.pake-custom-theme [data-testid="now-playing-bar"] {
            background: linear-gradient(180deg, #111111 0%, #050505 100%) !important;
            border: 1px solid rgba(30, 215, 96, 0.25) !important;
            border-radius: 30px !important;
            margin: 0 12px 12px 12px !important;
            padding: 8px 24px !important;
            width: auto !important; /* Annulla il 100% di default */
            box-shadow: 0 20px 40px rgba(0,0,0,0.9) !important;
        }

        /* Nascondi sfondi e bordi originali del player */
        html.pake-custom-theme footer > div {
            background-color: transparent !important;
            border: none !important;
        }

        /* 4. BARRE DI PROGRESSIONE CON NEON GLOW */
        html.pake-custom-theme .progress-bar__slider {
            background-color: #1ed760 !important;
            border-radius: 8px !important;
            height: 6px !important;
            box-shadow: 0 0 12px rgba(30, 215, 96, 0.8) !important;
        }
        html.pake-custom-theme .progress-bar__bg {
            background-color: rgba(255, 255, 255, 0.1) !important;
        }

        /* 5. HOVER CARD 3D (Senza ombre, usa transform) */
        html.pake-custom-theme [data-testid="card-click-handler"],
        html.pake-custom-theme div[data-testid="grid-container"] > div {
            border-radius: 12px !important;
            background: #111111 !important;
            border: 1px solid rgba(255, 255, 255, 0.03) !important;
            transition: transform 0.2s ease, border-color 0.2s ease !important;
        }
        html.pake-custom-theme [data-testid="card-click-handler"]:hover,
        html.pake-custom-theme div[data-testid="grid-container"] > div:hover {
            transform: translateY(-6px) scale(1.02) !important;
            border-color: rgba(30, 215, 96, 0.5) !important;
            background: #151515 !important;
        }

        /* 6. PULIZIA TOTALE INTERFACCIA (Via i pulsanti inutili) */
        html.pake-custom-theme a[href*="download"],
        html.pake-custom-theme a[href*="premium"],
        html.pake-custom-theme button[aria-label*="Install"],
        html.pake-custom-theme button[aria-label*="Upgrade"],
        html.pake-custom-theme button[aria-label*="Aggiorna"],
        html.pake-custom-theme [data-testid="upgrade-button"],
        html.pake-custom-theme button[class*="upgrade"] {
            display: none !important;
        }

        /* 7. PRESTAZIONI: STOP AL BLUR */
        html.pake-custom-theme * {
            backdrop-filter: none !important; 
            -webkit-backdrop-filter: none !important;
        }
        html.pake-custom-theme video, 
        html.pake-custom-theme canvas {
            display: none !important;
        }

        /* 8. SCROLLBAR ELEGANTE */
        html.pake-custom-theme ::-webkit-scrollbar { width: 6px !important; }
        html.pake-custom-theme ::-webkit-scrollbar-track { background: transparent !important; }
        html.pake-custom-theme ::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.15) !important; 
            border-radius: 10px !important; 
        }
        html.pake-custom-theme ::-webkit-scrollbar-thumb:hover { background: rgba(30,215,96,0.5) !important; }
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
    
    // Iniettiamo violentemente e ciclicamente per scavalcare React
    setInterval(applyTheme, 1000); 
    applyTheme();

    // 3. COMMAND PALETTE (CTRL + Q)
    const palette = document.createElement('div');
    palette.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.8); display: none;
        align-items: flex-start; justify-content: center;
        padding-top: 15vh; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background: #050505; border: 1px solid rgba(30, 215, 96, 0.3);
        border-radius: 20px; width: 490px; max-width: 90vw;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.9); overflow: hidden;
    `;

    function updatePaletteHTML() {
        box.innerHTML = `
            <div style="padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #1ed760; font-size: 14px; font-weight: 800; letter-spacing: 1px;">SPOTIFY COMMANDER</span>
                <span style="color: #71717a; font-size: 11px;">ESC per chiudere</span>
            </div>
            <div id="pake-palette-items" style="padding: 8px;">
                <div class="pake-item" data-action="clean-ram" style="padding: 12px 16px; margin-bottom: 4px; border-radius: 12px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>⚡ <b>Libera RAM (Forza GC)</b></span>
                </div>
                <div class="pake-item" data-action="toggle-theme" style="padding: 12px 16px; margin-bottom: 4px; border-radius: 12px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>✨ <b>Tema Cyber-Pill</b></span>
                    <span style="background: ${isThemeEnabled ? '#1ed760' : '#27272a'}; color: ${isThemeEnabled ? '#000' : '#a1a1aa'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900;">
                        ${isThemeEnabled ? 'ON' : 'OFF'}
                    </span>
                </div>
                <div class="pake-item" data-action="reload" style="padding: 12px 16px; border-radius: 12px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
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
        if (item) item.style.background = '#121212';
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