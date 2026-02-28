# Travira — Resume Priority Task Breakdown

Features ranked by resume impact. Complete them in order — top to bottom.

---

## TIER 1 — Must Complete (Core Resume Claims)

---

### #1 · Real ML Safety Scoring Model
**Resume line:** *"Trained and deployed an ML model for real-time tourist safety risk assessment"*
**Current state:** Arithmetic formula `100 - (geofence_risk*10 + anomalies*20)`

| # | Task | Details |
|---|---|---|
| 1.1 | Generate synthetic training dataset | Create a Python script `AI_services/safety_score/generate_dataset.py` that produces 5000 rows: columns = `geofence_risk (0-10)`, `anomalies (0-5)`, `time_of_day (0-23)`, `movement_speed_kmh`, `historical_incidents_nearby`, `label (safe/warning/danger)` |
| 1.2 | Train a Random Forest classifier | In `AI_services/safety_score/train_model.py`, use `scikit-learn` RandomForestClassifier, split 80/20, evaluate accuracy, save model as `model.pkl` with joblib |
| 1.3 | Replace formula with model inference | In `AI_services/safety_score/main.py`, load `model.pkl` on startup, accept `time_of_day`, `movement_speed_kmh`, `historical_incidents_nearby` in addition to existing fields, return predicted score |
| 1.4 | Add confidence score to response | Return `{ safety_score: 72, confidence: 0.89, risk_level: "warning" }` so the frontend can display it |
| 1.5 | Add anomaly detection logic | Flag if `movement_speed_kmh > 60` (impossible on foot) or tourist is stationary in a high-risk zone for > 15 min; add `anomaly_flags: []` array to response |
| 1.6 | Store score history in MongoDB | In `backend/index.js` location update handler, push `{ score, timestamp }` to a `scoreHistory` array in the Tourist document (keep last 24 entries) |
| 1.7 | Update `AIAnalytics.js` to show real data | Replace hardcoded `aiAccuracy: 94.2` and trends with data fetched from `/api/ai/metrics` and `/api/ai/trends`; plot score history as a line chart |
| 1.8 | Add requirements | Add `scikit-learn`, `joblib`, `pandas`, `numpy` to `AI_services/safety_score/requirements.txt` |

---

### #2 · Live Deployment
**Resume line:** *"Deployed full-stack system — React frontend on Vercel, Node.js backend on Render, Python microservices on Render"*
**Current state:** Config files exist but nothing is live

| # | Task | Details |
|---|---|---|
| 2.1 | Fix `.env` validation on backend startup | Add a startup check in `backend/index.js` — if `MONGODB_URI` or `JWT_SECRET` are missing, log an error and exit with code 1 |
| 2.2 | Add `helmet` and rate limiting | `npm install helmet express-rate-limit` in backend; add `app.use(helmet())` and a rate limiter on `/api/login`, `/api/register`, `/api/mobile/auth/login` (max 10 req/15min) |
| 2.3 | Restrict CORS to production URLs | Replace `app.use(cors())` with `app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:3000'] }))` |
| 2.4 | Add `frontend/build` to `.gitignore` | Open root `.gitignore`, add `frontend/build/` |
| 2.5 | Deploy backend to Render | Create a Web Service on render.com; set env vars `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `AI_SAFETY_SCORE_URL`, `AI_CASE_REPORT_URL`; set start command `node backend/index.js` |
| 2.6 | Deploy safety score service to Render | Create a second Render service; root dir = `AI_services/safety_score`; start command = `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| 2.7 | Deploy case report service to Render | Same as above but root dir = `AI_services/case_report` |
| 2.8 | Deploy frontend to Vercel | Run `cd frontend && npm run build`; connect to Vercel; set `REACT_APP_API_URL` to Render backend URL |
| 2.9 | Update Android `ApiClient.kt` base URL | Replace hardcoded `http://10.0.2.2:5000` with `BuildConfig.API_BASE_URL`; set the `API_BASE_URL` build config field to the Render backend URL |
| 2.10 | Smoke-test all three services end-to-end | Login via web, create an incident, trigger AI score, see it in dashboard |

---

