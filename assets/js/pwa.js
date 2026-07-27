// PWA Service Worker Registration & Installation Manager
// Reality Kisumu Hub

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => reg.update())
            .catch(err => console.error('ServiceWorker registration failed:', err));
    });
}

let deferredPrompt;
let bannerAutoDismissTimer = null;
const POPUP_DURATION_MS = 6000; // 6 seconds visible duration
const REPEAT_INTERVAL_MS = 45000; // 45 seconds periodic interval

// Check if user is currently viewing inside installed PWA app mode
function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Create and show centered PWA Install Modal
function showAppReminderBanner() {
    // Never show if user is already inside the standalone Web App
    if (isStandaloneApp()) return;
    if (document.getElementById('pwaReminderModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pwaReminderModal';
    overlay.className = 'animate-fade-scale';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1060;
        background: rgba(11, 25, 44, 0.5);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.4s ease;
    `;

    const modalBox = document.createElement('div');
    modalBox.style.cssText = `
        background: #ffffff;
        border-radius: 24px;
        padding: 32px 24px;
        width: 90%;
        max-width: 380px;
        text-align: center;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
    `;

    modalBox.innerHTML = `
        <img src="images/pwa_icon.png" alt="Reality Kisumu Hub App" style="width:72px;height:72px;border-radius:18px;object-fit:cover;box-shadow:0 8px 24px rgba(0,0,0,0.12);margin-bottom:20px">
        <h4 style="font-weight:800;color:#1e293b;margin-bottom:8px">Reality Kisumu Hub</h4>
        <p style="font-size:0.95rem;color:#64748b;line-height:1.5;margin-bottom:24px">Get the full experience! Install our app on your device for faster access and a smoother interface.</p>
        <div style="display:flex;flex-direction:column;gap:12px">
            <button id="pwaBannerInstallBtn" style="background:linear-gradient(135deg, #5B93D3, #3A73B3);color:#fff;border:none;border-radius:9999px;padding:14px;font-size:1.05rem;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(91,147,211,0.3);transition:transform 0.2s ease">Install App Now</button>
            <button id="pwaBannerDismissBtn" style="background:transparent;color:#94a3b8;border:none;font-size:0.95rem;font-weight:600;cursor:pointer;padding:10px">Not Right Now</button>
        </div>
    `;

    overlay.appendChild(modalBox);
    document.body.appendChild(overlay);

    const closeBanner = () => {
        if (bannerAutoDismissTimer) clearTimeout(bannerAutoDismissTimer);
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 400);
    };

    // Auto-dismiss after 15 seconds since it's a center modal
    bannerAutoDismissTimer = setTimeout(closeBanner, 15000);

    // Bind Install Button
    document.getElementById('pwaBannerInstallBtn').addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted PWA install');
                }
                deferredPrompt = null;
            });
        } else {
            alert('To install: Tap your browser menu (⋮) or Share icon, then select "Add to Home Screen" or "Install App".');
        }
        closeBanner();
    });

    // Bind Dismiss Button
    document.getElementById('pwaBannerDismissBtn').addEventListener('click', closeBanner);
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Initial popup on page start (after 1.5s), and periodic re-trigger every 45s if on website
document.addEventListener('DOMContentLoaded', () => {
    if (!isStandaloneApp()) {
        setTimeout(showAppReminderBanner, 1500);
        setInterval(showAppReminderBanner, REPEAT_INTERVAL_MS);
    }
});
