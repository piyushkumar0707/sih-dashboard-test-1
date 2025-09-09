# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo-style structure with a React frontend (this directory) and a Node/Express backend at ../backend.
- Frontend is a Create React App (CRA) project using React Router, TailwindCSS, and @heroicons/react.
- Authentication state and API access are centralized in a React Context that targets the backend at http://localhost:5000.
- Backend exposes JWT-authenticated endpoints with role-based guards (admin/officer) and uses MongoDB at mongodb://localhost:27017/travira.

Common commands (frontend)
- Install dependencies
  - npm install
- Start dev server (CRA with fast refresh, ESLint checks run automatically)
  - npm start
- Build production assets
  - npm run build
- Run tests in watch mode (React Testing Library via react-scripts)
  - npm test
- Run a single test file
  - npm test -- src/App.test.js
- Run tests matching a name/pattern
  - npm test -- -t "renders"

Notes on linting (frontend)
- There is no standalone lint script. CRA runs ESLint during npm start and npm run build using the configured extends: ["react-app", "react-app/jest"].

Backend commands (from ../backend)
- Start the API server (requires local MongoDB running on default port)
  - node index.js
- Default API base URL expected by the frontend
  - http://localhost:5000

High-level architecture and flow
- Frontend application shell
  - src/App.js wires up BrowserRouter and renders the main layout (Header + Sidebar) around a Routes switch. Unauthenticated users are redirected to the Login page; authenticated users reach feature pages.
  - Route table (see src/App.js) maps to feature pages: Dashboard, UserManagement, TouristMonitoring, IncidentManagement, AIAnalytics, BlockchainLogs, SystemHealth, Reports, Notifications, Settings.
- Authentication and API access
  - src/contexts/AuthContext.js provides:
    - user and loading state, persisted in localStorage under guardianEagleUser and guardianEagleToken.
    - login(username, password): POSTs to /api/login and stores the returned JWT token and user profile.
    - logout(): clears local storage and resets auth state.
    - apiRequest(path, options): prefixes http://localhost:5000, attaches Authorization: Bearer <token> when available, and handles 401/403 by logging out. This central wrapper should be used for backend calls from pages/components.
- Layout and navigation
  - src/components/Layout/Sidebar.js lists navigation targets and highlights the active route. Update this file when adding/removing top-level pages.
  - src/components/Layout/Header.js sets per-route title/description via helper maps; update getPageTitle/getPageDescription when adding new routes.
- Styling
  - TailwindCSS is configured via postcss.config.js and tailwind.config.js (content: ./src/**/*.{js,jsx,ts,tsx}). Utility classes are used throughout components/pages; no extra build commands are needed beyond CRA scripts.
- PWA and performance
  - CRA’s service worker utilities are present (src/serviceWorkerRegistration.js). Registration is opt-in for production; adjust register() usage if offline/PWA behavior is required.

Backend overview (../backend)
- Server: Express app (index.js) with CORS and JSON parsing enabled.
- Auth: JWT-based with a shared secret (JWT_SECRET env var supported). Middleware authenticateToken and requireRole(...roles) protect routes.
- Data: Mongoose is used; connection string is mongodb://localhost:27017/travira. A User model exists in models/User.js. A seed.js script is present in the backend directory for sample data seeding (review before running).
- Notable endpoints (see index.js; some require admin/officer role):
  - POST /api/register, POST /api/login
  - GET /api/users, PUT /api/users/:id, DELETE /api/users/:id
  - GET /api/tourists, GET /api/tourists/:id, PUT /api/tourists/:id/safety-score
  - GET /api/incidents, POST /api/incidents, PUT /api/incidents/:id
  - GET /api/health
  - GET /api/dashboard/stats, GET /api/dashboard/recent-activity

Development workflow tips specific to this repo
- Adding a new top-level page
  - Create a component under src/pages/YourPage.js
  - Add a <Route path="/your-path" element={<YourPage />} /> to src/App.js
  - Add a matching entry to the Sidebar navigation and update title/description maps in Header.js
- Calling the backend from a page
  - Use const { apiRequest } = useAuth() and call apiRequest('/api/your-endpoint', { method: 'GET' | 'POST', body: JSON.stringify({...}) }) to ensure the JWT is sent and errors are handled consistently.

Key cross-cutting details
- The frontend assumes the backend runs on http://localhost:5000; update the base URL in src/contexts/AuthContext.js if the backend host/port changes.
- Auth state is persisted via localStorage (guardianEagleUser, guardianEagleToken). Clearing these will sign the user out.

