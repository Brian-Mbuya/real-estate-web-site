/* ============================================================
   Reality Kisumu Hub — Shared UI Kernel
   ------------------------------------------------------------
   One source of truth for: property shape, price formatting,
   favorites storage, card markup, and card interactions.

   Everything lives behind window.RK so nothing leaks into the
   global scope and collides with page scripts (the old code
   crashed because two files both declared `const SUPPORT_PHONE`).
   ============================================================ */
(function (window, document) {
    'use strict';

    var SUPPORT_PHONE = '+254746632821';
    var FAV_KEY = 'rk_favorites_v2';
    var LEGACY_FAV_KEY = 'favoriteHouses';
    var CURRENCY_KEY = 'rk_currency';
    var PLACEHOLDER_IMG = 'images/luxury.jpg';

    /* ---------------------------------------------------------
       Escaping — property text comes from the database and is
       injected into markup. Never trust it.
       --------------------------------------------------------- */
    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /* ---------------------------------------------------------
       Safe localStorage — private browsing / disabled storage
       throws on access, which used to take whole pages down.
       --------------------------------------------------------- */
    function readStore(key, fallback) {
        try {
            var raw = window.localStorage.getItem(key);
            if (!raw) return fallback;
            var parsed = JSON.parse(raw);
            return parsed === null ? fallback : parsed;
        } catch (e) {
            return fallback;
        }
    }

    function writeStore(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    /* ---------------------------------------------------------
       Property normalisation — the DB row shape is converted
       exactly once, here, instead of in four different pages.
       --------------------------------------------------------- */
    function normalizeProperty(row) {
        if (!row) return null;
        var usd = Number(row.price_usd);
        var ksh = Number(row.price_ksh);
        if (!isFinite(usd)) usd = 0;
        // Fall back to a sane conversion when the KSh column is empty.
        if (!isFinite(ksh) || ksh <= 0) ksh = Math.round(usd * 129);

        return {
            id: row.id,
            title: row.title || 'Untitled property',
            location: row.location || 'Kisumu, Kenya',
            type: row.type || 'Property',
            beds: Number(row.beds) || 0,
            baths: Number(row.baths) || 0,
            sqft: Number(row.sqft) || 0,
            priceUsd: usd,
            priceKsh: ksh,
            image: row.image_url || PLACEHOLDER_IMG,
            agentPhone: row.agent_phone || SUPPORT_PHONE,
            createdAt: row.created_at || null
        };
    }

    /* ---------------------------------------------------------
       Currency — the database has always carried price_ksh but
       the UI only ever showed USD. Both are now available and
       the choice persists across pages.
       --------------------------------------------------------- */
    var currencyFormatters = {
        USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
        KES: new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 })
    };

    function getCurrency() {
        var stored = readStore(CURRENCY_KEY, null);
        return stored === 'USD' ? 'USD' : 'KES';
    }

    function setCurrency(code) {
        var next = code === 'USD' ? 'USD' : 'KES';
        writeStore(CURRENCY_KEY, next);
        syncCurrencyToggles();
        emit('rk:currencychange', { currency: next });
        return next;
    }

    function formatPrice(property, currency) {
        var code = currency || getCurrency();
        if (code === 'USD') return currencyFormatters.USD.format(property.priceUsd);
        return 'KSh ' + currencyFormatters.KES.format(property.priceKsh);
    }

    /* Compact form for tight spaces: KSh 58.5M / $450K */
    function formatPriceShort(property, currency) {
        var code = currency || getCurrency();
        var value = code === 'USD' ? property.priceUsd : property.priceKsh;
        var prefix = code === 'USD' ? '$' : 'KSh ';
        var abs = Math.abs(value);
        if (abs >= 1e9) return prefix + (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (abs >= 1e6) return prefix + (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (abs >= 1e3) return prefix + Math.round(value / 1e3) + 'K';
        return prefix + value;
    }

    /* ---------------------------------------------------------
       Favorites — keyed by id, stores the whole normalised
       property so the Saved page works with no network at all.
       --------------------------------------------------------- */
    var Favorites = {
        all: function () {
            var list = readStore(FAV_KEY, null);
            if (Array.isArray(list)) return list;
            return migrateLegacyFavorites();
        },
        has: function (id) {
            return this.all().some(function (item) { return String(item.id) === String(id); });
        },
        count: function () {
            return this.all().length;
        },
        add: function (property) {
            var list = this.all();
            if (!this.has(property.id)) {
                list.push(property);
                writeStore(FAV_KEY, list);
                emit('rk:favoriteschange', { id: property.id, saved: true, count: list.length });
            }
            return true;
        },
        remove: function (id) {
            var list = this.all().filter(function (item) { return String(item.id) !== String(id); });
            writeStore(FAV_KEY, list);
            emit('rk:favoriteschange', { id: id, saved: false, count: list.length });
            return false;
        },
        /* Returns the NEW saved state so callers can update the UI. */
        toggle: function (property) {
            return this.has(property.id) ? this.remove(property.id) : this.add(property);
        },
        clear: function () {
            writeStore(FAV_KEY, []);
            emit('rk:favoriteschange', { count: 0 });
        }
    };

    /* Old builds stored a different shape under a different key. */
    function migrateLegacyFavorites() {
        var legacy = readStore(LEGACY_FAV_KEY, null);
        if (!Array.isArray(legacy)) {
            writeStore(FAV_KEY, []);
            return [];
        }
        var migrated = legacy.map(function (item) {
            var usd = Number(item.priceNum);
            if (!isFinite(usd)) usd = Number(String(item.price || '').replace(/[^0-9.]/g, '')) || 0;
            return normalizeProperty({
                id: item.id,
                title: item.title || item.address,
                location: item.location || item.address,
                type: item.category,
                beds: item.beds,
                baths: item.baths,
                sqft: item.sqft,
                price_usd: usd,
                price_ksh: item.priceKsh,
                image_url: item.img,
                agent_phone: item.agentPhone
            });
        }).filter(function (item) { return item && item.id; });

        writeStore(FAV_KEY, migrated);
        try { window.localStorage.removeItem(LEGACY_FAV_KEY); } catch (e) {}
        return migrated;
    }

    /* ---------------------------------------------------------
       Avatars

       Generated from the person's initials rather than a stock
       photo. images/u.jpg was previously used as the profile
       picture everywhere — it is actually a photograph of a
       house, so every "agent" rendered as a cropped bungalow.
       --------------------------------------------------------- */
    var AVATAR_COLORS = ['#4a85d1', '#128a4d', '#b4632a', '#7a4bbf', '#c2405a', '#0f7d8c'];

    function initialsOf(name) {
        var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '?';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function avatarDataUri(name) {
        var text = initialsOf(name);
        /* Deterministic colour so the same person keeps the same avatar. */
        var sum = 0;
        String(name || '').split('').forEach(function (ch) { sum += ch.charCodeAt(0); });
        var bg = AVATAR_COLORS[sum % AVATAR_COLORS.length];

        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">' +
            '<rect width="96" height="96" fill="' + bg + '"/>' +
            '<text x="48" y="48" dy="0.35em" fill="#ffffff" font-size="38" font-weight="700" ' +
            'text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif">' + text + '</text>' +
        '</svg>';

        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    /* ---------------------------------------------------------
       Contact links
       --------------------------------------------------------- */
    function telLink(phone) {
        return 'tel:' + String(phone || SUPPORT_PHONE).replace(/[^0-9+]/g, '');
    }

    function whatsappLink(phone, subject) {
        var digits = String(phone || SUPPORT_PHONE).replace(/[^0-9]/g, '');
        var text = subject
            ? 'Hi! I am interested in "' + subject + '" listed on Reality Kisumu Hub. Could you share more details?'
            : 'Hi Reality Kisumu Hub! I would like help finding a property.';
        return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(text);
    }

    /* ---------------------------------------------------------
       Card markup — ONE card component, used by the landing
       page, the feed and the saved page. Previously there were
       three that had drifted apart visually.

       Note there are no inline onclick handlers: interactions
       are wired by delegation in mountCards() below. That kills
       the old `JSON.stringify(...)`-into-an-attribute approach
       which broke on any title containing a quote.
       --------------------------------------------------------- */
    function propertyCardHTML(property, options) {
        var opts = options || {};
        var saved = opts.saved !== undefined ? opts.saved : Favorites.has(property.id);
        var compact = opts.variant === 'compact';

        var specs = [];
        if (property.beds > 0) specs.push({ icon: 'bi-door-open', label: property.beds + ' bed' + (property.beds > 1 ? 's' : '') });
        if (property.baths > 0) specs.push({ icon: 'bi-droplet', label: property.baths + ' bath' + (property.baths > 1 ? 's' : '') });
        if (property.sqft > 0) specs.push({ icon: 'bi-rulers', label: property.sqft.toLocaleString() + ' sq ft' });

        var specsHTML = specs.map(function (spec) {
            return '<li><i class="bi ' + spec.icon + '" aria-hidden="true"></i>' + escapeHtml(spec.label) + '</li>';
        }).join('');

        var priceText = compact ? formatPriceShort(property) : formatPrice(property);
        var safeTitle = escapeHtml(property.title);

        var actionsHTML = compact ? '' :
            '<div class="prop-actions">' +
                '<a class="prop-btn prop-btn-wa" data-action="whatsapp" href="' + escapeHtml(whatsappLink(property.agentPhone, property.title)) + '" target="_blank" rel="noopener">' +
                    '<i class="bi bi-whatsapp" aria-hidden="true"></i><span>WhatsApp</span>' +
                '</a>' +
                '<a class="prop-btn prop-btn-call" data-action="call" href="' + escapeHtml(telLink(property.agentPhone)) + '">' +
                    '<i class="bi bi-telephone-fill" aria-hidden="true"></i><span>Call</span>' +
                '</a>' +
            '</div>';

        return '' +
        '<article class="prop-card' + (compact ? ' prop-card-compact' : '') + '" data-id="' + escapeHtml(property.id) + '">' +
            '<div class="prop-media">' +
                '<a class="prop-media-link" data-action="open" href="listing.html?id=' + encodeURIComponent(property.id) + '" aria-label="View details for ' + safeTitle + '">' +
                    '<img src="' + escapeHtml(property.image) + '" alt="" loading="lazy" decoding="async" onerror="this.src=\'' + PLACEHOLDER_IMG + '\'">' +
                '</a>' +
                '<span class="prop-type-badge">' + escapeHtml(property.type) + '</span>' +
                '<button type="button" class="prop-fav' + (saved ? ' is-saved' : '') + '" data-action="fav"' +
                    ' aria-pressed="' + (saved ? 'true' : 'false') + '"' +
                    ' aria-label="' + (saved ? 'Remove ' : 'Save ') + safeTitle + '">' +
                    '<i class="bi ' + (saved ? 'bi-heart-fill' : 'bi-heart') + '" aria-hidden="true"></i>' +
                '</button>' +
            '</div>' +
            '<div class="prop-body">' +
                '<p class="prop-price">' + escapeHtml(priceText) + '</p>' +
                '<h3 class="prop-title">' +
                    '<a data-action="open" href="listing.html?id=' + encodeURIComponent(property.id) + '">' + safeTitle + '</a>' +
                '</h3>' +
                '<p class="prop-location"><i class="bi bi-geo-alt" aria-hidden="true"></i>' + escapeHtml(property.location) + '</p>' +
                (specsHTML ? '<ul class="prop-specs">' + specsHTML + '</ul>' : '') +
                actionsHTML +
            '</div>' +
        '</article>';
    }

    /* Loading placeholders so pages never show a bare "Loading..." string. */
    function skeletonHTML(count, variant) {
        var compact = variant === 'compact';
        var one = '<div class="prop-card prop-skeleton' + (compact ? ' prop-card-compact' : '') + '" aria-hidden="true">' +
            '<div class="prop-media skeleton-block"></div>' +
            '<div class="prop-body">' +
                '<div class="skeleton-line skeleton-line-lg"></div>' +
                '<div class="skeleton-line"></div>' +
                '<div class="skeleton-line skeleton-line-sm"></div>' +
            '</div>' +
        '</div>';
        return new Array(count + 1).join(one);
    }

    /* Consistent empty / error state instead of ad-hoc <p> tags. */
    function stateHTML(options) {
        var opts = options || {};
        return '<div class="prop-state">' +
            '<div class="prop-state-icon"><i class="bi ' + escapeHtml(opts.icon || 'bi-search') + '" aria-hidden="true"></i></div>' +
            '<h3>' + escapeHtml(opts.title || 'Nothing here yet') + '</h3>' +
            '<p>' + escapeHtml(opts.body || '') + '</p>' +
            (opts.actionHref
                ? '<a class="btn-primary-pill" href="' + escapeHtml(opts.actionHref) + '">' + escapeHtml(opts.actionLabel || 'Continue') + '</a>'
                : '') +
            (opts.retry ? '<button type="button" class="btn-primary-pill" data-action="retry">Try again</button>' : '') +
        '</div>';
    }

    /* ---------------------------------------------------------
       Card interactions via delegation.

       One listener on the container handles every card, so
       re-rendering the list never loses its handlers and adding
       500 cards adds zero listeners.
       --------------------------------------------------------- */
    function mountCards(container, getProperty) {
        if (!container || container.dataset.rkMounted === 'true') return;
        container.dataset.rkMounted = 'true';

        container.addEventListener('click', function (event) {
            var actionEl = event.target.closest('[data-action]');
            if (!actionEl || !container.contains(actionEl)) return;

            var card = actionEl.closest('.prop-card');
            var action = actionEl.dataset.action;

            /* Let real links behave like real links (new tab, copy address,
               middle-click). Only the favorite button needs interception. */
            if (action !== 'fav') return;

            event.preventDefault();
            event.stopPropagation();
            if (!card) return;

            var property = getProperty(card.dataset.id);
            if (!property) return;

            var nowSaved = Favorites.toggle(property);
            updateFavButton(actionEl, property, nowSaved);
            toast(nowSaved ? 'Saved to your favorites' : 'Removed from favorites', nowSaved ? 'success' : 'info');
        });
    }

    function updateFavButton(button, property, saved) {
        button.classList.toggle('is-saved', saved);
        button.setAttribute('aria-pressed', saved ? 'true' : 'false');
        button.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + property.title);
        var icon = button.querySelector('i');
        if (icon) icon.className = 'bi ' + (saved ? 'bi-heart-fill' : 'bi-heart');
        if (saved) {
            button.classList.remove('pulse');
            void button.offsetWidth; /* restart the animation */
            button.classList.add('pulse');
        }
    }

    /* Keep every rendered heart in sync when favorites change in
       another tab or another part of the page. */
    function refreshFavButtons(root) {
        var scope = root || document;
        scope.querySelectorAll('.prop-card[data-id]').forEach(function (card) {
            var button = card.querySelector('[data-action="fav"]');
            if (!button) return;
            var saved = Favorites.has(card.dataset.id);
            button.classList.toggle('is-saved', saved);
            button.setAttribute('aria-pressed', saved ? 'true' : 'false');
            var icon = button.querySelector('i');
            if (icon) icon.className = 'bi ' + (saved ? 'bi-heart-fill' : 'bi-heart');
        });
    }

    /* ---------------------------------------------------------
       Toasts — replaces alert(), which blocks the whole page.
       --------------------------------------------------------- */
    var toastHost = null;

    function toast(message, tone) {
        if (!toastHost) {
            toastHost = document.createElement('div');
            toastHost.className = 'rk-toast-host';
            toastHost.setAttribute('role', 'status');
            toastHost.setAttribute('aria-live', 'polite');
            document.body.appendChild(toastHost);
        }
        var el = document.createElement('div');
        el.className = 'rk-toast rk-toast-' + (tone || 'info');
        el.textContent = message;
        toastHost.appendChild(el);

        window.setTimeout(function () {
            el.classList.add('is-leaving');
            window.setTimeout(function () { el.remove(); }, 300);
        }, 2600);
    }

    /* ---------------------------------------------------------
       Saved-count badge in the navigation
       --------------------------------------------------------- */
    function syncFavBadges() {
        var count = Favorites.count();
        document.querySelectorAll('[data-fav-count]').forEach(function (el) {
            el.textContent = count > 99 ? '99+' : String(count);
            el.hidden = count === 0;
        });
    }

    /* ---------------------------------------------------------
       Currency toggle wiring
       --------------------------------------------------------- */
    function syncCurrencyToggles() {
        var current = getCurrency();
        document.querySelectorAll('[data-currency]').forEach(function (button) {
            var active = button.dataset.currency === current;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function initCurrencyToggles() {
        document.querySelectorAll('[data-currency]').forEach(function (button) {
            button.addEventListener('click', function () { setCurrency(button.dataset.currency); });
        });
        syncCurrencyToggles();
    }

    /* ---------------------------------------------------------
       Small helpers
       --------------------------------------------------------- */
    function emit(name, detail) {
        window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    }

    function debounce(fn, wait) {
        var timer = null;
        return function () {
            var args = arguments, self = this;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () { fn.apply(self, args); }, wait);
        };
    }

    /* Marks the current page in both navigations so the active
       state can never drift from the actual URL again. */
    function markActiveNav() {
        var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        document.querySelectorAll('[data-nav]').forEach(function (link) {
            var isActive = link.dataset.nav.toLowerCase() === page;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    /* ---------------------------------------------------------
       Boot
       --------------------------------------------------------- */
    function init() {
        markActiveNav();
        initCurrencyToggles();
        syncFavBadges();
    }

    window.addEventListener('rk:favoriteschange', function () {
        syncFavBadges();
        refreshFavButtons();
    });

    /* Favorites edited in another tab should be reflected here. */
    window.addEventListener('storage', function (event) {
        if (event.key === FAV_KEY) {
            syncFavBadges();
            refreshFavButtons();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.RK = {
        SUPPORT_PHONE: SUPPORT_PHONE,
        PLACEHOLDER_IMG: PLACEHOLDER_IMG,
        escapeHtml: escapeHtml,
        normalizeProperty: normalizeProperty,
        avatarDataUri: avatarDataUri,
        initialsOf: initialsOf,
        getCurrency: getCurrency,
        setCurrency: setCurrency,
        formatPrice: formatPrice,
        formatPriceShort: formatPriceShort,
        Favorites: Favorites,
        telLink: telLink,
        whatsappLink: whatsappLink,
        propertyCardHTML: propertyCardHTML,
        skeletonHTML: skeletonHTML,
        stateHTML: stateHTML,
        mountCards: mountCards,
        refreshFavButtons: refreshFavButtons,
        syncFavBadges: syncFavBadges,
        toast: toast,
        debounce: debounce,
        markActiveNav: markActiveNav
    };
})(window, document);
