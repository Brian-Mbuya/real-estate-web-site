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

// Create and show PWA Install Reminder Toast Banner on site startup
function showAppReminderBanner() {
    if (document.getElementById('pwaReminderBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwaReminderBanner';
    banner.className = 'animate-fade-up';
    banner.style.cssText = `
        position: fixed;
        bottom: 84px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1050;
        width: 90%;
        max-width: 460px;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(91, 147, 211, 0.3);
        border-radius: 20px;
        padding: 14px 16px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 14px;
    `;

    banner.innerHTML = `
        <img src="images/pwa_icon.png" alt="Banana Real Estate App Icon" style="width:48px;height:48px;border-radius:14px;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,0.15);flex-shrink:0">
        <div style="flex:1">
            <div style="font-weight:800;font-size:0.88rem;color:#1e293b;line-height:1.2">Reality Kisumu Hub</div>
            <div style="font-size:0.76rem;color:#64748b;line-height:1.3;margin-top:2px">It's better as an app! Install on your home screen for a faster experience.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button id="pwaBannerInstallBtn" style="background:linear-gradient(135deg, #6da2e4, #4a85d1);color:#fff;border:none;border-radius:9999px;padding:6px 14px;font-size:0.76rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(82,137,216,0.3)">Install App</button>
            <button id="pwaBannerDismissBtn" style="background:transparent;color:#94a3b8;border:none;font-size:0.72rem;font-weight:600;cursor:pointer">Dismiss</button>
        </div>
    `;

    document.body.appendChild(banner);

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
            alert('To install on your home screen: Tap your browser Share/Menu button and select "Add to Home Screen"');
        }
        banner.remove();
    });

    // Bind Dismiss Button
    document.getElementById('pwaBannerDismissBtn').addEventListener('click', () => {
        banner.remove();
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// Always trigger reminder banner on page load/restart
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showAppReminderBanner, 1000);
});
