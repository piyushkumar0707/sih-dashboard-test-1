# 🚀 Travira - Complete Setup Guide

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.10+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control
- **Android Studio** (for mobile app)

## 🔧 Project Setup

### 1. Clone and Install

```bash
# Navigate to project directory
cd "C:\Users\121pi\Desktop\sih app int"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install AI service dependencies
cd ../AI_services/safety_score
pip install -r requirements.txt

cd ../case_report
pip install -r requirements.txt

# Install blockchain dependencies
cd ../../Blockchain
npm install
```

### 2. Environment Configuration

**Create `.env` file in project root:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/travira?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# AI Services URLs
AI_SAFETY_SCORE_URL=http://localhost:8001
AI_CASE_REPORT_URL=http://localhost:8002

# Blockchain Service URL
BLOCKCHAIN_API_URL=http://localhost:4000

# Blockchain Configuration
ALCHEMY_AMOY_URL=your_alchemy_polygon_amoy_url
PRIVATE_KEY=your_metamask_private_key
NETWORK=amoy
```

### 3. Database Setup

```bash
# Seed the database with sample data
cd backend
npm run seed

# Expected output:
# ✅ Database seeding completed successfully!
# 📋 Test Credentials created
```

## 🚀 Running the Application

### Start All Services

**Terminal 1 - Backend API:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend Web Dashboard:**
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

**Terminal 3 - AI Safety Score Service:**
```bash
cd AI_services/safety_score
# Activate virtual environment if using one
uvicorn main:app --reload --port 8001
# Runs on http://localhost:8001
```

**Terminal 4 - AI Case Report Service:**
```bash
cd AI_services/case_report
uvicorn main:app --reload --port 8002
# Runs on http://localhost:8002
```

**Terminal 5 - Blockchain Service:**
```bash
cd Blockchain
npm start
# Runs on http://localhost:4000
```

### Verify All Services

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check AI services
curl http://localhost:8001/
curl http://localhost:8002/

# Check blockchain service
curl http://localhost:4000/
```

## 🔐 Test Credentials

After running the seed script, use these credentials:

**Web Dashboard:**
- **Admin**: username: `admin` / password: `admin123`
- **Officer**: username: `officer1` / password: `officer123`
- **Tourist**: username: `tourist1` / password: `tourist123`

**Android App:**
- username: `tourist_john` / password: `tourist123`

## 📱 Android App Setup

1. **Open Android Studio**
2. **Import Project**: `travira-android/`
3. **Wait for Gradle sync**
4. **Configure API URL** in `ApiClient.kt`:
   - For emulator: `http://10.0.2.2:5000/api/`
   - For physical device: `http://YOUR_IP:5000/api/`
5. **Run on emulator or device**

## ✅ Testing the Integration

### 1. Test Web Dashboard
- Login at http://localhost:3000
- Navigate to Dashboard - see KPIs
- Check Tourist Monitoring - view map
- Create an incident
- View system health status

### 2. Test Mobile App
- Login with `tourist_john`
- View safety dashboard
- **Test Panic Button** - creates incident in web dashboard
- Share location - updates tourist monitoring

### 3. Test Real-time Features
- Open web dashboard on one screen
- Press panic button on mobile app
- **Incident should appear instantly on web dashboard**

### 4. Test AI Integration
```bash
# Test safety score calculation
curl -X POST http://localhost:5000/api/ai/safety-score \
  -H "Content-Type: application/json" \
  -d '{"telemetry": {}, "geofenceRisk": 2, "anomalies": 1}'
```

### 5. Test Blockchain Logging
- Create an incident (web or mobile)
- Check incident has `blockchainHash` field
- Verify at http://localhost:4000/logs

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check port 5000 is not in use

### Frontend can't connect
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` is set correctly

### AI services offline
- Check Python dependencies are installed
- Verify ports 8001 and 8002 are available
- Check FastAPI is installed: `pip install fastapi uvicorn`

### Mobile app can't connect
- For emulator, use `10.0.2.2` not `localhost`
- For physical device, ensure same WiFi network
- Check backend allows `0.0.0.0` (not just localhost)

### Database connection issues
- Verify MongoDB Atlas credentials
- Check network connectivity
- Ensure database user has proper permissions

## 📊 Project Structure

```
sih app int/
├── backend/                    # Express.js API server
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Tourist.js
│   │   ├── Incident.js
│   │   └── Geofence.js
│   ├── services/              # Business logic
│   │   ├── aiService.js
│   │   ├── blockchainService.js
│   │   └── geofencingService.js
│   ├── index_new.js           # Main server (NEW VERSION)
│   └── seed_new.js            # Database seeding (NEW VERSION)
├── frontend/                  # React web dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── api.js
├── AI_services/              # Python AI microservices
│   ├── safety_score/
│   └── case_report/
├── Blockchain/               # Hardhat blockchain integration
│   ├── Contracts/
│   └── server.js
├── travira-android/         # Android mobile app
│   └── app/src/main/java/com/example/travira/
└── .env                     # Environment configuration
```

## 🎯 Key Features Implemented

✅ **MongoDB Integration** - Persistent data storage  
✅ **WebSocket Support** - Real-time updates  
✅ **AI Services Integration** - Safety scoring & report generation  
✅ **Blockchain Logging** - Immutable audit trail  
✅ **Geofencing** - Location-based alerts  
✅ **Mobile-Web Sync** - Cross-platform data flow  
✅ **Role-Based Access** - Admin/Officer/Tourist roles  
✅ **Emergency Alerts** - Panic button integration  

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation in backend code
3. Check console logs for error messages

## 🔄 Next Steps

1. **Production Deployment**
   - Deploy backend to cloud (Heroku, Railway, AWS)
   - Deploy frontend to Vercel or Netlify
   - Configure production environment variables

2. **Security Enhancements**
   - Implement rate limiting
   - Add input validation
   - Enable HTTPS
   - Implement refresh tokens

3. **Feature Additions**
   - Email/SMS notifications
   - Advanced analytics
   - Multi-language support
   - Export functionality

4. **Testing**
   - Add unit tests
   - Integration tests
   - End-to-end tests
   - Load testing

## 📝 License

MIT License - feel free to use for your Smart India Hackathon project!
