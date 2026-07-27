/* ============================================================
   Reality Kisumu Hub — PWA lifecycle
   ------------------------------------------------------------
   Service worker registration, update prompt, connectivity
   indicator and a non-hostile install invitation.

   The previous version fired a full-screen blocking modal every
   45 seconds, forever, on every page. It is now a dismissible
   bottom sheet that appears at most once and stays gone for a
   week after a decline.
   ============================================================ */
(function (window, document) {
    'use strict';

    var DISMISS_KEY = 'rk_install_dismissed_until';
    var DISMISS_DAYS = 7;
    var SHOW_AFTER_MS = 12000;   /* give people time to actually look around first */

    var deferredPrompt = null;
    var bannerShown = false;

    /* ---------------------------------------------------------
       Service worker
       --------------------------------------------------------- */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                /* A worker waiting to activate means new content is ready. */
                registration.addEventListener('updatefound', function () {
                    var incoming = registration.installing;
                    if (!incoming) return;
                    incoming.addEventListener('statechange', function () {
                        if (incoming.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateBar(registration);
                        }
                    });
                });
            }).catch(function (err) {
                console.warn('Service worker registration failed:', err);
            });

            /* Reload once the new worker takes over. */
            var refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', function () {
                if (refreshing) return;
                refreshing = true;
                window.location.reload();
            });
        });
    }

    function showUpdateBar(registration) {
        if (document.getElementById('rkUpdateBar')) return;
        var bar = document.createElement('div');
        bar.id = 'rkUpdateBar';
        bar.className = 'rk-update-bar';
        bar.innerHTML =
            '<span><i class="bi bi-arrow-clockwise" aria-hidden="true"></i> A new version is available.</span>' +
            '<button type="button" class="rk-update-btn">Refresh</button>';
        document.body.appendChild(bar);

        bar.querySelector('.rk-update-btn').addEventListener('click', function () {
            if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            bar.remove();
        });
    }

    /* ---------------------------------------------------------
       Connectivity indicator
       --------------------------------------------------------- */
    function setOfflineState(offline) {
        document.documentElement.classList.toggle('is-offline', offline);
        var bar = document.getElementById('rkOfflineBar');
        if (offline && !bar) {
            bar = document.createElement('div');
            bar.id = 'rkOfflineBar';
            bar.className = 'rk-offline-bar';
            bar.setAttribute('role', 'status');
            bar.innerHTML = '<i class="bi bi-wifi-off" aria-hidden="true"></i> You are offline &mdash; showing saved content';
            document.body.appendChild(bar);
        } else if (!offline && bar) {
            bar.remove();
            if (window.RK && window.RK.toast) window.RK.toast('Back online', 'success');
        }
    }

    window.addEventListener('online', function () { setOfflineState(false); });
    window.addEventListener('offline', function () { setOfflineState(true); });

    /* ---------------------------------------------------------
       Install invitation
       --------------------------------------------------------- */
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    function isDismissed() {
        try {
            var until = Number(window.localStorage.getItem(DISMISS_KEY));
            return isFinite(until) && until > Date.now();
        } catch (e) {
            return false;
        }
    }

    function rememberDismissal() {
        try {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 864e5));
        } catch (e) {}
    }

    function isIos() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
    }

    function showInstallBanner() {
        if (bannerShown || isStandalone() || isDismissed()) return;
        if (document.getElementById('rkInstallSheet')) return;
        /* Only invite when we can actually install, or on iOS where
           the browser never fires beforeinstallprompt. */
        if (!deferredPrompt && !isIos()) return;

        bannerShown = true;

        var sheet = document.createElement('div');
        sheet.id = 'rkInstallSheet';
        sheet.className = 'rk-install-sheet';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-label', 'Install Reality Kisumu Hub');
        sheet.innerHTML =
            '<img src="images/icon-192.png" alt="" class="rk-install-icon">' +
            '<div class="rk-install-copy">' +
                '<strong>Install Reality Kisumu Hub</strong>' +
                '<span>' + (deferredPrompt
                    ? 'Faster access and offline browsing from your home screen.'
                    : 'Tap Share, then &ldquo;Add to Home Screen&rdquo;.') + '</span>' +
            '</div>' +
            '<div class="rk-install-actions">' +
                (deferredPrompt ? '<button type="button" class="btn-primary-pill btn-sm-pill" data-install>Install</button>' : '') +
                '<button type="button" class="rk-install-close" data-install-dismiss aria-label="Dismiss">' +
                    '<i class="bi bi-x-lg" aria-hidden="true"></i>' +
                '</button>' +
            '</div>';

        document.body.appendChild(sheet);
        window.requestAnimationFrame(function () { sheet.classList.add('is-visible'); });

        var closeSheet = function (remember) {
            if (remember) rememberDismissal();
            sheet.classList.remove('is-visible');
            window.setTimeout(function () { sheet.remove(); }, 300);
        };

        var installBtn = sheet.querySelector('[data-install]');
        if (installBtn) {
            installBtn.addEventListener('click', function () {
                if (!deferredPrompt) return closeSheet(true);
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function (choice) {
                    if (choice.outcome !== 'accepted') rememberDismissal();
                    deferredPrompt = null;
                });
                closeSheet(false);
            });
        }

        sheet.querySelector('[data-install-dismiss]').addEventListener('click', function () {
            closeSheet(true);
        });
    }

    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        deferredPrompt = event;
        window.setTimeout(showInstallBanner, SHOW_AFTER_MS);
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        rememberDismissal();
        var sheet = document.getElementById('rkInstallSheet');
        if (sheet) sheet.remove();
        if (window.RK && window.RK.toast) window.RK.toast('App installed', 'success');
    });

    function boot() {
        if (!navigator.onLine) setOfflineState(true);
        /* iOS gets the hint on a delay since it has no install event. */
        if (isIos()) window.setTimeout(showInstallBanner, SHOW_AFTER_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.RKPwa = {
        isStandalone: isStandalone,
        showInstallBanner: showInstallBanner
    };
})(window, document);
