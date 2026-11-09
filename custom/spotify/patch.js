// 1. Ricarica automatica appena torna internet se si era interrotto
window.addEventListener('online', () => {
    console.log("Rete ripristinata, ricarico Spotify...");
    window.location.reload();
});

// 2. Forza F5 e Ctrl+R a ricaricare sempre la webview
window.addEventListener('keydown', (e) => {
    if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        window.location.reload();
    }
}, true);

// 3. Mini-pulsante '↻' in basso a destra per emergenza
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.innerText = '↻';
    btn.title = 'Ricarica pagina';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: '999999',
        background: '#1db954',
        color: '#000',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        cursor: 'pointer',
        fontWeight: 'bold',
        opacity: '0.4',
        transition: 'opacity 0.2s'
    });
    btn.onmouseover = () => btn.style.opacity = '1';
    btn.onmouseout = () => btn.style.opacity = '0.4';
    btn.onclick = () => window.location.reload();
    document.body.appendChild(btn);
});