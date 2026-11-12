(function () {
    // 1. GARBAGE COLLECTOR (attivo su Windows: --expose-gc è nei flag WebView2)
    function cleanRAM() {
        if (typeof window.gc === 'function') {
            try { window.gc(); } catch (e) {}
        }
    }
    window.addEventListener('blur', cleanRAM);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cleanRAM(); });
    setInterval(cleanRAM, 180000);

    // 2. TEMA: toggle della classe su <html> — theme.css è l'unica fonte di stile
    const THEME_KEY = 'pake_custom_theme_enabled';
    let isThemeEnabled = localStorage.getItem(THEME_KEY) !== 'false';

    function applyTheme() {
        if (!document.documentElement) return;
        document.documentElement.classList.toggle('pake-custom-theme', isThemeEnabled);
    }
    applyTheme();

    // 3. COMMAND PALETTE (Ctrl+Q / Cmd+Q)
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
                    <span>✨ <b>Tema Ultra-Modern</b></span>
                    <span style="background: ${isThemeEnabled ? '#1ed760' : '#27272a'}; color: ${isThemeEnabled ? '#000' : '#a1a1aa'}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800;">
                        ${isThemeEnabled ? 'ON' : 'OFF'}
                    </span>
                </div>
                <div class="pake-item" data-action="reload" style="padding: 12px 16px; border-radius: 8px; color: #f4f4f5; cursor: pointer; display: flex; justify-content: space-between;">
                    <span>🔄 <b>Ricarica (F5)</b></span>
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
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
            e.preventDefault(); e.stopPropagation(); togglePalette();
        } else if (e.key === 'Escape' && palette.style.display === 'flex') {
            palette.style.display = 'none';
        } else if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
            e.preventDefault(); window.location.reload();
        }
    }, true);
})();