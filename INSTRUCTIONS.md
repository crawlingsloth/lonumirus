[OBUILD ME A REACT PWA DEMO (LOCAL-ONLY) READY FOR GITHUB PAGES

Goal
Create a small React PWA (TypeScript preferred) that demos an ordering & delivery workflow for a chilli-paste business in the Maldives. No backend: all data persists locally (IndexedDB or localStorage). I will demo it on my phone and also deploy it to GitHub Pages so others can click around.

High-level
- Tech: React + Vite (or CRA if easier) + TypeScript.
- Router: React Router with **HashRouter** (so it works on GitHub Pages).
- PWA: web app manifest + service worker for offline.
- Styling: minimal, mobile-first (Tailwind or lightweight CSS).
- No external CDNs; bundle all libs.
- Data: store in IndexedDB (preferred) or localStorage via a small wrapper.
- Seed demo data on first load.

Auth (mock)
- Prefilled login on the login screen.
- Demo users:
  - Admin: admin@example.com / demo123
  - Delivery: delivery@example.com / demo123
  - Customer: customer@example.com / demo123
- After login, land on Admin dashboard (if admin).
- A **role switcher** in the header (Admin/Delivery/Customer) lets me preview role UIs without logging out.

Data models
- User: { id, email, name?, role: 'admin'|'delivery'|'customer', passwordHash (plain ok), active: boolean }
- Boat: { id, code, name, slug, active, summary, aboutMd, deliveryNotesMd, images: [{id, dataUrl, caption, sortOrder, isCover}] }
- Order:
  {
    id, shortCode, customerId, createdAt,
    status: 'submitted'|'payment_confirmed'|'preparing'|'delivered'|'cancelled',
    product: { sku:'CHILLI-250G'|'CHILLI-500G', name, priceMvr },
    qty, totalMvr,
    destinationType: 'boat'|'address',
    boatId?,                                   // when 'boat'
    address?: { addressLine, island, atoll, contactName, contactPhone },
    paymentSlipDataUrl?, notes
  }
- Batch (ad-hoc run for delivery): { id, title, status:'planning'|'loading'|'out'|'completed'|'cancelled', orderIds: string[] }
- DailyCounter: { date: 'YYYY-MM-DD', next: number }  // to generate 000, 001, ...

Seed data
- 2 boats (NEJ “Nejma”, SUN “Sunrise Express”), each active with a dummy cover image.
- A few orders across statuses (submitted/address, payment_confirmed/boat, preparing/boat).
- Users as above.
- One example batch with 1–2 orders.

Routing (HashRouter)
- /login (prefilled admin creds)
- / (redirect to role-appropriate home)
- Public boat pages:
  - /boats (grid of active boats)
  - /boats/:slug (cover + gallery + markdown sections + CTA “Order for this boat”)
- Admin:
  - /admin (Ops dashboard)
  - /admin/boats (list)
  - /admin/boats/new, /admin/boats/:id (edit with gallery manager)
  - /admin/users (reset pwd, delete, create)
  - /admin/orders (table + filters; detail drawer/page)
  - /admin/batches (list)
  - /admin/batches/:id (manage batch)
- Delivery:
  - /delivery/batches (list)
  - /delivery/batches/:id (group by destination; mark delivered, set preparing)
- Customer:
  - /customer/new-order
  - /customer/orders
  - /customer/orders/:id (detail)

UI requirements

Header:
- App name, role switcher (Admin/Delivery/Customer), user menu (Logout).
- Small “Demo Help” modal: lists credentials and what to click to demo.

Login:
- Prefill admin@example.com / demo123; big “Login” button.
- Quick buttons: “Login as Delivery”, “Login as Customer”.

Admin › Dashboard (landing):
- KPI cards: Submitted, Payment Confirmed, Preparing, Delivered Today.
- Quick links: Add Boat, Manage Orders, Manage Users, Batches.

Admin › Boats:
- List with cover, code, name, active toggle, edit, view public page.
- Create/Edit form: code, name, slug (auto), active, summary, aboutMd, deliveryNotesMd.
- Gallery: upload multiple images (convert to base64), reorder (drag or up/down), set cover, caption, delete.
- “View Public Page” button.

Admin › Users:
- Table: email, role, active.
- Actions: Reset Password (to demo123), Delete (soft delete), Create User.

Admin › Orders:
- Filters: status pills, destination type (boat/address), boat select, text search (island/atoll/short code/email).
- Table: shortCode, product×qty, destination summary, status, actions.
- Row actions: View/Edit, Set Payment Confirmed, Set Preparing, Cancel, Create Order (on behalf of customer).
- Detail view shows payment slip preview and big shortCode.

Admin › Batches:
- Create batch (title).
- Add orders via picker (show only payment_confirmed/preparing).
- Batch page: status (planning → loading → out → completed), list grouped by destination (boat name OR address island/atoll).
- Print buttons:
  - “Print Manifest” (open print-friendly route)
  - “Print 58mm Labels” (open labels route)

Delivery:
- Batches list (same as Admin view but limited actions).
- Batch detail: groups; per order show shortCode, qty, destination summary; actions: “Mark Delivered”, “Set Preparing”. Offline-friendly (queue writes).

Customer:
- New Order:
  - Product select (250g / 500g), qty
  - Destination Type toggle (Boat or Address)
    - Boat: dropdown of active boats
    - Address: addressLine, island, atoll, contactName, contactPhone
  - Upload Payment Slip (file → base64 preview)
  - Submit → generate shortCode via daily counter; compute total; status=submitted.
- My Orders: list + statuses; detail page with slip preview.

Status machine (enforce in UI):
- submitted → payment_confirmed → preparing → delivered
- any → cancelled (admin only)
- Delivery can set preparing and delivered.

Shareable Order Link (stub)
- On order detail (Customer), show a **Share link** button that copies a URL like `/#/share/order/:token`
- Implement a **Share page** route that resolves `:token` to an order (locally it can look up by id or show a “This is a demo stub” message). It’s fine if this doesn’t truly work across devices now; just render the order if found locally or show a friendly stub note if not.

Printing (CSS, no PDF libs)
- **Manifest route**: clean A4 table (page title, date, totals).
  - Columns: # | Short Code | Customer | Qty | Destination (Boat / Island–Atoll) | Notes
  - Print with `@media print`.
- **58mm labels route**:
  - One label per order with big Short Code, small destination line, and a QR.
  - Provide a tiny bundled QR function (no CDN) that renders to canvas and inlines as data URL.
  - Use CSS page-breaks to render one label per “page”.

PWA & Offline
- Add manifest.json (name, icons) and register a service worker that caches app shell and static assets.
- App should work offline after first load.
- All uploads (slips, boat images) stored as base64 strings in IndexedDB/localStorage.

Dev ergonomics
- Provide a small `db` module (get/set/list) that wraps IndexedDB/localStorage with typed functions.
- Provide `generateShortCode()` that increments a stored per-day counter (pad to 3 digits).
- Provide a tiny markdown renderer (or render as plain text if too heavy).
- Keep components small and pages in `src/pages/*`.

Build & GH Pages
- Use Vite.
- Add `base` in `vite.config.ts` and **HashRouter** so it works under `https://<user>.github.io/<repo>/`.
- Add scripts:
  - `dev`: vite
  - `build`: vite build
  - `preview`: vite preview
  - (optional) GitHub Actions workflow to deploy `dist/` to gh-pages branch.
- README with steps:
  1) `npm i`
  2) `npm run dev`
  3) `npm run build`
  4) Deploy to GitHub Pages (give brief instructions using actions/gh-pages or manual).

Visual polish
- Mobile-first cards, large buttons.
- Status colors: submitted (gray), payment_confirmed (blue), preparing (orange), delivered (green), cancelled (red).
- Toasts for success/error.
- Public boat page has OG tags (if feasible within SPA).

Acceptance
- I can log in (prefilled), land on Admin dashboard.
- Add/edit a boat with images & text; view its public page.
- Create orders (as customer), see them in Admin; change statuses.
- Create a batch, add orders, open **Print Manifest** and **Print Labels**.
- Switch to Delivery and mark an order delivered.
- Share link button appears on customer order detail (stub is OK).
- Works offline after first load and can be deployed to GitHub Pages.
