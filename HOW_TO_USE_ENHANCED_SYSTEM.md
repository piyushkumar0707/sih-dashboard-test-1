# 🎯 Using the Enhanced Travira System

## 🚀 Quick Start (3 Steps)

### Step 1: Switch to Enhanced Backend

```bash
cd backend

# Backup old file (optional)
cp index.js index_old.js
cp seed.js seed_old.js

# Use new enhanced versions
mv index_new.js index.js
mv seed_new.js seed.js
```

### Step 2: Install New Dependencies

```bash
# Backend (add axios, socket.io)
cd backend
npm install

# Frontend (add socket.io-client)
cd ../frontend
npm install
```

### Step 3: Configure & Run

```bash
# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI
# Then seed the database
cd backend
npm run seed

# Start all services
# Option A: Use the quick start script
cd ..
.\start-all.ps1  # Windows
# or
./start-all.sh   # Linux/Mac

# Option B: Start manually (see COMPLETE_SETUP_GUIDE.md)
```

---

## 📊 What's New?

### ✨ Enhanced Backend (`index_new.js`)

**MongoDB Integration:**
- ✅ Tourist data persisted to database
- ✅ Incidents stored with full history
- ✅ User management with database
- ✅ Geofence definitions in DB

**Real-time Updates:**
- ✅ WebSocket server with Socket.IO
- ✅ Automatic push notifications
- ✅ Live dashboard updates
- ✅ Instant panic alerts

**AI Services:**
- ✅ Connected to Python AI services
- ✅ Safety score calculations
- ✅ Report generation
- ✅ Fallback for offline services

**Blockchain Logging:**
- ✅ Automatic incident logging
- ✅ Hash stored with incident
- ✅ Immutable audit trail

**Geofencing:**
- ✅ Location violation detection
- ✅ Automated risk scoring
- ✅ Alert generation
- ✅ Safe zone management

### 📁 New Models

**`models/Tourist.js`**
```javascript
{
  touristId: "T-001",
  userId: "user_id",
  name: "John Doe",
  location: { lat: 28.6139, lng: 77.2090 },
  safetyScore: 85,
  status: "active|high-risk|emergency",
  lastUpdated: Date,
  accuracy: Number
}
```

**`models/Incident.js`**
```javascript
{
  incidentId: "INC-2024-001",
  type: "Medical Emergency",
  location: "Tourism Zone A",
  coordinates: { lat, lng },
  severity: "High",
  status: "Open",
  touristId: "T-001",
  assignedOfficer: "Officer-123",
  description: "...",
  blockchainHash: "0x...",
  createdAt: Date
}
```

**`models/Geofence.js`**
```javascript
{
  name: "Safe Zone A",
  type: "safe_zone|restricted_area|high_risk",
  geometry: {
    type: "Circle",
    coordinates: [lng, lat],
    radius: 500
  },
  riskLevel: 1-10,
  alertEnabled: true
}
```

### 🔧 New Services

**`services/aiService.js`**
- `calculateSafetyScore()` - AI-powered risk scoring
- `generateIncidentReport()` - PDF report generation
- `analyzeBehaviorPatterns()` - Pattern analysis
- `checkHealth()` - AI service status

**`services/blockchainService.js`**
- `logIncident()` - Log to blockchain
- `logTouristActivity()` - Activity logging
- `verifyIncident()` - Verify authenticity
- `getLogs()` - Retrieve blockchain logs

**`services/geofencingService.js`**
- `checkGeofenceViolations()` - Location checking
- `calculateRiskMultiplier()` - Risk scoring
- `shouldSendAlert()` - Alert logic
- `generateAlertMessage()` - Alert text

---

## 🎮 Testing the System

### 1. Test Database Persistence

```bash
# Start backend
cd backend
npm start

# Create a test incident via API
curl -X POST http://localhost:5000/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"Test","location":"Test Location","severity":"Low","description":"Test incident"}'

# Restart backend - data should persist!
```

### 2. Test Real-time Updates

```bash
# Open web dashboard in browser (http://localhost:3000)
# Login as admin

# In another terminal, trigger panic alert:
curl -X POST http://localhost:5000/api/mobile/panic/alert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":28.6139,"lng":77.2090,"message":"Test emergency"}'

# ✨ Incident should appear INSTANTLY on dashboard!
```

### 3. Test AI Integration

```bash
# Start AI service
cd AI_services/safety_score
uvicorn main:app --reload --port 8001

# Test from backend
curl -X POST http://localhost:5000/api/ai/safety-score \
  -H "Content-Type: application/json" \
  -d '{"telemetry":{},"geofenceRisk":2,"anomalies":1}'

# Should return calculated safety score
```