### ~~#3 · End-to-end WebSocket Real-time Pipeline~~ ✅ COMPLETE
**Resume line:** *"Built real-time tourist monitoring using WebSocket — dashboard updates instantly as location and incidents change"*
**Current state:** ✅ Fully implemented and tested

| # | Task | Status |
|---|---|---|
| 3.1 | Created `useSocket` hook — singleton socket.io connection, `subscribe`/`unsubscribe` API | ✅ Done |
| 3.2 | TouristMonitoring — replaced 30 s poll with `tourist:location` WebSocket subscription | ✅ Done |
| 3.3 | IncidentManagement — subscribes to `incident:created` (prepend) and `incident:updated` (merge), no polling | ✅ Done |
| 3.4 | Dashboard panic banner — full-width red dismissable banner on `alert:panic` | ✅ Done |
| 3.5 | Dashboard geofence toast — fixed top-right yellow toast on `alert:geofence`, auto-dismisses 6 s | ✅ Done |
| 3.6 | Dashboard stats auto-refresh — `openIncidents` counter increments live on `incident:created` | ✅ Done |
| 3.7 | `socket.io-client` already present in `frontend/package.json` | ✅ Done |

---

### #4 · Android Background GPS + ForegroundService
**Resume line:** *"Implemented persistent GPS tracking on Android using a ForegroundService, surviving Doze mode and backgrounding"*
**Current state:** GPS stops when app is backgrounded

| # | Task | Details |
|---|---|---|
| 4.1 | Create `LocationTrackingService.kt` | New file in `travira-android/app/src/main/java/com/example/travira/service/`; extend `Service`; show a persistent notification ("Travira is tracking your location"); request `ACCESS_FINE_LOCATION` and `ACCESS_BACKGROUND_LOCATION` |
| 4.2 | Register service in `AndroidManifest.xml` | Add `<service android:name=".service.LocationTrackingService" android:foregroundServiceType="location" />` and permissions `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_LOCATION` |
| 4.3 | Use `FusedLocationProviderClient` in service | Request location updates every 30 seconds with `LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 30_000)`; on each update, call POST `/api/mobile/location/update` via Retrofit |
| 4.4 | Start service from UserHomeScreen | On successful login, call `startForegroundService(Intent(context, LocationTrackingService::class.java))` |
| 4.5 | Stop service on logout | Call `stopService(...)` when user logs out via `AuthManager.logout()` |
| 4.6 | Handle permission denial gracefully | If `ACCESS_BACKGROUND_LOCATION` is denied, show an explanation dialog and guide user to settings; don't crash |

---

### #5 · SMS + Push Notifications (Panic & Geofence)
**Resume line:** *"Integrated Twilio SMS and Firebase Cloud Messaging for real-time emergency alert dispatch"*
**Current state:** ✅ All code complete — awaiting Twilio + Firebase account credentials

| # | Task | Status |
|---|---|---|
| 5.1 | Set up Twilio account → add `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` to `.env` | ⚠️ Manual — needs Twilio account |
| 5.2 | `backend/services/notificationService.js` — `sendSMS(to, body)` via Twilio, gracefully no-ops if unconfigured | ✅ Done |
| 5.3 | `sendSMS` called in panic handler — texts emergency contact with name + location | ✅ Done |
| 5.4 | `sendSMS` called in geofence violation handler — texts emergency contact on zone breach | ✅ Done |
| 5.5 | `emergencyContact` on Tourist model (name+phone), `fcmToken` on User model; `SignupScreen.kt` has phone input field | ✅ Done |
| 5.6 | Create Firebase project → download `serviceAccountKey.json` → set `FIREBASE_SERVICE_ACCOUNT=/path/to/key.json` in `.env` | ⚠️ Manual — needs Firebase account |
| 5.7 | `sendPush(fcmToken, title, body)` + `sendPushToOfficers(title, body)` in `notificationService.js` via `firebase-admin` | ✅ Done |
| 5.8 | All officers/admins receive FCM push on every panic alert | ✅ Done |
| 5.9 | `TraviraFirebaseService.kt` — extends `FirebaseMessagingService`; `onNewToken` POSTs to `/api/mobile/device/register`; `onMessageReceived` shows local notification; registered in `AndroidManifest.xml`; Firebase BOM + messaging-ktx added to `build.gradle.kts` | ✅ Done — add `google-services.json` from Firebase console |
| 5.10 | `POST /api/mobile/device/register` — saves FCM token to User document | ✅ Done |

