const fs = require('fs');

const windowRsPath = 'src-tauri/src/app/window.rs';

if (fs.existsSync(windowRsPath)) {
    let content = fs.readFileSync(windowRsPath, 'utf8');

    // I flag da passare direttamente all'API WebView2 nativa di Tauri
    const flags = [
        "--renderer-process-limit=1",
        "--in-process-gpu",
        "--js-flags=--max-old-space-size=256",
        "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,CalculateNativeWinOcclusion,MediaRouter,OptimizationHints,Translate",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-domain-reliability",
        "--disk-cache-size=31457280"
    ].join(' ');

    const rustInjection = `
        #[cfg(target_os = "windows")]
        {
            window_builder = window_builder.additional_browser_args("${flags}");
        }
    `;

    // Cerchiamo il punto in cui Pake istanzia la finestra e iniettiamo i flag
    if (!content.includes("additional_browser_args")) {
        // Pake ha 'window_builder' definito in build_window_with_label
        const target = 'let mut window_builder =';
        
        if (content.includes(target)) {
            // Iniettiamo i flag appena dopo la dichiarazione del builder
            const index = content.indexOf(target);
            const semicolonIndex = content.indexOf(';', index);
            
            content = content.slice(0, semicolonIndex + 1) + 
                      rustInjection + 
                      content.slice(semicolonIndex + 1);

            fs.writeFileSync(windowRsPath, content, 'utf8');
            console.log("Ottimizzazioni native WebView2 iniettate con successo in window.rs!");
        } else {
            console.warn("Pattern window_builder non trovato in window.rs");
        }
    } else {
        console.log("Ottimizzazioni gia presenti in window.rs");
    }
} else {
    console.warn("File src-tauri/src/app/window.rs non trovato.");
}