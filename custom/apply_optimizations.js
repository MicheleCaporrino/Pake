const fs = require('fs');
const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');

    // La riga esatta usata da Pake per inizializzare gli argomenti Windows
    const target = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection --disable-blink-features=AutomationControlled");';

    // La riga con i nostri flag incorporati + sblocco DevTools (F12)
    const optimized = 'let mut windows_browser_args = String::from("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate --disable-blink-features=AutomationControlled --renderer-process-limit=1 --in-process-gpu --js-flags=--max-old-space-size=256 --disable-background-networking --disable-component-update --disable-domain-reliability --disk-cache-size=31457280");\n    window_builder = window_builder.devtools(true);';

    if (content.includes(target)) {
        content = content.replace(target, optimized);
        fs.writeFileSync(windowRsPath, content, 'utf8');
        console.log("Ottimizzazioni WebView2 e DevTools iniettati con successo in windows_browser_args!");
    } else {
        // Fallback regex nel caso di spaziature differenti
        const regex = /let\s+mut\s+windows_browser_args\s*=\s*String::from\("([^"]+)"\);/;
        if (regex.test(content)) {
            content = content.replace(regex, (match, originalArgs) => {
                return `let mut windows_browser_args = String::from("${originalArgs} --renderer-process-limit=1 --in-process-gpu --js-flags=--max-old-space-size=256 --disable-features=CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate --disable-background-networking --disable-component-update --disable-domain-reliability --disk-cache-size=31457280");\n    window_builder = window_builder.devtools(true);`;
            });
            fs.writeFileSync(windowRsPath, content, 'utf8');
            console.log("Ottimizzazioni WebView2 iniettate con successo via regex!");
        } else {
            console.error("ERRORE: Impossibile trovare windows_browser_args in window.rs");
        }
    }
} else {
    console.warn("File src-tauri/src/app/window.rs non trovato.");
}