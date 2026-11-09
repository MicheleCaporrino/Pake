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

    // 2. FORZATURA GARBAGE COLLECTOR (SVUOTA-RAM)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try {
                window.gc();
                console.log("[Pake] RAM V8 spazzata con successo!");
            } catch (e) {}
        }
    }

    // Pulisci quando minimizzi la finestra, cambi applicazione o periodicamente
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cleanRAM();
    });
    setInterval(cleanRAM, 180000); // Ogni 3 minuti

    // 3. Riconnessione automatica di rete
    window.addEventListener('online', () => window.location.reload());

    // 4. Gestione Stato Tema (Attivo/Disattivo con memoria)
    const THEME_KEY = 'pake_custom_theme_enabled';
    let isThemeEnabled = localStorage.getItem(THEME_KEY) !== 'false';
    function applyTheme() {
        if (isThemeEnabled) document.documentElement.classList.add('pake-custom-theme');
        else document.documentElement.classList.remove('pake-custom-theme');
    }
    applyTheme();
    document.addEventListener('DOMContentLoaded', applyTheme);
    setInterval(applyTheme, 2000);

    // 5. Command Palette (CTRL + Q)
    const palette = document.createElement('div');
    palette.id = 'pake-command-palette';
    palette.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.65); display: none;
        align-items: flex-start; justify-content: center;
        padding-top: 15vh; z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
                    <span>⚡ <b>Libera RAM Istantaneamente (GC)</b></span>
                    <kbd style="background:#202334; padding:2px 6px; border-radius:4px; font-size:11px; color:#1ed760;">Libera</kbd>
                </div>
                <div class="pake-item" data-action="toggle-theme" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>🎨 <b>Tema Moderno</b></span>
                    <span style="background: ${isThemeEnabled ? '#1ed760' : '#33374b'}; color: ${isThemeEnabled ? '#000' : '#aaa'}; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                        ${isThemeEnabled ? 'ATTIVO' : 'DISATTIVATO'}
                    </span>
                </div>
                <div class="pake-item" data-action="reload" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>🔄 <b>Ricarica Pagina</b></span>
                    <kbd style="background:#202334; padding:2px 6px; border-radius:4px; font-size:11px; color:#a0a5bb;">F5</kbd>
                </div>
                <div class="pake-item" data-action="hard-reload" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>🧹 <b>Pulisci Cache e Ricarica</b></span>
                </div>
                <div class="pake-item" data-action="fullscreen" style="padding: 12px 14px; border-radius: 8px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                    <span>⛶ <b>Schermo Intero</b></span>
                    <kbd style="background:#202334; padding:2px 6px; border-radius:4px; font-size:11px; color:#a0a5bb;">F11</kbd>
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
            alert("Pulizia della memoria forzata con successo!");
        } else if (action === 'toggle-theme') {
            isThemeEnabled = !isThemeEnabled;
            localStorage.setItem(THEME_KEY, isThemeEnabled);
            applyTheme();
            updatePaletteHTML();
            return;
        } else if (action === 'reload') {
            window.location.reload();
        } else if (action === 'hard-reload') {
            window.location.href = window.location.origin + '?cache_bust=' + Date.now();
        } else if (action === 'fullscreen') {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
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