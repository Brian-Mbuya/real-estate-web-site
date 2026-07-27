# 🏠 Reality Kisumu Hub

An installable **Progressive Web App** for browsing verified property listings across Kisumu County, Kenya — homes, apartments, waterfront property, land and commercial space.

Prices are shown in **KSh or USD**, listings work **offline**, and buyers reach the listing agent directly by call or WhatsApp.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (no build step) |
| UI kit | Bootstrap 5.3 + Bootstrap Icons (CDN) |
| Data | Supabase (PostgreSQL + Realtime), read-only via RLS |
| Offline | Service Worker with three-tier caching |
| Install | Web App Manifest with maskable icons |

There is **no backend to run and no build step**. It is a static site — open it with any HTTP server.

---

## 🚀 Setup

```bash
python -m http.server 8127
```

Then open <http://localhost:8127>.

> Service workers require `http://localhost` or HTTPS. Opening the files
> directly with `file://` will disable offline support and the install prompt.

To point at your own Supabase project, either edit the constants at the top of
`assets/js/supabase.js`, or set `window.SUPABASE_URL` / `window.SUPABASE_ANON_KEY`
before that script loads. Run `supabase-schema.sql` then `supabase-seed-massive.sql`
in the Supabase SQL editor to create and populate the tables.

---

## 📂 Project Structure

```text
├── index.html              Landing page — featured listings
├── house.html              Explore — search, filters, categories
├── listing.html            Property detail page
├── liked.html              Saved favorites (works offline)
├── login.html / signup.html
├── offline.html            Shown when a page isn't cached
├── manifest.json           PWA manifest
├── sw.js                   Service worker
├── assets/
│   ├── css/main.css        Design system + all components
│   └── js/
│       ├── app.js          Shared kernel: cards, favorites, currency
│       ├── auth.js         Session, personalisation, global modals
│       ├── supabase.js     Database client + realtime
│       ├── forms.js        Form validation
│       └── pwa.js          Install prompt, updates, connectivity
├── supabase-schema.sql     Tables + row level security
└── supabase-seed-massive.sql
```

---

## 🧠 Architecture Notes

**One card component.** `RK.propertyCardHTML()` in `assets/js/app.js` renders every
property card on every page. The landing page passes `{variant:'compact'}`.
Changing card design means editing one function and one CSS block.

**No inline event handlers.** Cards are wired by event delegation
(`RK.mountCards`), so re-rendering a 500-item list attaches zero new listeners.
The whole card is clickable via a stretched `::after` on a real `<a>`, which keeps
middle-click, Ctrl+click and screen-reader behaviour intact.

**Data is normalised once.** `RK.normalizeProperty()` converts a database row into
the shape the UI uses, coercing every numeric field. Nothing downstream has to
guess whether a price is a number or a `"$450,000"` string.

**Everything is namespaced.** `app.js`, `auth.js`, `supabase.js`, `forms.js` and
`pwa.js` each run inside an IIFE and export a single global (`RK`, `AuthHub`,
`SupabaseHub`, `RKForms`, `RKPwa`). No bare top-level `const`s, which previously
collided between files and threw parse-time errors that killed whole pages.

### Caching strategy

| Cache | Contents | Strategy |
|---|---|---|
| `rk-shell-*` | HTML, CSS, JS, icons | Precached on install, stale-while-revalidate |
| `rk-runtime-*` | Images, CDN assets, fonts | Stale-while-revalidate |
| `rk-data-*` | Supabase REST reads | Network-first, cache fallback |

Because the shell is served cache-first, a deploy reaches users on their *second*
load. The service worker detects the waiting update and shows a "Refresh" bar.
Bump `VERSION` in `sw.js` on every release.

---

## ♿ Accessibility

- Visible focus ring on every interactive element
- Labelled bottom navigation (icons alone are not a label)
- `aria-pressed` on favorite toggles, `aria-live` on result counts
- Form errors wired via `aria-invalid` + `aria-describedby`
- Full `prefers-reduced-motion` support
- Skip-to-content link on every page

---

## 🔮 Future Improvements

- Real Supabase Auth instead of the current local demo session
- Sync favorites to the `user_favorites` table for signed-in users
- Multiple photos per listing with a gallery
- Map view of listings
- Server-side pagination (all listings are currently fetched at once)