---

## TIER 2 — Strong Additions (Do After Tier 1)

---

### #6 · E-FIR Auto-generation from Incident
**Resume line:** *"Automated E-FIR PDF generation from incident data using Python ReportLab"*
**Current state:** Referenced in docs; nothing built

| # | Task | Details |
|---|---|---|
| 6.1 | Redesign `case_report/main.py` request body | Change to a Pydantic model: `class IncidentReport(BaseModel): incident_id, type, location, severity, description, tourist_name, officer_name, timestamp, safety_score_at_time` |
| 6.2 | Build structured E-FIR PDF template | Header: "First Information Report — Travira Safety System"; sections: Incident Details, Tourist Info, Location with coordinates, Description, Safety Score, Officer Assigned, Timestamp; use `ReportLab` instead of fpdf for better formatting |
| 6.3 | Return PDF as base64 string | Instead of saving file locally, encode PDF bytes as base64 and return `{ "pdf_base64": "...", "incident_id": "..." }` |
| 6.4 | Backend endpoint to trigger report | In `backend/index.js`, `POST /api/incidents/:id/generate-report` — fetch incident from DB, call AI case report service, return base64 PDF |
| 6.5 | Store report flag on incident | Add `reportGenerated: Boolean, reportGeneratedAt: Date` to Incident model; set on successful generation |
| 6.6 | "Generate E-FIR" button in frontend | In the incident detail view in `IncidentManagement.js`, add a button that calls the endpoint and triggers a browser download of the PDF |
| 6.7 | Add `reportlab` to requirements | Add `reportlab` to `AI_services/case_report/requirements.txt` |

---

### #7 · Geofence Map Drawing UI
**Resume line:** *"Built an interactive geofence management UI using Leaflet.js with polygon and circle drawing tools"*
**Current state:** Backend supports geofences; no frontend to create/edit them

| # | Task | Details |
|---|---|---|
| 7.1 | Install Leaflet Draw | `cd frontend && npm install leaflet-draw @types/leaflet-draw` |
| 7.2 | Create `GeofenceManagement.js` page | New file in `frontend/src/pages/GeofenceManagement.js`; add to the navigation in `App.js` |
| 7.3 | Add Leaflet map with draw toolbar | Use `MapContainer` with `FeatureGroup` + `EditControl` from react-leaflet-draw; enable polygon and circle draw tools |
| 7.4 | On shape drawn, open a creation form | Show a side panel with fields: `name`, `type` (safe_zone / restricted_area / high_risk), `riskLevel (1-10)`, `alertEnabled` (toggle) |
| 7.5 | On form submit, call POST /api/geofences | Convert drawn shape coordinates to GeoJSON polygon; submit to backend; show success toast |
| 7.6 | Fetch and render existing geofences on map | On page load, GET `/api/geofences`; render each as a coloured polygon (green = safe, red = restricted, orange = high_risk) |
| 7.7 | Add delete icon on each geofence popup | On delete click, call DELETE `/api/geofences/:id`; remove polygon from map |
| 7.8 | Add DELETE /api/geofences/:id backend endpoint | Admin only; `Geofence.findByIdAndDelete(req.params.id)` |

---

### #8 · Digital Tourist ID with QR Code
**Resume line:** *"Implemented a blockchain-anchored digital identity system for tourists with QR code verification"*
**Current state:** Nothing built; only the blockchain contract exists

