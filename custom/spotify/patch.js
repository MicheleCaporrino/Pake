(function () {
    // 1. GARBAGE COLLECTOR (SVUOTA-RAM V8)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);
    window.addEventListener('online', () => window.location.reload());

    // 2. TEMA "CYBER-PILL / DYNAMIC ISLAND" (Design Spinto)
    const THEME_CSS = `
        /* Palette Cyber-Minimal */
        html.pake-custom-theme, 
        html.pake-custom-theme body {
            --background-base: #030303 !important;
            --background-highlight: #121212 !important;
            --background-press: #1a1a1a !important;
            --background-elevated-base: #0a0a0c !important;
            --background-elevated-highlight: #1c1c1e !important;
            --text-base: #ffffff !important;
            --text-subdued: #a1a1aa !important;
            --essential-positive: #1ed760 !important;
        }

        /* 1. Sfondo totale NERO ASSOLUTO e spaziatura maggiorata */
        html.pake-custom-theme .Root__top-container {
            background-color: #000000 !important;
            padding: 16px 16px 0 16px !important;
            gap: 16px !important;
        }

        /* 2. Pannelli iper-curvi (Stile iPadOS) */
        html.pake-custom-theme .main-view-container, 
        html.pake-custom-theme .Root__nav-bar,
        html.pake-custom-theme .Root__right-sidebar {
            background-color: #080808 !important;
            border-radius: 24px !important;
            border: 1px solid rgba(255, 255, 255, 0.04) !important;
            overflow: hidden !important;
        }

        /* 3. PLAYER INFERIORE "DYNAMIC ISLAND" (Pillola Sospesa) */
        html.pake-custom-theme .Root__now-playing-bar {
            background-color: #000000 !important;
        }
        html.pake-custom-theme footer, 
        html.pake-custom-theme [data-testid="now-playing-bar"] {
            background: linear-gradient(180deg, #0f0f12 0%, #050505 100%) !important;
            border: 1px solid rgba(30, 215, 96, 0.15) !important; /* Bordo verde sottile */
            border-radius: 28px !important;
            margin: 0 16px 16px 16px !important;
            padding: 10px 24px !important;
            width: calc(100% - 32px) !important;
            box-sizing: border-box !important;
            box-shadow: 0 15px 40px rgba(0,0,0,0.9) !important;
        }

        /* 4. Barre di avanzamento con effetto NEON GLOW */
        html.pake-custom-theme .progress-bar__slider {
            background-color: var(--essential-positive) !important;
            border-radius: 8px !important;
            height: 6px !important;
            box-shadow: 0 0 10px rgba(30, 215, 96, 0.7) !important; /* Glow verde */
        }
        html.pake-custom-theme .progress-bar__bg {
            background-color: rgba(255, 255, 255, 0.08) !important;
        }

        /* 5. Pulsante Play Levitante */
        html.pake-custom-theme button[data-testid="play-button"] {
            transform: scale(1.05) !important;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        html.pake-custom-theme button[data-testid="play-button"]:hover {
            transform: scale(1.15) !important;
            filter: brightness(1.3) !important;
            box-shadow: 0 5px 15px rgba(30, 215, 96, 0.4) !important;
        }

        /* 6. Hover Estremo sulle Card degli Album */
        html.pake-custom-theme .main-view-container [data-testid="card-click-handler"],
        html.pake-custom-theme .main-view-container div[data-testid="grid-container"] > div {
            border-radius: 16px !important;
            background: linear-gradient(145deg, #111111, #080808) !important;
            border: 1px solid rgba(255, 255, 255, 0.02) !important;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease !important;
        }
        html.pake-custom-theme .main-view-container [data-testid="card-click-handler"]:hover,
        html.pake-custom-theme .main-view-container div[data-testid="grid-container"] > div:hover {
            transform: translateY(-8px) scale(1.03) !important;
            border-color: rgba(30, 215, 96, 0.4) !important;
            background: linear-gradient(145deg, #1a1a1a, #0a0a0a) !important;
        }

        /* 7. Pulizia UI (Nascondi pulsanti di Upgrade e Installa App) */
        html.pake-custom-theme [aria-label="Upgrade to Premium"],
        html.pake-custom-theme [aria-label="Install App"],
        html.pake-custom-theme button[aria-label="Upgrade to Premium"] {
            display: none !important;
        }

        /* 8. Scrollbar e Prestazioni */
        html.pake-custom-theme ::-webkit-scrollbar { width: 8px !important; }
        html.pake-custom-theme ::-webkit-scrollbar-track { background: transparent !important; }
        html.pake-custom-theme ::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.1) !important; 
            border-radius: 10px !important; 
        }
        html.pake-custom-theme ::-webkit-scrollbar-thumb:hover { background: rgba(30,215,96,0.4) !important; }
        html.pake-custom-theme * {
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        html.pake-custom-theme video, 
        html.pake-custom-theme canvas,
        html.pake-custom-theme [data-testid="now-playing-widget"] video {
            display: none !important;
        }
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

    // 4. COMMAND PALETTE (CTRL + Q)
    const palette = document.createElement('div');
    palette.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.8); display: none;
        align-items: flex-start; justify-content: center;
        padding-top: 15vh; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        backdrop-filter: blur(8px); /* Solo la palette usa blur, è innocuo perché occasionale */
    `;
    const box = document.createElement('div');
    box.style.cssText = `
        background: #050505; border: 1px solid rgba(30, 215, 96, 0.2);
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