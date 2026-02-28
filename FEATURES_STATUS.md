# Travira — Full Feature Breakdown, Tasks, Roadmap & Edge Cases

---

## Table of Contents
1. [Feature Areas](#1-feature-areas)
2. [Tasks by Feature](#2-tasks-by-feature)
3. [Roadmap](#3-roadmap)
4. [Edge Cases](#4-edge-cases)

---

## 1. Feature Areas

| # | Feature Area | Status |
|---|---|---|
| F1 | Authentication & User Management | ✅ Implemented (partial gaps) |
| F2 | Tourist Monitoring & Location Tracking | ✅ Implemented (background GPS missing) |
| F3 | Incident Management | ✅ Implemented (E-FIR & attachments missing) |
| F4 | AI Safety Scoring | ⚠️ Stub only — no real ML model |
| F5 | AI Case Report Generation | ⚠️ Stub only — basic PDF template |
| F6 | Geofencing & Zone Management | ⚠️ Logic exists, UI & pipeline incomplete |
| F7 | Blockchain Credential & Incident Logging | ⚠️ Partial — local network only |
| F8 | Emergency Panic Button | ✅ Implemented (notifications missing) |
| F9 | Real-time Dashboard (Web) | ✅ Implemented (WebSocket not consumed by frontend) |
| F10 | Android Mobile App | ✅ Screen layer done (background services missing) |
| F11 | Notifications & Alerts Dispatch | ❌ Not implemented |
| F12 | Digital Tourist ID | ❌ Not implemented |
| F13 | Inter-departmental Coordination | ❌ Not implemented |
| F14 | System Health Monitoring | ✅ Implemented |
| F15 | Testing & Quality Assurance | ❌ Not implemented |
| F16 | Deployment & DevOps | ⚠️ Config exists, hardening missing |

---

## 2. Tasks by Feature

---

### F1 — Authentication & User Management

**What is done:**
- POST `/api/register` and `/api/login` with JWT (24h expiry)
- Role-based middleware (`admin`, `officer`, `tourist`)
- Account suspension check on login
- Admin can update/delete users via `/api/users`
- Mobile login endpoint `/api/mobile/auth/login`
- Officer registration sets status to `pending` (requires admin approval)

**Remaining Tasks:**
- [ ] F1-T1: Implement password reset flow (forgot password → email OTP → reset)
- [ ] F1-T2: Implement token refresh endpoint so sessions don't expire mid-use
- [ ] F1-T3: Admin approval workflow for `pending` officer accounts (UI + email notification)
- [ ] F1-T4: Add input sanitisation and length validation on register (e.g. username 3–30 chars, strong password policy)
- [ ] F1-T5: Implement account lockout after N failed login attempts
- [ ] F1-T6: Restrict CORS to known frontend origins instead of wildcard

---

### F2 — Tourist Monitoring & Location Tracking

**What is done:**
- GET `/api/tourists` returns list with summary (total, active, highRisk, avgScore)
- PUT `/api/tourists/:id/safety-score` updates score and emits WebSocket event
- POST `/api/mobile/location/update` — creates tourist record on first update, runs geofence check + AI scoring, emits `tourist:location`
- GET `/api/mobile/tourist/status` — returns safety tips, nearby services
- Frontend `TouristMonitoring.js` — table with search, Leaflet map with markers, 30s polling

**Remaining Tasks:**
- [ ] F2-T1: Android — implement a `ForegroundService` that keeps GPS running when app is backgrounded
- [ ] F2-T2: Android — set a configurable location update interval (currently no interval set)
- [ ] F2-T3: Frontend — connect WebSocket `tourist:location` event to update map pins without full page reload
- [ ] F2-T4: Backend — add location history storage (array of last N positions per tourist)
- [ ] F2-T5: Backend — add reverse-geocoding to convert lat/lng to a readable place name
- [ ] F2-T6: Android — implement offline caching of last known location (Room DB or SharedPreferences)
- [ ] F2-T7: Frontend map — click a tourist pin to open a detail drawer (incidents, score history, contact info)

---

### F3 — Incident Management

**What is done:**
- GET `/api/incidents` with filters (status, severity); tourists only see their own
- POST `/api/incidents` — creates incident, attempts blockchain hash, emits `incident:created`
- PUT `/api/incidents/:id` — updates any field, emits `incident:updated`
- Incident model has status workflow fields (Open → Investigating → Resolved)
- Role-based incident visibility

**Remaining Tasks:**
- [ ] F3-T1: Enforce status transitions in API (cannot jump from Resolved back to Open without admin override)
- [ ] F3-T2: Backend — add `assignedOfficer` update endpoint that notifies the assigned officer
- [ ] F3-T3: Implement automated E-FIR generation — fill a structured form from incident data and export as PDF
- [ ] F3-T4: Add evidence attachment support (photo/video upload to S3/Cloudinary, store URL in incident)
- [ ] F3-T5: Frontend — incident detail modal with timeline of status changes
- [ ] F3-T6: Backend — add DELETE `/api/incidents/:id` for admin only
- [ ] F3-T7: Multi-department dispatch — on incident creation, POST to Police API or trigger email dispatch

---

### F4 — AI Safety Scoring

**What is done:**
- Python FastAPI service on port 8001 with `/calculate` endpoint
- Formula: `score = 100 - (geofence_risk * 10 + anomalies * 20)` capped at 0
- Backend `AIService.js` calls service with 45s timeout, falls back to its own formula if unavailable
- Frontend `AIAnalytics.js` has manual trigger form + metrics display

**Remaining Tasks:**
- [ ] F4-T1: Collect and label a real dataset (tourist movement logs, incident outcomes, zone data)
- [ ] F4-T2: Train a model (Random Forest / XGBoost) on risk factors: geofence violations, time of day, movement speed, historical incidents in area
- [ ] F4-T3: Replace arithmetic formula in `safety_score/main.py` with model inference (`joblib` or ONNX)
- [ ] F4-T4: Add behavioral anomaly detection — flag unusual speed (>50 km/h on foot), stationary too long in high-risk zone
- [ ] F4-T5: Add time-based risk weighting (nighttime in certain zones = higher risk regardless of geofence)
- [ ] F4-T6: Expose model confidence score alongside safety score in the API response
- [ ] F4-T7: Store score history per tourist in MongoDB for trend graphs
- [ ] F4-T8: Frontend — replace hardcoded metrics in `AIAnalytics.js` with real API data from `/api/ai/metrics`

---

### F5 — AI Case Report Generation

**What is done:**
- Python FastAPI service on port 8002 with `/report` endpoint
- Generates a basic PDF with fpdf: tourist ID, alert text, last location
- Report saved as `report_<uuid>.pdf` locally

**Remaining Tasks:**
- [ ] F5-T1: Enrich report template — include incident timeline, officer notes, safety score at time of incident, geofence violations
- [ ] F5-T2: Attach a location map screenshot (static map API embedded in PDF)
- [ ] F5-T3: Add NLP-based narrative generation — summarise incident description in formal report language
- [ ] F5-T4: Store generated report path/URL in the Incident record in MongoDB
- [ ] F5-T5: Add a "Download Report" button in frontend incident detail view
- [ ] F5-T6: Fix `/report` signature — move from URL query params to a proper Pydantic request body

---

### F6 — Geofencing & Zone Management

**What is done:**
- Geofence model with MongoDB `2dsphere` index for geo-spatial queries
- `GeofencingService.checkGeofenceViolations(lat, lng)` — queries intersecting active zones
- Risk multiplier calculation, `shouldSendAlert`, `generateAlertMessage` helpers
- POST `/api/geofences` (admin only) and GET `/api/geofences`
- Location update pipeline calls geofence check automatically

**Remaining Tasks:**
- [ ] F6-T1: Frontend — build a Geofence Management page with Leaflet drawing tools (draw polygons / circles on map)
- [ ] F6-T2: Backend — add DELETE `/api/geofences/:id` and PUT `/api/geofences/:id` endpoints
- [ ] F6-T3: Add time-based rules to geofence schema (e.g. `activeHours: { start: 22, end: 6 }`)
- [ ] F6-T4: Wire `generateAlertMessage` result to notification dispatch (SMS/push), not just WebSocket
- [ ] F6-T5: Test end-to-end: mobile sends location → geofence violated → WebSocket alert fires → dashboard shows alert
- [ ] F6-T6: Add geofence entry / exit event log in the Activity Log page

---

### F7 — Blockchain Credential & Incident Logging

**What is done:**
- `CredentialRegistry.sol` with `anchorCredential`, `revokeCredential`, `verifyCredential`
- Deployment and interaction scripts
- Separate blockchain API server (`Blockchain/server.js`)
- `BlockchainService.js` calls the blockchain server to log incidents
- Panic alerts and new incidents attempt blockchain hashing

**Remaining Tasks:**
- [ ] F7-T1: Deploy contract to a public testnet (Sepolia or Polygon Mumbai); update `deployedAddresses.json`
- [ ] F7-T2: Frontend — add Verify and Revoke buttons in the Blockchain Logs page
- [ ] F7-T3: Add retry logic in `BlockchainService.js` when blockchain server is down
- [ ] F7-T4: Add Digital Tourist ID anchoring — on tourist signup, anchor profile hash as a credential
- [ ] F7-T5: Ensure `blockchainHash`, `vcHash`, and tx receipt are reliably stored in the Incident record
- [ ] F7-T6: Add Etherscan / testnet explorer link in the UI for each anchored hash

---

### F8 — Emergency Panic Button

**What is done:**
- Android `PanicScreen.kt` triggers POST `/api/mobile/panic/alert`
- Backend creates `Emergency Alert` incident (severity: High), sets tourist status to `emergency`, safety score to 0
- Blockchain hash attempted on panic incident
- `alert:panic` WebSocket event emitted

**Remaining Tasks:**
- [ ] F8-T1: Send SMS to registered emergency contact using Twilio when panic fires
- [ ] F8-T2: Send push notification to all online `officer` users via FCM
- [ ] F8-T3: Android — 3-second countdown with cancel option before alert is sent (prevent accidental triggers)
- [ ] F8-T4: Android — capture GPS coordinates at the exact moment of press, not deferred
- [ ] F8-T5: Backend — allow tourist to cancel/resolve emergency so status reverts from `emergency`
- [ ] F8-T6: Frontend — alert banner + sound when `alert:panic` WebSocket event is received

---

### F9 — Real-time Web Dashboard

**What is done:**
- 14 frontend pages implemented at UI layer
- WebSocket server emits `tourist:location`, `incident:created`, `incident:updated`, `alert:panic`, `alert:geofence`
- Dashboard page polls for stats and recent incidents
- TouristMonitoring polls every 30s

**Remaining Tasks:**
- [ ] F9-T1: Create a `useSocket` React hook that subscribes to all backend WebSocket events
- [ ] F9-T2: Replace 30s polling in TouristMonitoring with WebSocket `tourist:location` events
- [ ] F9-T3: Show live alert toast/banner when `alert:panic` is received
- [ ] F9-T4: Replace hardcoded AI metrics and trend data with real computed values from the backend
- [ ] F9-T5: Add pagination to Incident Management list (currently loads all documents at once)
- [ ] F9-T6: Wire ActivityLog page to `/api/dashboard/recent-activity`

---

### F10 — Android Mobile App

**What is done:**
- Screens: Login, Signup, RoleSelection, UserHome, AdminHome, Panic, Map
- Retrofit API client, typed models, JWT token storage via `AuthManager`
- `UserRepository`, `LocationRepository`, `AlertViewModel`

**Remaining Tasks:**
- [ ] F10-T1: Implement `ForegroundService` for background GPS (with persistent notification)
- [ ] F10-T2: MapScreen — render live tourist markers from `/api/tourists` data via OSMDroid
- [ ] F10-T3: Implement OkHttp `WebSocketListener` to receive real-time updates from backend
- [ ] F10-T4: Integrate Firebase Cloud Messaging for push notifications
- [ ] F10-T5: Offline mode — cache last known safety score and incidents in Room database
- [ ] F10-T6: Fix Signup screen input validation (empty fields, password length, email format)
- [ ] F10-T7: AdminHome screen — add incident list and tourist overview (currently a placeholder)
- [ ] F10-T8: Token expiry handling — auto-logout or silent refresh when API returns 401

---

### F11 — Notifications & Alerts Dispatch

**What is done:**
- WebSocket events emitted for panic, geofence, and incident changes
- Nearby emergency services shown statically in mobile status response

**Remaining Tasks:**
- [ ] F11-T1: Integrate Twilio (or MSG91) — send SMS on panic and geofence violation
- [ ] F11-T2: Integrate SendGrid / Nodemailer — email tourist on incident creation
- [ ] F11-T3: Integrate FCM — push notification to Android on new officer assignment
- [ ] F11-T4: Create a `Notification` model in MongoDB to record all dispatched notifications
- [ ] F11-T5: Build Notifications page in frontend to show notification history
- [ ] F11-T6: Add per-user notification preferences and do-not-disturb hours

---

### F12 — Digital Tourist ID

**What is done:**
- Feature described in architecture docs
- `CredentialRegistry` smart contract can anchor any credential hash

**Remaining Tasks:**
- [ ] F12-T1: Design Digital ID schema — name, passport/Aadhaar reference hash, nationality, valid_from, valid_to, issued_by
- [ ] F12-T2: Backend — POST `/api/digital-id/issue` — generate ID, hash it, anchor on blockchain
- [ ] F12-T3: Backend — GET `/api/digital-id/verify/:vcHash`
- [ ] F12-T4: Android — Digital ID card screen showing QR code of `vcHash`
- [ ] F12-T5: Frontend admin panel — issue, view, and revoke digital IDs per tourist
- [ ] F12-T6: Auto-issue digital ID on tourist signup

---

### F13 — Inter-departmental Coordination

**What is done:**
- Described in architecture docs; nothing built

**Remaining Tasks:**
- [ ] F13-T1: Add `department` field to User model (`tourism_dept`, `police`, `admin`)
- [ ] F13-T2: Backend — POST `/api/incidents/:id/escalate` — escalate incident to police with E-FIR copy
- [ ] F13-T3: Police officers see incident queue filtered by `escalatedTo: 'police'`
- [ ] F13-T4: Add threaded comments per incident (shared notes between departments)
- [ ] F13-T5: Frontend — dual-department dashboard view for coordinators
- [ ] F13-T6: Every inter-departmental action immutably logged (blockchain or append-only DB log)

---

### F14 — System Health Monitoring

**What is done:**
- GET `/api/health` checks MongoDB, pings AI services, pings blockchain server
- Frontend `SystemHealth.js` shows per-service status
- Optional services marked so their downtime doesn't fail overall health

**Remaining Tasks:**
- [ ] F14-T1: Replace hardcoded uptime strings with real calculated values from ping history
- [ ] F14-T2: Measure actual response times in the health check, not hardcoded strings
- [ ] F14-T3: Auto-alert admin by email when a critical service goes offline
- [ ] F14-T4: Add `/api/metrics` endpoint (CPU, memory, request rate) for ops monitoring

---

### F15 — Testing & Quality Assurance

**What is done:**
- `App.test.js` placeholder in frontend
- `ExampleInstrumentedTest.kt` placeholder in Android

**Remaining Tasks:**
- [ ] F15-T1: Backend — unit tests for `AIService`, `BlockchainService`, `GeofencingService` using Jest + mock-axios
- [ ] F15-T2: Backend — API route integration tests using Supertest (auth, incident CRUD, location update)
- [ ] F15-T3: Frontend — component tests with React Testing Library (Dashboard, IncidentManagement, Login)
- [ ] F15-T4: Android — instrumented tests for Login flow and Panic button using Espresso
- [ ] F15-T5: End-to-end: login → update location → trigger geofence → press panic → verify incident in dashboard
- [ ] F15-T6: AI service — unit tests for `/calculate` covering boundary inputs

---

### F16 — Deployment & DevOps

**What is done:**
- `render.yaml`, `vercel.json`, `deploy.sh`, `deploy.ps1` exist
- `DEPLOYMENT_GUIDE.md` written
- Frontend PWA service worker registered

**Remaining Tasks:**
- [ ] F16-T1: Add `.env` validation on backend startup — fail fast if required vars are missing
- [ ] F16-T2: Replace `console.error` with Winston or Pino structured logging
- [ ] F16-T3: Add `express-rate-limit` to auth and mobile endpoints
- [ ] F16-T4: Restrict CORS to production frontend URL only
- [ ] F16-T5: Add `helmet.js` for HTTP security headers
- [ ] F16-T6: Add GitHub Actions CI/CD — lint, test, build, deploy on push to main
- [ ] F16-T7: Add `frontend/build/` to `.gitignore` (currently committed to repo)
- [ ] F16-T8: Restrict MongoDB Atlas IP allowlist to backend server IP only

---

## 3. Roadmap

### Phase 1 — Stability & Security (Week 1–2)
*Make what exists reliable and production-safe before adding anything new.*

| Task ID | Description | Priority |
|---|---|---|
| F1-T4 | Input validation on register/login | High |
| F1-T6 | Restrict CORS | High |
| F3-T1 | Enforce incident status transitions | High |
| F8-T3 | Panic 3s countdown + cancel | High |
| F10-T6 | Fix signup validation in Android | High |
| F10-T8 | Token expiry / 401 handling in Android | High |
| F16-T1 | .env validation on startup | High |
| F16-T3 | Rate limiting on auth endpoints | High |
| F16-T4 | CORS restriction | High |
| F16-T5 | helmet.js security headers | High |
| F16-T7 | Gitignore frontend/build | Medium |

---

### Phase 2 — Real-time Completeness (Week 3–4)
*WebSocket pipeline fully connected; dashboard live without polling.*

| Task ID | Description | Priority |
|---|---|---|
| F9-T1 | React `useSocket` hook | High |
| F9-T2 | Replace TouristMonitoring polling with WebSocket | High |
| F9-T3 | Panic alert banner in dashboard | High |
| F10-T3 | WebSocket client in Android | High |
| F6-T5 | End-to-end geofence → alert test | High |
| F8-T6 | Frontend panic banner + sound | Medium |
| F9-T6 | Wire ActivityLog to API | Medium |
| F9-T5 | Pagination on incident list | Medium |

---

### Phase 3 — AI Layer (Week 5–7)
*Replace stub arithmetic with a real ML model.*

| Task ID | Description | Priority |
|---|---|---|
| F4-T1 | Collect and label dataset | High |
| F4-T2 | Train RF/XGBoost model | High |
| F4-T3 | Replace formula with model inference | High |
| F5-T6 | Fix /report to use Pydantic body | High |
| F4-T4 | Behavioral anomaly detection | Medium |
| F4-T5 | Time-based risk weighting | Medium |
| F4-T6 | Confidence score in response | Medium |
| F4-T7 | Store score history in MongoDB | Medium |
| F4-T8 | Fix hardcoded metrics in AIAnalytics | Medium |
| F5-T1 | Enrich PDF report template | Medium |
| F5-T4 | Store report URL in incident record | Medium |
| F5-T5 | Download report button in frontend | Medium |
| F5-T3 | NLP narrative generation | Low |

---

### Phase 4 — Notifications & Alerts (Week 8–9)
*Real-world dispatch via SMS, email, push.*

| Task ID | Description | Priority |
|---|---|---|
| F11-T1 | Twilio SMS on panic + geofence | High |
| F11-T2 | SendGrid email on incident creation | High |
| F11-T3 | FCM push to Android officers | High |
| F10-T4 | FCM integration in Android | High |
| F8-T1 | SMS to emergency contact on panic | High |
| F8-T2 | Push to officer on panic | High |
| F11-T4 | Notification model in MongoDB | Medium |
| F11-T5 | Build Notifications page in frontend | Medium |

---

### Phase 5 — Android Background Services (Week 10–11)
*App works reliably when backgrounded and offline.*

| Task ID | Description | Priority |
|---|---|---|
| F10-T1 | ForegroundService for background GPS | High |
| F10-T2 | MapScreen with live tourist markers | High |
| F10-T7 | AdminHome incident list | Medium |
| F10-T5 | Room DB offline cache | Medium |
| F2-T6 | Cache last known location on Android | Medium |
| F2-T1 | Configurable GPS update interval | Medium |

---

### Phase 6 — Geofence Map UI (Week 11)
*Admins can draw and manage geofences visually.*

| Task ID | Description | Priority |
|---|---|---|
| F6-T1 | Geofence Management page with Leaflet drawing | High |
| F6-T2 | DELETE + PUT geofence endpoints | High |
| F6-T3 | Time-based geofence rules | Medium |
| F6-T4 | Wire alerts to notification dispatch | High |
| F6-T6 | Geofence entry/exit event log | Low |

---

### Phase 7 — Blockchain & Digital ID (Week 12–13)
*Blockchain is on a real network; Digital Tourist ID is working.*

| Task ID | Description | Priority |
|---|---|---|
| F7-T1 | Deploy to Sepolia testnet | High |
| F7-T3 | Retry logic in BlockchainService | High |
| F12-T1 | Digital ID schema | High |
| F12-T2 | Issue digital ID endpoint | High |
| F12-T3 | Verify digital ID endpoint | High |
| F12-T6 | Auto-issue on signup | High |
| F12-T4 | Android QR code ID card screen | Medium |
| F12-T5 | Admin panel for digital IDs | Medium |
| F7-T2 | Verify/Revoke in dashboard | Medium |
| F7-T6 | Etherscan link for hashes | Low |

---

### Phase 8 — Inter-departmental Coordination (Week 14)
*Tourism Dept and Police share incidents and coordinate.*

| Task ID | Description | Priority |
|---|---|---|
| F13-T1 | Add department field to User | High |
| F13-T2 | Incident escalation endpoint | High |
| F13-T3 | Police incident queue | High |
| F13-T4 | Threaded comments per incident | Medium |
| F13-T5 | Dual-department dashboard view | Medium |
| F13-T6 | Immutable inter-dept action log | Medium |

---

### Phase 9 — Testing & Hardening (Week 15–16)
*Test coverage across all layers; CI/CD running.*

| Task ID | Description | Priority |
|---|---|---|
| F15-T1 | Backend unit tests | High |
| F15-T2 | Backend integration tests | High |
| F15-T5 | End-to-end test suite | High |
| F16-T6 | GitHub Actions CI/CD | High |
| F16-T8 | MongoDB Atlas IP restriction | High |
| F15-T3 | Frontend component tests | Medium |
| F15-T4 | Android instrumented tests | Medium |
| F16-T2 | Structured logging (Winston) | Medium |
| F14-T1 | Real uptime metrics | Low |
| F14-T3 | Auto-alert admin on service down | Medium |

---

## 4. Edge Cases

---

### F1 — Authentication

- **Duplicate registration** — username exists but different email → reject with specific message stating which field conflicts, not a generic error
- **Case sensitivity** — `Admin` vs `admin` on login — MongoDB query uses regex or `$or`; define a canonical lowercase transform policy
- **Token expiry mid-session** — user is mid-form when 24h token expires; API returns 401; frontend must redirect to login without losing filled form data
- **Officer with pending status** — officer can log in and receives a JWT, but all officer-only routes must still reject them until admin approves; status check must be in middleware, not only at login
- **Suspended account with valid in-flight token** — token was issued before suspension; suspension check must run on every authenticated request, not just at login
- **Whitespace-only username** — `username: "   "` passes a `!username` check but should fail; trim and re-validate
- **NoSQL injection** — `{ "$gt": "" }` as username bypasses string equality; use Mongoose schema type enforcement which rejects non-string operators

---

### F2 — Tourist Location Tracking

- **Race condition on first update** — two location packets arrive simultaneously for a new tourist; both find no existing record and both try to create one → duplicate tourist documents; use `findOneAndUpdate` with `upsert: true`
- **Stale GPS coordinates** — device sends a cached location from hours ago; backend should reject `timestamp` older than 5 minutes
- **Invalid coordinates** — `lat` outside [-90, 90] or `lng` outside [-180, 180] must be validated before geo queries; MongoDB geo-index will error on invalid values
- **`lat.toFixed(4)` on null** — if lat/lng are null (GPS unavailable), the panic endpoint and location update will throw `TypeError`; guard with null check before calling `.toFixed()`
- **Location update flood** — mobile sends 10 requests/second; each triggers geofence check + AI service call; must rate-limit per tourist (e.g. max 1 update per 10s)
- **Tourist deleted while tracking** — if admin deletes a tourist record mid-session, the next location update creates a new one with a new ID, losing history

---

### F3 — Incident Management

- **Incident ID collision** — ID is `INC-2024-${count + 1}`; if incidents are deleted, `count` decreases and the same padded ID is reused for a new incident; use a separate monotonic counter or UUID
- **Arbitrary field injection** — `Object.assign(incident, req.body)` in the PUT endpoint means any field in the request body is written to the document; whitelist allowed fields explicitly
- **Concurrent updates** — two officers update the same incident simultaneously; last-write-wins silently; add optimistic locking using Mongoose `__v` version field
- **Large dataset pagination** — `Incident.find({})` with no limit on thousands of documents causes memory pressure and slow responses; enforce `limit`/`skip` with a default page size
- **Invalid filter values** — `?status=randomstring` is passed to `query.status`; MongoDB query will return no results silently instead of a 400 error; validate enum values

---

### F4 — AI Safety Scoring

- **Score goes below zero** — JS fallback in `AIService.js` lacks `Math.max(0, ...)` making negative scores possible; Python service clips correctly but JS fallback does not
- **AI service cold start latency** — first request after the free-tier service sleeps takes 30–60s; 45s timeout is set but frontend shows a frozen spinner with no user feedback; add a "AI service warming up" message
- **Concurrent location updates** — 50 tourists update simultaneously; 50 requests hit the single-worker Python service; service queues up and some requests timeout; add `--workers 4` to uvicorn startup or use async FastAPI correctly
- **Missing telemetry fields** — `data.telemetry` being an empty dict (`{}`) should still return a valid score, not crash; Python service must not assume any specific field exists in the telemetry dict
- **Score history not stored** — currently safety score overwrites previous value; historical data needed for trend analytics is permanently lost

---

### F5 — AI Case Report

- **URL query param as POST body** — current signature uses URL query params for a POST endpoint (`tourist_id`, `alert`, `last_location`); HTTP clients expect a request body for POST; calling `requests.post(url)` without params fails silently
- **File saved locally on server** — `pdf.output(filename)` saves in the service's working directory; in a cloud deployment with ephemeral storage this file is lost on restart; use S3 or return the PDF as a byte stream
- **Filename collision** — `uuid4()` is highly unlikely to collide but if the service directory fills up with unretrieved PDFs it consumes disk space; implement cleanup of files older than 1 hour
- **Non-ASCII characters in fields** — `pdf.cell` with FPDF and `Arial` font does not support Devanagari or other non-Latin scripts; tourist names in Hindi will render as blank; use a Unicode-capable font (e.g. DejaVu)

---

### F6 — Geofencing

- **Tourist exactly on geofence boundary** — MongoDB `$geoIntersects` includes the boundary; define explicit rule: on boundary = warning, strictly inside = violation
- **Overlapping geofences of conflicting types** — a point inside both a `safe_zone` and a `high_risk` zone simultaneously; current code adds risks from restricted zones only; but the `safeZones` array would also include the safe zone, which is misleading; document the intended priority logic
- **Geofence deleted while tourist inside** — tourist enters zone, admin deletes zone; next location update shows no violation; no exit event is fired; add an "active geofence session" tracking mechanism
- **Geofence collection empty** — every location update still hits MongoDB with a geo query; add an in-memory flag or Redis cache that skips the query when no geofences are defined
- **Extremely large polygon** — polygon covering an entire state means every tourist triggers violations; add a maximum area validation when creating geofences in the admin UI

---

### F7 — Blockchain

- **Blockchain server offline** — `BlockchainService.logIncident` catches the error silently; incident is saved without a `blockchainHash`; there is no queue or retry; incidents during downtime have incomplete audit trails
- **Duplicate hash** — `anchorCredential` rejects a hash if it already exists ("Already exists"); if the same incident data is submitted twice (e.g. retry after timeout), the second call fails; include a UUID nonce in the hash input to ensure uniqueness
- **Local Hardhat chain reset** — `npx hardhat node` resets all state on restart; all previously anchored hashes are gone; a real testnet is required to persist data
- **Revoked credential still trusted** — smart contract supports `revokeCredential` but backend never calls `verifyCredential` before accepting a credential; revocation has no effect until this check is added
- **Gas estimation failure** — if the Hardhat node is running but the contract address is wrong (stale `deployedAddresses.json`), the transaction fails with a confusing error; validate address on startup

---

### F8 — Emergency Panic

- **Accidental trigger** — no confirmation or countdown exists; a single tap sends an alert; implement a 3-second countdown with a visible cancel button
- **`lat.toFixed(4)` on null** — if Android cannot get GPS at the moment of panic, `lat` is null; the backend currently runs `lat.toFixed(4)` which throws `TypeError`; guard: `lat != null ? lat.toFixed(4) : 'Unknown'`
- **Repeated panic presses** — user presses 5 times quickly; 5 separate incidents are created with timestamps milliseconds apart; debounce on Android side + backend dedup check (reject if open panic incident exists for this tourist within last 60s)
- **Tourist already in `emergency` status** — second panic press creates a new incident instead of updating the existing open one; check for active emergency state before creating a duplicate
- **No officers online** — WebSocket event fires but no one receives it; this is already mitigated because the incident is persisted in MongoDB and visible on next login; but there should be a fallback SMS to a duty officer number regardless of online status

---

### F10 — Android App

- **Token in SharedPreferences** — readable by other apps on rooted devices; migrate to `EncryptedSharedPreferences` or Android Keystore
- **Background GPS killed by Doze mode** — standard background services are stopped; only a `ForegroundService` with a visible persistent notification survives Doze
- **Hardcoded emulator base URL** — `http://10.0.2.2:5000` only works on an AVD; physical device on the same network needs the machine's LAN IP; use a `BuildConfig` field or a runtime config endpoint
- **Config change (screen rotation)** — if the user rotates their phone during the panic countdown, the Compose screen is recreated; ViewModel survives, but `rememberSaveable` must be used for all UI state that should persist through recomposition
- **Retrofit no timeout set** — without explicit `connectTimeout` and `readTimeout`, a slow or unresponsive backend hangs the login screen indefinitely with no user feedback

---

### F11 — Notifications

- **SMS delivery failure** — Twilio may fail or the number may be invalid; queue attempted notifications and retry up to 3 times with exponential backoff; log final status in the Notification model
- **FCM token expiry** — device tokens rotate; backend receives `UNREGISTERED` error from FCM; must delete the stale token from the User record on that error
- **User has no phone number** — SMS cannot be sent; fall back to email; at registration, mark phone as optional but warn the user that emergency SMS won't work
- **Notification flood** — if 50 geofence violations fire in 1 minute for the same tourist, 50 SMS could be sent to their emergency contact; implement per-tourist SMS rate limit (e.g. max 1 SMS per 10 minutes for the same alert type)

---

### F12 — Digital Tourist ID

- **PII on blockchain** — storing name, passport number, or Aadhaar on-chain violates data protection laws (PDPB/GDPR); only a hash of the ID data should go on-chain; raw PII stays in MongoDB
- **ID expiry during trip** — `valid_to` must be checked on every verify call, not just at issuance; an expired ID should return a clear "expired" status, not "invalid"
- **Duplicate registration** — same tourist registers twice with different usernames; two digital IDs for the same person; validate against a unique passport/Aadhaar hash in the database before issuance
- **QR code screenshot sharing** — a screenshot of the QR can be shared; verification must confirm the presenting device's authenticated JWT matches the ID owner, not just that the hash is valid on-chain

---

### F14 — System Health

- **Health check timeout** — if the AI service is sleeping (30–60s wake time on free tier), GET `/api/health` hangs for the full 45s timeout; health check pings to optional services must use a separate short 3s timeout
- **Mongoose readyState = 2 (connecting)** — briefly after startup or reconnect, `readyState` is 2, not 1; health check reports database as "offline" momentarily; add state label mapping: `{ 0: 'disconnected', 1: 'online', 2: 'connecting', 3: 'disconnecting' }`
