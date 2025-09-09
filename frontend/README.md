# Travira – Tourism Safety Management (Frontend)

A React-based administrative dashboard for monitoring tourist safety, managing incidents, system health, user access, AI analytics, notifications, reports, and blockchain-backed credential logs. This directory contains the frontend (Create React App). A Node/Express backend is located at ../backend.


## Monorepo Structure
- frontend/ (this directory): React app, TailwindCSS UI, routing, authentication context
- backend/: Express API with JWT auth, MongoDB (Mongoose), role-based access guards


## Features
- Authentication and Roles
  - Login with JWT-based session persistence (localStorage)
  - Role-based access (admin, officer, tourist)
- Dashboard
  - KPIs for tourists, incidents, safety score, officers on duty
  - Recent incidents and system health snapshot
- Tourist Monitoring
  - Live list of tourists with location and safety scores
  - High-risk identification and summary statistics
  - Search by ID/name
- Incident Management
  - List and filter by status/severity
  - Create new incidents (type, location, severity, touristId, description)
  - Timestamps, assignments, and status visibility
- AI Analytics
  - Safety score calculator via AI API
  - Metrics and alert stream (mocked)
  - 24-hour safety trend visualization
- System Health
  - Real-time service status and response times via /api/health
  - Overall health indicator and last updated time
- User Management
  - Fetch users from backend (admin role required)
  - Approve/reject, activate/suspend, delete users
  - Update user roles
- Reports
  - Generate incident reports via /api/ai/generate-report
  - Shows reportId and download URL from backend response
- Notifications
  - In-app notification center (filter by read/unread)
  - Broadcast messages (info/warning/alert/system)
- Blockchain Logs
  - Credential list and blockchain transaction logs (mocked UI)
  - Status badges, gas usage, block numbers, and verification markers


## UI Components (Key)
- Layout
  - Header: dynamic page title/description, search bar, user menu, notifications icon
  - Sidebar: route navigation with active route highlighting
- Patterns
  - KPI cards, tables, paginated/scrollable lists, forms, modals, badges, status chips
  - Responsive design using TailwindCSS utility classes
- Pages (src/pages)
  - Dashboard, UserManagement, TouristMonitoring, IncidentManagement, AIAnalytics, BlockchainLogs, SystemHealth, Reports, Notifications, Settings, Login


## Tech Stack
- Frontend
  - React 19, react-router-dom ^7
  - Create React App (react-scripts)
  - TailwindCSS + PostCSS + Autoprefixer
  - @heroicons/react for icons
  - React Testing Library & Jest (via CRA)
- Backend (../backend)
  - Node.js + Express
  - JWT authentication (jsonwebtoken)
  - MongoDB with Mongoose
  - CORS enabled


## Prerequisites
- Node.js (LTS) and npm
- MongoDB running locally (default: mongodb://localhost:27017)


## Configuration
- Frontend
  - API base URL is hardcoded in src/contexts/AuthContext.js as http://localhost:5000
  - Auth localStorage keys: guardianEagleUser, guardianEagleToken
- Backend
  - Port: 5000
  - JWT secret: JWT_SECRET env var (fallback default in index.js)
  - MongoDB: mongodb://localhost:27017/travira


## Install & Run (Windows PowerShell examples)
Open two terminals: one for backend and one for frontend.

1) Start Backend
- Requirements: MongoDB running locally
- Commands:
```powershell
cd "../backend"
node index.js
```
You should see logs: "Backend server running on http://localhost:5000" and "Connected to MongoDB".

2) Start Frontend
```powershell
cd "./frontend"
npm install
npm start
```
The app will open at http://localhost:3000.


## Scripts (Frontend)
- Start dev server
```powershell
npm start
```
- Build production assets
```powershell
npm run build
```
- Run tests (watch mode)
```powershell
npm test
```
- Run a single test file
```powershell
npm test -- src/App.test.js
```
- Run tests by name/pattern
```powershell
npm test -- -t "renders"
```


## API Overview (Backend)
- Auth
  - POST /api/register
  - POST /api/login
- Users (admin)
  - GET /api/users
  - PUT /api/users/:id (update role/status)
  - DELETE /api/users/:id
- Tourists (admin/officer)
  - GET /api/tourists
  - GET /api/tourists/:id
  - PUT /api/tourists/:id/safety-score
- Incidents (admin/officer unless otherwise guarded)
  - GET /api/incidents?status=&severity=
  - POST /api/incidents
  - PUT /api/incidents/:id
- System & Dashboard
  - GET /api/health
  - GET /api/dashboard/stats
  - GET /api/dashboard/recent-activity
- AI Services
  - POST /api/ai/safety-score
  - POST /api/ai/generate-report


## Demo Accounts (for Login page)
- Admin: admin / admin123
- Officer: officer1 / officer123
- Tourist: tourist1 / tourist123


## Notes
- If the backend base URL or port changes, update src/contexts/AuthContext.js (apiRequest helper).
- Clearing localStorage keys (guardianEagleUser, guardianEagleToken) signs the user out.

