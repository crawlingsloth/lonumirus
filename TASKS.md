# Tasks - Lonumirus PWA

## 1. Project Setup & Configuration
- [ ] Initialize React + Vite + TypeScript project
- [ ] Configure Vite with HashRouter base path for GitHub Pages
- [ ] Install dependencies (React Router, Tailwind CSS, IndexedDB wrapper)
- [ ] Set up project structure (src/pages, src/components, src/lib, src/types)
- [ ] Configure Tailwind CSS (mobile-first)

## 2. Data Layer
- [ ] Create TypeScript interfaces for data models (User, Boat, Order, Batch, DailyCounter)
- [ ] Implement IndexedDB wrapper module (`src/lib/db.ts`)
- [ ] Implement seed data function
- [ ] Implement `generateShortCode()` function with daily counter
- [ ] Create data access functions (CRUD operations for each model)

## 3. Auth & Routing
- [ ] Set up React Router with HashRouter
- [ ] Create mock auth service (login/logout/getCurrentUser)
- [ ] Implement protected route wrapper component
- [ ] Create role-based redirect logic
- [ ] Implement role switcher functionality

## 4. Layout & Common Components
- [ ] Create main Layout component with Header
- [ ] Implement role switcher in header
- [ ] Create user menu with logout
- [ ] Create "Demo Help" modal component
- [ ] Create status badge component
- [ ] Create toast notification system
- [ ] Create loading spinner component

## 5. Login Page
- [ ] Create login page UI (prefilled admin credentials)
- [ ] Add quick login buttons (Admin, Delivery, Customer)
- [ ] Implement login logic

## 6. Public Boat Pages
- [ ] Create `/boats` page (grid of active boats)
- [ ] Create `/boats/:slug` page (boat detail with gallery, markdown, CTA)
- [ ] Implement image gallery component
- [ ] Implement basic markdown renderer (or plain text fallback)

## 7. Admin - Dashboard
- [ ] Create admin dashboard page (`/admin`)
- [ ] Implement KPI cards (order counts by status)
- [ ] Add quick action links

## 8. Admin - Boats Management
- [ ] Create boats list page (`/admin/boats`)
- [ ] Implement boat create/edit form (`/admin/boats/new`, `/admin/boats/:id`)
- [ ] Create image gallery manager (upload, reorder, set cover, caption, delete)
- [ ] Implement slug auto-generation from name
- [ ] Add "View Public Page" link
- [ ] Implement image to base64 conversion

## 9. Admin - Users Management
- [ ] Create users list page (`/admin/users`)
- [ ] Implement user table with actions
- [ ] Create user creation form
- [ ] Implement reset password action
- [ ] Implement soft delete action

## 10. Admin - Orders Management
- [ ] Create orders list page (`/admin/orders`)
- [ ] Implement filters (status, destination type, boat, text search)
- [ ] Create orders table with actions
- [ ] Implement order detail view/drawer
- [ ] Add "Create Order" form (on behalf of customer)
- [ ] Implement status change actions (payment confirmed, preparing, cancel)
- [ ] Show payment slip preview in detail view

## 11. Admin - Batches Management
- [ ] Create batches list page (`/admin/batches`)
- [ ] Create batch creation form
- [ ] Implement batch detail page (`/admin/batches/:id`)
- [ ] Create order picker component (show payment_confirmed/preparing orders)
- [ ] Implement batch status transitions
- [ ] Group orders by destination in batch view
- [ ] Add "Print Manifest" button & route
- [ ] Add "Print 58mm Labels" button & route

## 12. Delivery Pages
- [ ] Create delivery batches list (`/delivery/batches`)
- [ ] Create delivery batch detail (`/delivery/batches/:id`)
- [ ] Implement "Mark Delivered" action
- [ ] Implement "Set Preparing" action
- [ ] Add offline-friendly write queue (if time permits)

## 13. Customer Pages
- [ ] Create new order page (`/customer/new-order`)
- [ ] Implement product selection (250g/500g)
- [ ] Implement destination type toggle (Boat/Address)
- [ ] Create boat dropdown (active boats only)
- [ ] Create address form fields
- [ ] Implement payment slip upload (file to base64)
- [ ] Implement order submission with shortCode generation
- [ ] Create customer orders list page (`/customer/orders`)
- [ ] Create customer order detail page (`/customer/orders/:id`)
- [ ] Add shareable order link button (stub)

## 14. Shareable Order Link (Stub)
- [ ] Create share order route (`/share/order/:token`)
- [ ] Implement token-to-order resolution (local lookup)
- [ ] Show friendly message if order not found locally
- [ ] Implement "Copy Share Link" functionality

## 15. Print Routes
- [ ] Create print manifest route (`/admin/batches/:id/print-manifest`)
- [ ] Style manifest for A4 print with `@media print`
- [ ] Create print labels route (`/admin/batches/:id/print-labels`)
- [ ] Implement tiny QR code generator (canvas-based, no CDN)
- [ ] Style 58mm labels with CSS page-breaks
- [ ] Test print layouts

## 16. PWA Configuration
- [ ] Create `manifest.json` (name, icons, theme)
- [ ] Generate PWA icons (multiple sizes)
- [ ] Create service worker for offline caching
- [ ] Register service worker in main.tsx
- [ ] Test offline functionality

## 17. Visual Polish & Mobile-First
- [ ] Apply Tailwind mobile-first responsive classes throughout
- [ ] Style status colors (gray, blue, orange, green, red)
- [ ] Ensure large touch-friendly buttons
- [ ] Add card layouts for mobile
- [ ] Test on mobile device/emulator

## 18. Build & Deployment Setup
- [ ] Configure Vite base path for GitHub Pages
- [ ] Add build scripts to package.json
- [ ] Create GitHub Actions workflow for deployment (optional)
- [ ] Create README with setup and deployment instructions
- [ ] Test local build and preview

## 19. Testing & Acceptance
- [ ] Test login flow (all three roles)
- [ ] Test admin dashboard displays correct KPIs
- [ ] Test boat CRUD operations and gallery management
- [ ] Test boat public page rendering
- [ ] Test customer order creation (boat and address destinations)
- [ ] Test order status transitions
- [ ] Test batch creation and order assignment
- [ ] Test print manifest rendering
- [ ] Test print labels with QR codes
- [ ] Test delivery role batch management
- [ ] Test share link button and stub page
- [ ] Test offline mode after first load
- [ ] Test role switcher functionality
- [ ] Test on mobile device
- [ ] Verify GitHub Pages deployment works

## 20. Documentation & Final Touches
- [ ] Add OG meta tags to index.html (if feasible)
- [ ] Ensure all demo credentials are documented
- [ ] Add comments to complex code sections
- [ ] Final code cleanup
- [ ] Update README with demo credentials and walkthrough
