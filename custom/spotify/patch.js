(function () {
    // 1. BLOCCO TELEMETRIA E TRACKER IN MEMORIA
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        if (url.includes('/telemetry') || url.includes('/melody') || url.includes('log.spotify.com') || url.includes('analytics')) {
            return Promise.resolve(new Response(JSON.stringify({ status: 200 })));
        }
        return originalFetch.apply(this, arguments);
    };

    // 2. GARBAGE COLLECTOR (SVUOTA-RAM V8)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);
    window.addEventListener('online', () => window.location.reload());

    // 3. TEMA ULTRA-MODERNO (Pannelli Flottanti)
    const THEME_CSS = `
        html.pake-custom-theme, 
        html.pake-custom-theme body, 
        html.pake-custom-theme .encore-dark-theme,
        html.pake-custom-theme [data-theme="dark"] {
            --background-base: #09090b !important;
            --background-highlight: #18181b !important;
            --background-press: #27272a !important;
            --background-elevated-base: #121215 !important;
            --background-elevated-highlight: #27272a !important;
            --background-tinted-base: #09090b !important;
            --background-tinted-highlight: #18181b !important;
            --background-tinted-press: #27272a !important;
            --text-base: #f4f4f5 !important;
            --text-subdued: #a1a1aa !important;
            --essential-base: #1ed760 !important;
            --essential-highlight: #22c55e !important;
            --essential-positive: #1ed760 !important;
        }

        html.pake-custom-theme .Root__top-container {
            background-color: #000000 !important;
            padding: 10px 10px 0 10px !important;
            gap: 10px !important;
        }

        html.pake-custom-theme .main-view-container, 
        html.pake-custom-theme .Root__nav-bar,
        html.pake-custom-theme .Root__right-sidebar {
            background-color: var(--background-base) !important;
            border-radius: 12px !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            overflow: hidden !important;
        }

        html.pake-custom-theme .Root__now-playing-bar {
            background-color: #000000 !important;
        }
        
        html.pake-custom-theme footer, 
        html.pake-custom-theme [data-testid="now-playing-bar"] {
            background-color: #121215 !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            border-radius: 16px !important;
            margin: 0 10px 10px 10px !important;
            padding: 8px 16px !important;
            width: calc(100% - 20px) !important;
            box-sizing: border-box !important;
        }

        html.pake-custom-theme .main-view-container [data-testid="card-click-handler"],
        html.pake-custom-theme .main-view-container div[data-testid="grid-container"] > div {
            border-radius: 12px !important;
            border: 1px solid transparent !important;
            transition: transform 0.2s ease, background-color 0.2s ease !important;
        }
        html.pake-custom-theme .main-view-container [data-testid="card-click-handler"]:hover,
        html.pake-custom-theme .main-view-container div[data-testid="grid-container"] > div:hover {
            transform: translateY(-4px) !important;
            background-color: var(--background-highlight) !important;
            border-color: rgba(30, 215, 96, 0.3) !important;
        }

        html.pake-custom-theme .progress-bar__slider {
            background-color: var(--essential-positive) !important;
            border-radius: 8px !important;
            height: 6px !important;
        }
        html.pake-custom-theme button[data-testid="play-button"]:hover {
            transform: scale(1.05) !important;
            filter: brightness(1.2) !important;
        }

        html.pake-custom-theme ::-webkit-scrollbar { width: 8px !important; }
        html.pake-custom-theme ::-webkit-scrollbar-track { background: transparent !important; }
        html.pake-custom-theme ::-webkit-scrollbar-thumb { 
            background: rgba(255,255,255,0.15) !important; 
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
            // CONTROLLO DI SICUREZZA SALVAVITA (Evita lo schermo bianco)
            if (document.head && !document.head.contains(styleEl)) {
                document.head.appendChild(styleEl);
            }
        } else {
            document.documentElement.classList.remove('pake-custom-theme');
            if (document.head && document.head.contains(styleEl)) {
                styleEl.remove();
            }
        }
    }
    
    // Riprova ciclicamente per scavalcare React (molto più sicuro del MutationObserver)
    setInterval(applyTheme, 1500); 
    applyTheme();

    // 4. COMMAND PALETTE (CTRL + Q)
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
                    <span>✨ <b>Tema Ultra-Moderno Flottante</b></span>
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
        if (!document.body) return; // Controllo di sicurezza
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