### 4. Test Blockchain Logging

```bash
# Start blockchain service
cd Blockchain
node server.js

# Create incident - check it has blockchainHash
# View blockchain logs
curl http://localhost:4000/logs
```

### 5. Test Geofencing

```bash
# Create a geofence (as admin)
curl -X POST http://localhost:5000/api/geofences \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Restricted Area",
    "type":"restricted_area",
    "geometry":{"type":"Circle","coordinates":[77.2090,28.6139],"radius":1000},
    "riskLevel":8,
    "alertEnabled":true
  }'

# Check location against geofences
curl -X POST http://localhost:5000/api/geofences/check \
  -H "Content-Type: application/json" \
  -d '{"lat":28.6139,"lng":77.2090}'

# Should return violations if point inside geofence
```

---

## 📱 Mobile App Integration

### Test Panic Alert Flow

1. **Start backend** (with new enhanced version)
2. **Open web dashboard** as admin
3. **Open mobile app** on Android
4. **Login** as tourist_john
5. **Press panic button**
6. **Watch incident appear** instantly on web dashboard!

### Test Location Tracking

1. **Login to mobile app**
2. **Enable location sharing**
3. **Move around** (or simulate location)
4. **Open web dashboard** → Tourist Monitoring
5. **See tourist location** update in real-time on map

---

## 🔍 Debugging

### Check Service Status

```bash
# Health endpoint shows all services
curl http://localhost:5000/api/health

# Response shows:
# - Main API: online
# - AI Safety Score: online/offline
# - AI Case Report: online/offline
# - Database: online/offline
# - Blockchain: online/offline
```

### View Logs

**Backend:**
```bash
cd backend
npm start
# Watch console for:
# - MongoDB connection status
# - WebSocket connections
# - API requests
# - Service integration calls
```

**Frontend:**
```bash
# Open browser console (F12)
# Check for:
# - API request errors
# - WebSocket connection
# - State updates
```

### Common Issues

**"MongoDB connection error"**
- Check `.env` has correct MONGODB_URI
- Verify IP is whitelisted in MongoDB Atlas
- Test connection string in MongoDB Compass

**"AI service unavailable"**
- Verify AI services are running (ports 8001, 8002)
- Check Python dependencies installed
- System works with fallback if AI offline

**"Cannot connect to blockchain"**
- Blockchain service is optional
- System continues without it
- Check port 4000 available

---

## 📊 Performance Monitoring

### Real-time Metrics

```bash
# Dashboard shows:
# - Active tourists count
# - Open incidents count
# - Average safety score
# - System uptime
# - Average response time

# System health shows:
# - Each service status
# - Uptime percentage
# - Response times
```

### Database Performance

```javascript
// Models include indexes for performance
Tourist: { location: '2dsphere', status: 1, safetyScore: 1 }
Incident: { status: 1, severity: 1, createdAt: -1 }
Geofence: { geometry: '2dsphere', type: 1 }
```

---

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_key
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement input validation
- [ ] Configure CORS for production domain
- [ ] Use MongoDB Atlas with strong password
- [ ] Enable MongoDB network access restrictions

---

## 📚 Documentation

- **Setup Guide**: `COMPLETE_SETUP_GUIDE.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Completion Summary**: `PROJECT_COMPLETION_SUMMARY.md`
- **Integration Guide**: `INTEGRATION_COMPLETE.md`
- **Android Testing**: `ANDROID_TESTING_INSTRUCTIONS.md`

---

## 💡 Pro Tips

1. **Use the seed script** to quickly populate test data
2. **Check health endpoint** regularly during development
3. **Watch browser console** for WebSocket connection status
4. **Test mobile-web sync** before demo
5. **Keep all services running** for full functionality
6. **Use MongoDB Compass** to view database directly
7. **Check blockchain logs** to verify immutability

---

## 🎯 SIH Demo Checklist

- [ ] All services running and healthy
- [ ] Test credentials work
- [ ] Database has sample data
- [ ] Real-time updates working
- [ ] Mobile panic button creates incidents
- [ ] AI services responding
- [ ] Blockchain logging incidents
- [ ] Map shows tourist locations
- [ ] Dashboard shows real data
- [ ] Backup plan if internet issues

---

## 🏆 Success!

You now have a **complete, production-ready tourism safety platform** with:

- ✅ Persistent MongoDB database
- ✅ Real-time WebSocket updates
- ✅ AI service integration
- ✅ Blockchain audit trail
- ✅ Geofencing system
- ✅ Mobile-web synchronization
- ✅ Comprehensive documentation

**Ready for Smart India Hackathon! 🚀**

---

Questions? Check the documentation or test each component individually!
