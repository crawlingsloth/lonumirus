# Lonumirus - Chilli Paste Delivery PWA

A React Progressive Web App (PWA) for managing chilli paste orders and deliveries in the Maldives. Built with React, TypeScript, Vite, Tailwind CSS, and IndexedDB for local data persistence.

## ✨ Features

### 🚢 Public Boat Pages
- Browse active delivery boats
- View boat details with image galleries and markdown content
- Mobile-first, responsive design

### 👥 Role-Based Access
- **Admin**: Full system management (boats, users, orders, batches)
- **Delivery**: View and manage delivery batches
- **Customer**: Place and track orders

### 📦 Order Management
- Create orders with boat or address delivery
- Upload payment slips (stored as base64)
- Track order status through workflow
- Generate unique daily short codes (000, 001, 002...)

### 🚚 Delivery Batches
- Create batches for delivery runs
- Group orders by destination
- Print-friendly manifests (A4)
- Thermal printer labels (58mm) with QR codes

### 📱 Progressive Web App
- Works offline after first load
- Installable on mobile devices
- Service worker for caching
- Responsive, mobile-first design

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open http://localhost:5173 in your browser

### Demo Credentials

The app comes with pre-seeded demo data:

- **Admin**: \`admin@example.com\` / \`demo123\`
- **Delivery**: \`delivery@example.com\` / \`demo123\`
- **Customer**: \`customer@example.com\` / \`demo123\`

Use the quick login buttons on the login page to get started!

## 🎯 Quick Demo Flow

1. **Login** using one of the quick login buttons
2. **Switch roles** using the role switcher in the header (Demo feature!)
3. **As Customer**:
   - Visit \`/boats\` to browse boats
   - Create a new order
   - Upload a payment slip
   - View your orders
4. **As Admin**:
   - Manage boats (add, edit, upload images)
   - View all orders and change statuses
   - Create delivery batches
   - Print manifests and labels
5. **As Delivery**:
   - View assigned batches
   - Mark orders as delivered

## 📁 Project Structure

\`\`\`
src/
├── components/         # Reusable React components
├── hooks/             # Custom React hooks
├── lib/               # Utilities (db, auth, utils, qr)
├── pages/             # Page components (admin, customer, delivery, public, print)
├── types/             # TypeScript type definitions
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
\`\`\`

## 🏗️ Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist/\` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## 🌐 Deploying to GitHub Pages

### Method 1: GitHub Actions (Recommended)

1. Create \`.github/workflows/deploy.yml\`:

\`\`\`yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v2
\`\`\`

2. Enable GitHub Pages in repository settings → Pages → Source: GitHub Actions

### Method 2: Manual with gh-pages

\`\`\`bash
npm run build
npm install -D gh-pages
npx gh-pages -d dist
\`\`\`

Enable GitHub Pages pointing to the \`gh-pages\` branch.

## 🔑 Key Features

### Order Workflow

\`\`\`
submitted → payment_confirmed → preparing → delivered
         ↓
     cancelled (admin only)
\`\`\`

### Daily Short Codes

Orders get unique 3-digit codes that reset daily (000-999).

### Gallery Management

- Upload multiple images
- Reorder with up/down buttons
- Set cover image
- Add captions

### Print Layouts

- **Manifest**: A4 table format
- **Labels**: 58mm thermal format with QR codes
- Both use CSS \`@media print\`

## 💾 Data Storage

All data is stored locally in IndexedDB:
- No backend required
- Works completely offline
- Data persists across sessions

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite
- React Router v7 (HashRouter)
- Tailwind CSS
- IndexedDB (idb)
- Service Worker for PWA

## 📱 Browser Support

- Modern browsers with ES6+ support
- IndexedDB required
- Service Worker for PWA features

## 📝 License

MIT License

---

**Tip**: Click "Demo Help" in the header for quick access to credentials and features!

