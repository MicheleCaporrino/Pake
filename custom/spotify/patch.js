// 1. Ricarica quando torna la connessione
window.addEventListener('online', () => {
    console.log("Rete ripristinata, ricarico...");
    window.location.reload();
});

// 2. Forza tasto F5 e Ctrl+R
window.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        window.location.reload();
    }
}, true);

// 3. Mini-pulsante '↻' (controlla periodicamente che React non lo rimuova)
function ensureReloadButton() {
    if (document.getElementById('pake-reload-btn')) return;
    if (!document.body) return;

    const btn = document.createElement('button');
    btn.id = 'pake-reload-btn';
    btn.innerText = '↻';
    btn.title = 'Ricarica Spotify';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '95px',
        right: '20px',
        zIndex: '2147483647', // Sopra a qualsiasi elemento di Spotify
        backgroundColor: '#1db954',
        color: '#000000',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontWeight: '900',
        fontSize: '18px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    btn.onclick = (e) => {
        e.stopPropagation();
        window.location.reload();
    };

    document.body.appendChild(btn);
}

// Verifica la presenza ogni 2 secondi
setInterval(ensureReloadButton, 2000);