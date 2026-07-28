/* ============================================================
   Reality Kisumu Hub — Session, personalisation & global modals
   ------------------------------------------------------------
   Wrapped in an IIFE. The previous version declared bare
   top-level `const`s (SUPPORT_PHONE), which collided with the
   same declaration in page scripts and threw
   "Identifier has already been declared" — a parse-time error
   that silently killed entire pages.
   ============================================================ */
(function (window, document) {
    'use strict';

    var SUPPORT_PHONE = '+254746632821';
    var DISPLAY_PHONE = '+254 746 632 821';
    var SUPPORT_EMAIL = 'mboyabrian994@gmail.com';
    var USER_KEY = 'hub_user';

    /* ---------------------------------------------------------
       Session
       --------------------------------------------------------- */

    /* Returns the signed-in user, or null.

       The old implementation returned a hardcoded "Alex" with
       isLoggedIn:true whenever storage was empty — so a brand
       new visitor was greeted by name and never shown the
       Sign In button. Logged-out is now a real state. */
    function getCurrentUser() {
        try {
            var stored = window.localStorage.getItem(USER_KEY);
            if (!stored) return null;
            var user = JSON.parse(stored);
            if (user && user.isLoggedIn && user.fullName) return user;
            return null;
        } catch (e) {
            return null;
        }
    }

    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    function setCurrentUser(userObj) {
        var name = String(userObj.fullName || '').trim() || 'Guest';
        var user = {
            fullName: name,
            email: userObj.email || '',
            /* Generated initials avatar. The old default was
               images/u.jpg — a photo of a house. */
            avatar: userObj.avatar || avatarFor(name),
            isLoggedIn: true
        };
        try {
            window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch (e) {
            /* Storage unavailable — the session just won't persist. */
        }
        updatePersonalizedUI();
        /* Pages showing session-dependent content (the account page's
           identity card) re-render on this rather than needing a reload. */
        window.dispatchEvent(new CustomEvent('rk:sessionchange', { detail: { user: user } }));
        return user;
    }

    function logoutUser() {
        try { window.localStorage.removeItem(USER_KEY); } catch (e) {}
        updatePersonalizedUI();
        window.dispatchEvent(new CustomEvent('rk:sessionchange', { detail: { user: null } }));
        window.location.href = 'index.html';
    }

    function firstName(user) {
        return String(user.fullName || '').split(' ')[0] || 'there';
    }

    function getTimeBasedGreeting() {
        var hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 22) return 'Good evening';
        return 'Good night';
    }

    /* Falls back to a neutral grey initial if app.js somehow isn't loaded. */
    function avatarFor(name) {
        if (window.RK && window.RK.avatarDataUri) return window.RK.avatarDataUri(name);
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
            '<rect width="96" height="96" fill="#64748b"/></svg>');
    }

    function escapeHtml(value) {
        if (window.RK && window.RK.escapeHtml) return window.RK.escapeHtml(value);
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ---------------------------------------------------------
       Personalised chrome
       --------------------------------------------------------- */
    function updatePersonalizedUI() {
        var user = getCurrentUser();

        /* 1. Greeting headers — [data-greeting] instead of matching
              on CSS utility classes. */
        document.querySelectorAll('[data-greeting]').forEach(function (el) {
            if (user) {
                el.innerHTML = escapeHtml(getTimeBasedGreeting()) + ', <strong>' + escapeHtml(firstName(user)) + '</strong>';
            } else {
                el.innerHTML = 'Find your <strong>place in Kisumu</strong>';
            }
        });

        document.querySelectorAll('[data-greeting-sub]').forEach(function (el) {
            el.textContent = user
                ? 'Here are fresh listings picked for you today.'
                : 'Browse verified homes, land and commercial space across the county.';
        });

        /* 2. Navbar auth area */
        document.querySelectorAll('[data-auth-area]').forEach(function (area) {
            area.innerHTML = user ? loggedInMenuHTML(user) : loggedOutButtonsHTML();
        });

        /* 3. Mobile bottom-nav account tab.

           The href is NOT rewritten here. An earlier version pointed
           signed-in users at liked.html, which made Account and Saved
           two adjacent tabs leading to the same page. The tab always
           goes to account.html; only its label and icon change. */
        document.querySelectorAll('[data-nav="account.html"]').forEach(function (link) {
            var label = link.querySelector('.mobile-nav-label');
            var icon = link.querySelector('i');

            if (user) {
                link.setAttribute('aria-label', 'Account, signed in as ' + user.fullName);
                if (label) label.textContent = firstName(user);
                if (icon) icon.className = 'bi bi-person-fill';
            } else {
                link.setAttribute('aria-label', 'Account');
                if (label) label.textContent = 'Account';
                if (icon) icon.className = 'bi bi-person';
            }
        });

        if (window.RK && window.RK.markActiveNav) window.RK.markActiveNav();
    }

    function loggedOutButtonsHTML() {
        return '' +
            '<a href="login.html" class="btn-ghost-pill">Sign in</a>' +
            '<a href="signup.html" class="btn-primary-pill btn-sm-pill">Get started</a>';
    }

    function loggedInMenuHTML(user) {
        return '' +
        '<div class="dropdown">' +
            '<button class="btn-user-chip" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
                '<img src="' + escapeHtml(user.avatar || avatarFor(user.fullName)) + '" alt="">' +
                '<span>' + escapeHtml(firstName(user)) + '</span>' +
                '<i class="bi bi-chevron-down" aria-hidden="true"></i>' +
            '</button>' +
            '<ul class="dropdown-menu dropdown-menu-end rk-dropdown">' +
                '<li class="rk-dropdown-head">' +
                    '<strong>' + escapeHtml(user.fullName) + '</strong>' +
                    '<span>' + escapeHtml(user.email || 'Signed in') + '</span>' +
                '</li>' +
                '<li><hr class="dropdown-divider"></li>' +
                '<li><a class="dropdown-item" href="liked.html"><i class="bi bi-heart" aria-hidden="true"></i> Saved favorites</a></li>' +
                '<li><a class="dropdown-item" href="house.html"><i class="bi bi-compass" aria-hidden="true"></i> Explore listings</a></li>' +
                '<li><button type="button" class="dropdown-item" data-open-modal="contact"><i class="bi bi-headset" aria-hidden="true"></i> Contact support</button></li>' +
                '<li><hr class="dropdown-divider"></li>' +
                '<li><button type="button" class="dropdown-item text-danger" data-logout><i class="bi bi-box-arrow-right" aria-hidden="true"></i> Sign out</button></li>' +
            '</ul>' +
        '</div>';
    }

    /* ---------------------------------------------------------
       Contact links (kept for callers that still use them)
       --------------------------------------------------------- */
    function getWhatsAppLink(propertyTitle, customPhone) {
        if (window.RK && window.RK.whatsappLink) return window.RK.whatsappLink(customPhone, propertyTitle);
        var phone = String(customPhone || SUPPORT_PHONE).replace(/[^0-9]/g, '');
        return 'https://wa.me/' + phone;
    }

    function getPhoneCallLink(customPhone) {
        if (window.RK && window.RK.telLink) return window.RK.telLink(customPhone);
        return 'tel:' + (customPhone || SUPPORT_PHONE);
    }

    /* ---------------------------------------------------------
       Global modals

       Built once, lazily, then reused. Bootstrap's JS bundle is
       required — pages that omitted it (login/signup) used to
       throw a ReferenceError here.
       --------------------------------------------------------- */
    function buildModal(id, bodyHTML) {
        var existing = document.getElementById(id);
        if (existing) return existing;
        var wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = 'modal fade rk-modal';
        wrapper.tabIndex = -1;
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.innerHTML =
            '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">' +
                '<div class="modal-content">' + bodyHTML + '</div>' +
            '</div>';
        document.body.appendChild(wrapper);
        return wrapper;
    }

    function showModal(el) {
        if (!window.bootstrap || !window.bootstrap.Modal) {
            /* Graceful fallback rather than a hard crash. */
            if (window.RK && window.RK.toast) {
                window.RK.toast('Call ' + DISPLAY_PHONE + ' for support', 'info');
            }
            return;
        }
        window.bootstrap.Modal.getOrCreateInstance(el).show();
    }

    function modalHeader(icon, title, subtitle) {
        return '' +
        '<div class="modal-header rk-modal-header">' +
            '<div class="rk-modal-heading">' +
                '<span class="rk-modal-icon"><i class="bi ' + icon + '" aria-hidden="true"></i></span>' +
                '<div>' +
                    '<h2 class="rk-modal-title">' + title + '</h2>' +
                    '<p class="rk-modal-sub">' + subtitle + '</p>' +
                '</div>' +
            '</div>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
        '</div>';
    }

    function openContactModal() {
        var el = buildModal('rkContactModal',
            modalHeader('bi-headset', 'Contact &amp; support', 'We reply within business hours, Mon&ndash;Sat') +
            '<div class="modal-body">' +
                '<div class="rk-contact-actions">' +
                    '<a href="' + escapeHtml(getWhatsAppLink()) + '" target="_blank" rel="noopener" class="rk-contact-btn rk-contact-wa">' +
                        '<i class="bi bi-whatsapp" aria-hidden="true"></i>' +
                        '<span><strong>WhatsApp</strong><small>' + DISPLAY_PHONE + '</small></span>' +
                    '</a>' +
                    '<a href="' + escapeHtml(getPhoneCallLink()) + '" class="rk-contact-btn rk-contact-call">' +
                        '<i class="bi bi-telephone-fill" aria-hidden="true"></i>' +
                        '<span><strong>Call us</strong><small>' + DISPLAY_PHONE + '</small></span>' +
                    '</a>' +
                    '<a href="mailto:' + SUPPORT_EMAIL + '" class="rk-contact-btn rk-contact-mail">' +
                        '<i class="bi bi-envelope-fill" aria-hidden="true"></i>' +
                        '<span><strong>Email</strong><small>' + SUPPORT_EMAIL + '</small></span>' +
                    '</a>' +
                '</div>' +
                '<div class="rk-info-card">' +
                    '<strong><i class="bi bi-geo-alt-fill" aria-hidden="true"></i> Office</strong>' +
                    'Reality Kisumu Hub HQ, Riat Hills, Kisumu, Kenya<br>' +
                    '<span>Open Mon&ndash;Sat, 8:00 AM &ndash; 8:00 PM</span>' +
                '</div>' +
            '</div>');
        showModal(el);
    }

    function openAboutModal() {
        var el = buildModal('rkAboutModal',
            modalHeader('bi-buildings', 'About Reality Kisumu Hub', "Kisumu's digital property marketplace") +
            '<div class="modal-body rk-prose">' +
                '<p><strong>Reality Kisumu Hub</strong> connects property seekers with verified villas, city apartments, waterfront homes, commercial space and land across Kisumu County and beyond.</p>' +
                '<p>Every listing is checked before it goes live, prices are shown in both Kenyan Shillings and US Dollars, and you can reach the listing agent directly by call or WhatsApp &mdash; no middlemen, no signup wall.</p>' +
                '<p class="mb-0">Save the listings you like and they stay on your device, even offline.</p>' +
            '</div>');
        showModal(el);
    }

    function openPrivacyModal() {
        var el = buildModal('rkPrivacyModal',
            modalHeader('bi-shield-check', 'Privacy &amp; data', 'What we store and what we never share') +
            '<div class="modal-body rk-prose">' +
                '<p>We keep data collection to the minimum needed to run the marketplace.</p>' +
                '<ul>' +
                    '<li><strong>Saved favorites</strong> stay in your browser on this device. They are not uploaded.</li>' +
                    '<li><strong>Your phone number and email</strong> are never sold or shared with third parties.</li>' +
                    '<li><strong>Enquiries</strong> go straight to the listing agent over WhatsApp or a phone call.</li>' +
                    '<li><strong>Listing data</strong> is served read-only and protected by row level security.</li>' +
                '</ul>' +
                '<p class="mb-0">Clearing your browser data removes everything this app has stored about you.</p>' +
            '</div>');
        showModal(el);
    }

    /* ---------------------------------------------------------
       Delegated wiring for footer links, dropdown items, logout
       --------------------------------------------------------- */
    var MODALS = {
        contact: openContactModal,
        about: openAboutModal,
        privacy: openPrivacyModal
    };

    document.addEventListener('click', function (event) {
        var modalTrigger = event.target.closest('[data-open-modal]');
        if (modalTrigger) {
            event.preventDefault();
            var opener = MODALS[modalTrigger.dataset.openModal];
            if (opener) opener();
            return;
        }
        if (event.target.closest('[data-logout]')) {
            event.preventDefault();
            logoutUser();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePersonalizedUI);
    } else {
        updatePersonalizedUI();
    }

    /* Public API. Modal openers are also exposed as bare globals
       because some markup still calls them from onclick. */
    window.AuthHub = {
        getCurrentUser: getCurrentUser,
        isLoggedIn: isLoggedIn,
        setCurrentUser: setCurrentUser,
        logoutUser: logoutUser,
        getTimeBasedGreeting: getTimeBasedGreeting,
        getWhatsAppLink: getWhatsAppLink,
        getPhoneCallLink: getPhoneCallLink,
        openContactModal: openContactModal,
        openAboutModal: openAboutModal,
        openPrivacyModal: openPrivacyModal,
        updatePersonalizedUI: updatePersonalizedUI,
        SUPPORT_PHONE: SUPPORT_PHONE,
        DISPLAY_PHONE: DISPLAY_PHONE,
        SUPPORT_EMAIL: SUPPORT_EMAIL
    };

    window.openContactModal = openContactModal;
    window.openAboutModal = openAboutModal;
    window.openPrivacyModal = openPrivacyModal;
    window.logoutUser = logoutUser;
})(window, document);