| # | Task | Details |
|---|---|---|
| 8.1 | Add `digitalId` fields to Tourist model | `digitalIdHash: String, digitalIdIssuedAt: Date, digitalIdExpiresAt: Date, digitalIdRevoked: Boolean` |
| 8.2 | Create POST /api/digital-id/issue endpoint | Admin only; input: `touristId, expiryDays (default 365)`; build ID object `{ touristId, name, issuedAt, expiresAt, issuedBy }`; hash it with `crypto.createHash('sha256')`; call `BlockchainService.anchorCredential(hash, expiresAt)`; save hash to Tourist document |
| 8.3 | Create GET /api/digital-id/verify/:touristId | Call `BlockchainService.verifyCredential(tourist.digitalIdHash)`; return `{ valid, expired, revoked, issuedAt, expiresAt }` |
| 8.4 | Create POST /api/digital-id/revoke/:touristId | Admin only; call `BlockchainService.revokeCredential(hash)`; set `digitalIdRevoked: true` in Tourist document |
| 8.5 | Android — Digital ID card screen | New `DigitalIdScreen.kt`; fetch tourist's `digitalIdHash` from status endpoint; display as a QR code using `com.google.zxing:core` + `AndroidBarcodeScanner`; show name, valid-until date, a shield icon |
| 8.6 | Admin panel in frontend | In `UserManagement.js`, add "Issue ID" button per tourist; show green/red badge for ID status; "Revoke" button if issued |

---

### #9 · Backend Unit + Integration Tests
**Resume line:** *"Written Jest unit tests and Supertest integration tests covering authentication, incident management, and AI service integration"*
**Current state:** Zero tests

| # | Task | Details |
|---|---|---|
| 9.1 | Install test dependencies | `cd backend && npm install --save-dev jest supertest jest-mock-axios` |
| 9.2 | Add test script to `package.json` | `"test": "jest --coverage"` |
| 9.3 | Test `AIService.calculateSafetyScore` | `backend/tests/aiService.test.js`; mock axios; test: returns score on success, uses fallback on failure, clamps at 0, handles null input |
| 9.4 | Test `GeofencingService.checkGeofenceViolations` | Mock `Geofence.findContainingPoint`; test: no geofences = no violations, restricted zone = violation with correct riskScore, safe_zone = not a violation |
| 9.5 | Integration test: auth routes | `backend/tests/auth.test.js`; use Supertest + in-memory MongoDB (mongodb-memory-server); test: register success, register duplicate username 400, login correct 200 + JWT, login wrong password 401 |
| 9.6 | Integration test: incident routes | `backend/tests/incidents.test.js`; test: create incident 201, get incidents 200, update existing incident, filter by status/severity |
| 9.7 | Integration test: location update | `backend/tests/location.test.js`; test: first update creates tourist, subsequent update updates location, null lat/lng returns 400 |

---

### #10 · Incident Status Workflow Enforcement + Evidence Attachments
**Resume line:** *"Implemented a structured incident lifecycle with enforced state transitions and file evidence attachment via Cloudinary"*
**Current state:** Status field exists but any value can be set freely; no file uploads

| # | Task | Details |
|---|---|---|
| 10.1 | Define valid status transitions | In Incident model's pre-save hook: `Open → Investigating → Resolved`; attempting `Resolved → Open` without `admin` role returns 400 |
| 10.2 | Whitelist allowed update fields in PUT endpoint | Replace `Object.assign(incident, req.body)` with explicit field assignment: only allow `status`, `assignedOfficer`, `notes`, `severity`, `evidenceUrls` to be updated |
| 10.3 | Set up Cloudinary account | Free tier; get `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`; store in `.env` |
| 10.4 | Add file upload endpoint | `npm install multer cloudinary multer-storage-cloudinary`; `POST /api/incidents/:id/evidence` — accepts multipart form with image/video file, uploads to Cloudinary, appends URL to `incident.evidenceUrls[]` |
| 10.5 | Add `evidenceUrls` to Incident model | `evidenceUrls: [{ url: String, uploadedAt: Date, uploadedBy: String }]` |
| 10.6 | Frontend — evidence upload in incident detail | File input in incident modal; on select, send multipart POST to upload endpoint; display thumbnail gallery of uploaded evidence |

---

## TIER 3 — Nice to Have (Add if Time Permits)

---

### #11 · Structured Logging + System Monitoring
**Resume line:** *"Added production-grade structured logging with Winston and a system health monitoring endpoint"*

