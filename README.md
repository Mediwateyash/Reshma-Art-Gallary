# Reshma's Art Gallery — Inventory Management Application

Production-ready, responsive Progressive Web Application (PWA) built for **Reshma's Art Gallery** to manage raw materials (Fevicol, wool, paints, canvases, threads, beads) and finished handcrafted products (paintings, handmade items, craft products).

---

## 🏗️ Architectural Overview

```
[ React + Vite + PWA ]  ──(HTTP / JSON)──>  [ Node.js + Express API ]  ──(Mongoose)──>  [ MongoDB Atlas ]
  (Port 5173 / Mobile)                            (Port 5000)                               (Cloud Cluster)
```

- **Frontend (`client/`)**: React 18, Vite 5, Vanilla CSS Design System, PWA scaffolding (`vite-plugin-pwa`), Lucide icons.
- **Backend (`server/`)**: Node.js, Express.js (ES Modules), CORS, Mongoose 8, centralized error handling.
- **Database**: MongoDB Atlas cloud cluster with environment variable credential isolation.

---

## 📁 Project Structure

```
reshmas-art-gallery/
├── package.json              # Root orchestration scripts
├── .gitignore                # Global ignore rules (ignores .env, node_modules, dist)
├── README.md                 # Project documentation
├── client/                   # Frontend React + Vite PWA Application
│   ├── .env.example          # Client environment template
│   ├── .env                  # Client local environment configuration
│   ├── index.html            # Web app entry with mobile/PWA meta tags
│   ├── package.json          # Client dependencies & scripts
│   ├── vite.config.js        # Vite & VitePWA configuration
│   ├── public/               # Static assets & PWA manifest icons
│   └── src/
│       ├── main.jsx          # React DOM mount & Service Worker registration
│       ├── App.jsx           # Root application component
│       ├── index.css         # Gallery design system & responsive layout CSS
│       ├── components/       # UI components (Header, Sidebar, BottomNav, StatusBadge)
│       ├── layouts/          # AppShell responsive layout wrapper
│       ├── pages/            # View pages (HomePage foundation dashboard)
│       ├── services/         # API services (api.js, health checker)
│       ├── hooks/            # Custom React hooks
│       ├── utils/            # Helper utilities
│       └── assets/           # Local assets
└── server/                   # Backend Node.js + Express REST API
    ├── .env.example          # Server environment template (placeholder only)
    ├── .env                  # Server local environment configuration (git ignored)
    ├── package.json          # Server dependencies & scripts
    └── src/
        ├── index.js          # Server entry point & listener
        ├── app.js            # Express app configuration & middleware
        ├── config/           # MongoDB Atlas connection & environment config
        ├── controllers/      # Route controllers (healthController.js)
        ├── routes/           # REST API routing (healthRoutes.js, index.js)
        ├── middleware/       # Centralized error handler & 404 handler
        ├── models/           # Mongoose data models
        ├── services/         # Business logic services
        └── utils/            # Utility functions
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/reshmas_art_gallery?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run from root:
```bash
npm run install:all
```
*Or individually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the Backend API
```bash
npm run dev:server
```
Backend runs on `http://localhost:5000`.

### 3. Start the Frontend Application
```bash
npm run dev:client
```
Frontend runs on `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 🩺 Health Check & API Verification

The backend exposes a health endpoint to verify server and database connectivity:

- **Endpoint**: `GET /api/health`
- **Sample 200 OK Response**:
```json
{
  "success": true,
  "message": "Reshma's Art Gallery API is running",
  "timestamp": "2026-09-05T07:15:00.000Z",
  "environment": "development",
  "uptimeSeconds": 42,
  "database": {
    "status": "connected",
    "connected": true
  }
}
```

---

## 🔒 Security & Best Practices

- Credentials and MongoDB connection strings are **never** hardcoded in source code.
- `.env` files are strictly excluded via `.gitignore`.
- MongoDB connection strings logged to the console have user credentials masked automatically.
- Centralized 404 and Error handling catches unhandled exceptions and prevents information leakage in production.