| # | Task | Details |
|---|---|---|
| 11.1 | Install Winston | `npm install winston` in backend |
| 11.2 | Create `backend/utils/logger.js` | Configure logger with two transports: `Console` (colorized in dev) and `File` (`logs/app.log`); format: JSON with timestamp |
| 11.3 | Replace all `console.log/error` | Find all occurrences in `index.js` and all service files; replace with `logger.info(...)` / `logger.error(...)` |
| 11.4 | Add HTTP request logging middleware | `npm install morgan`; `app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))` |
| 11.5 | Measure real response time in health check | Use `Date.now()` before and after each service ping in `/api/health`; replace hardcoded `'120ms'` with actual measured values |

---

### #12 · Password Reset Flow
**Resume line:** *"Implemented email-based password reset with time-limited OTP"*

| # | Task | Details |
|---|---|---|
| 12.1 | Install Nodemailer | `npm install nodemailer`; configure with Gmail SMTP or SendGrid; store credentials in `.env` |
| 12.2 | Add reset token fields to User model | `resetToken: String, resetTokenExpiry: Date` |
| 12.3 | POST /api/auth/forgot-password | Find user by email; generate 6-digit OTP; set `resetToken = hash(OTP)`, `resetTokenExpiry = now + 15min`; send email with OTP |
| 12.4 | POST /api/auth/reset-password | Accept `{ email, otp, newPassword }`; compare hashed OTP; check expiry; update password; clear reset fields |
| 12.5 | Add forgot password link in frontend Login.js | Link to a new `ForgotPassword.js` page with email input → OTP input → new password input (three-step form) |
| 12.6 | Add forgot password link in Android LoginScreen.kt | Navigate to a new `ForgotPasswordScreen.kt` with the same three-step flow |

---

### #13 · Basic Android Offline Mode
**Resume line:** *"Implemented offline caching in Android using Room database for last known safety state"*

| # | Task | Details |
|---|---|---|
| 13.1 | Add Room dependency | In `app/build.gradle.kts`: `implementation("androidx.room:room-runtime:2.6.1")`, `kapt("androidx.room:room-compiler:2.6.1")` |
| 13.2 | Create `CachedTouristStatus` entity | Data class with `@Entity`: fields `safetyScore, status, lastLocation, lastUpdated` |
| 13.3 | Create `TouristStatusDao` | `@Dao` interface with `upsert(status)` and `getLatest()` |
| 13.4 | Create `AppDatabase` | `@Database` class with the single entity; singleton pattern |
| 13.5 | Update `LocationRepository` | After each successful API call, upsert the result into Room; on network failure, load from Room and show a "Last known data" banner in `UserHomeScreen.kt` |

---

### #14 · GitHub Actions CI/CD Pipeline
**Resume line:** *"Set up a CI/CD pipeline using GitHub Actions — auto-runs tests and deploys to Render/Vercel on push"*

| # | Task | Details |
|---|---|---|
| 14.1 | Create `.github/workflows/ci.yml` | Triggers on push to `main`; jobs: `backend-test` (Node 20, `npm ci`, `npm test`), `frontend-build` (Node 20, `npm ci`, `npm run build`) |
| 14.2 | Add backend test job | Uses `mongodb-memory-server` so no real DB needed in CI |
| 14.3 | Add Render deploy hook | In Render dashboard, create a deploy hook URL; add as GitHub secret `RENDER_DEPLOY_HOOK`; add a step `curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}` after tests pass |
| 14.4 | Add Vercel deploy via CLI | `npm install -g vercel`; add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets; add deploy step using the Vercel GitHub Action |
| 14.5 | Add status badge to README | Copy the GitHub Actions badge markdown from the Actions tab; paste at the top of `README.md` |

---

## Quick Reference — Task Count by Tier

| Tier | Features | Total Tasks | Est. Time |
|---|---|---|---|
| Tier 1 (Must) | ML Model, Deployment, WebSocket, Background GPS, Notifications | 45 tasks | ~3 weeks |
| Tier 2 (Strong) | E-FIR, Geofence UI, Digital ID, Tests, Incident Workflow | 37 tasks | ~2 weeks |
| Tier 3 (Nice) | Logging, Password Reset, Offline Mode, CI/CD | 22 tasks | ~1 week |

**Minimum viable resume version: complete Tier 1 only (3 weeks).**
**Strong portfolio version: Tier 1 + Tier 2 (5 weeks).**
