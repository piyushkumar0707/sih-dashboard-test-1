# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

Travira is a comprehensive AI-powered tourism safety management platform featuring a multi-platform architecture that includes Android mobile applications, React-based web dashboards, Node.js backend services, Python AI microservices, and blockchain integration. The system is designed for real-time tourist safety monitoring, automated incident response, and secure audit logging.

## Project Structure & Key Areas

### Multi-Platform Architecture
```
travira/
├── travira-android/          # Native Android app (Kotlin + Compose)
├── frontend/                 # React web dashboard (PWA)
├── backend/                  # Node.js API services
├── AI_services/             # Python FastAPI microservices
│   ├── case_report/         # AI-powered report generation
│   └── safety_score/        # Safety scoring algorithms
├── Blockchain/              # Hardhat blockchain integration
└── docs/                   # Comprehensive documentation
```

### Core Technology Components
- **Android App**: Modern Android development with Jetpack Compose, MVVM architecture, Room database, and Retrofit networking
- **React Frontend**: Progressive Web App with Tailwind CSS, React Router, Axios HTTP client, and Leaflet maps
- **Backend Services**: Express.js with MongoDB, JWT authentication, and multi-channel alert systems
- **AI Services**: FastAPI microservices with machine learning models for safety scoring and report generation
- **Blockchain**: Ethereum smart contracts using Hardhat framework for immutable audit logging

## Development Commands

### Android Application
```powershell
# Navigate to Android project
cd "travira-android"

# Clean and build project
.\gradlew clean
.\gradlew build

# Run on connected device/emulator
.\gradlew installDebug

# Generate signed APK for testing
.\gradlew assembleRelease

# Run unit tests
.\gradlew test

# Run instrumented tests
.\gradlew connectedAndroidTest

# Check dependencies for updates
.\gradlew dependencyUpdates
```

### React Frontend
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Access at http://localhost:3000

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run build --analyze

# PWA build verification
npm run build && npx serve -s build
```

### Node.js Backend
```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm start
# API available at http://localhost:5000

# Seed database with demo data
node seed.js

# Run in development with auto-reload
npx nodemon index.js

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

### AI Microservices
```powershell
# Case Report Service
cd "AI_services/case_report"
pip install -r requirements.txt
python main.py
# Service runs on http://localhost:8001

# Safety Score Service
cd "../safety_score"
pip install -r requirements.txt
python main.py
# Service runs on http://localhost:8002

# Run with auto-reload for development
uvicorn main:app --reload --port 8001
```

### Blockchain Development
```powershell
# Navigate to blockchain directory
cd Blockchain

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost

# Verify contract deployment
npx hardhat verify CONTRACT_ADDRESS --network localhost
```

## Development Workflows

### Full Stack Development Setup
```powershell
# 1. Start all services simultaneously

# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - AI Case Report Service
cd "AI_services/case_report" && python main.py

# Terminal 4 - AI Safety Score Service
cd "AI_services/safety_score" && python main.py

# Terminal 5 - Blockchain Network (if needed)
cd Blockchain && npx hardhat node

# Terminal 6 - Android Development
cd travira-android && .\gradlew installDebug
```

### Testing Workflows
```powershell
# Run comprehensive test suite

# Android tests
cd travira-android
.\gradlew test                    # Unit tests
.\gradlew connectedAndroidTest    # Instrumented tests

# Frontend tests
cd ../frontend
npm test                          # React component tests
npm run test:coverage             # Coverage report

# Backend API tests (if available)
cd ../backend
npm test                          # API endpoint tests

# AI service tests
cd "../AI_services/case_report"
pytest                            # Python unit tests

# Blockchain tests
cd "../../Blockchain"
npx hardhat test                  # Smart contract tests
```

## Key Development Areas

### Android Application Development
- **MVVM Architecture**: ViewModels for business logic, Repositories for data access
- **Jetpack Compose UI**: Declarative UI with Material3 design system
- **Real-time Features**: Location tracking, WebSocket connections, push notifications
- **Security**: AndroidX Security for encrypted storage, JWT token management
- **Offline Support**: Room database for local data caching

### Web Frontend Development
- **Component Architecture**: Reusable components following atomic design principles
- **State Management**: React Context API and hooks for application state
- **Real-time Updates**: WebSocket integration for live dashboard updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities
- **Performance**: Code splitting, lazy loading, and PWA optimization

### Backend API Development
- **RESTful Design**: Standard HTTP methods with consistent response formats
- **Authentication**: JWT-based stateless authentication with role-based access
- **Database Integration**: MongoDB with Mongoose ODM for flexible data modeling
- **Real-time Communication**: WebSocket support for live updates
- **Alert Systems**: Multi-channel notification dispatch (SMS, email, push)

### AI/ML Development
- **Safety Scoring**: Machine learning algorithms for risk assessment
- **Report Generation**: AI-powered E-FIR creation with natural language processing
- **Predictive Analytics**: Pattern recognition for incident prediction
- **Anomaly Detection**: Unusual behavior pattern identification
- **Performance Optimization**: Efficient model inference and caching

## Integration Points & APIs

### Internal API Communication
```javascript
// Android to Backend
const API_BASE = "http://localhost:5000"
// Authentication endpoints
POST /api/login
POST /api/register

// Tourist monitoring
GET /api/tourists
POST /api/location/update
GET /api/safety-score/:id

// Incident management
GET /api/incidents
POST /api/incidents
PUT /api/incidents/:id

// AI service integration
POST /api/ai/safety-score
POST /api/ai/generate-report
```

### External Service Integrations
- **Google Play Services**: Location tracking and Maps integration
- **SMS Gateways**: Emergency notification dispatch
- **Email Services**: Automated alert and report delivery
- **Blockchain Networks**: Smart contract deployment and interaction

## Security Considerations

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication across all platforms
- **Role-based Access**: Admin, Officer, Tourist roles with different permissions
- **Secure Storage**: AndroidX Security Crypto for mobile, encrypted cookies for web
- **API Security**: Rate limiting, input validation, CORS configuration

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data at rest
- **Network Security**: HTTPS/TLS for all communications
- **Privacy Compliance**: GDPR-compliant data handling and user consent
- **Audit Logging**: Comprehensive activity tracking with blockchain verification

## Performance Optimization

### Mobile Application
```kotlin
// Location tracking optimization
LocationRequest.create().apply {
    interval = 30000              // 30 seconds for battery efficiency
    fastestInterval = 15000       // 15 seconds minimum
    priority = PRIORITY_HIGH_ACCURACY
    smallestDisplacement = 10f    // 10 meters minimum movement
}

// Image loading optimization
Coil.setImageLoader(
    ImageLoader.Builder(context)
        .memoryCache {
            MemoryCache.Builder(context)
                .maxSizePercent(0.25)  // 25% of available memory
                .build()
        }
        .build()
)
```

### Web Application
```javascript
// Code splitting for optimal loading
const Dashboard = lazy(() => import('./pages/Dashboard'))
const TouristMonitoring = lazy(() => import('./pages/Tourists'))

// Image optimization
const OptimizedImage = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    decoding="async"
  />
)
```

## Debugging & Development Tools

### Android Debugging
```powershell
# View logs
adb logcat | findstr "TraVira"

# Debug network requests
adb shell dumpsys activity service com.example.travira

# Performance monitoring
adb shell dumpsys gfxinfo com.example.travira

# Database inspection (requires debug build)
adb exec-out run-as com.example.travira cat databases/travira_database.db
```

### Web Development Tools
```powershell
# Bundle analysis
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Performance testing
lighthouse http://localhost:3000 --output html

# Network monitoring
# Use browser DevTools Network tab for API call analysis
```

### Backend Debugging
```javascript
// Enable detailed logging
DEBUG=travira:* npm start

// API testing with curl
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tourist_john","password":"tourist123"}'

// Database query debugging
// Add to mongoose connection:
mongoose.set('debug', true)
```

## Testing Strategies

### Android Testing
- **Unit Tests**: Business logic in ViewModels and Repositories
- **Integration Tests**: API communication and database operations
- **UI Tests**: User interaction flows with Compose Testing
- **Performance Tests**: Memory usage and battery consumption

### Web Application Testing
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: API integration and data flow
- **E2E Tests**: Cypress for complete user workflows
- **Performance Tests**: Lighthouse CI for web vitals

### API Testing
- **Unit Tests**: Individual endpoint functionality
- **Integration Tests**: Database operations and external services
- **Load Tests**: Performance under high concurrent usage
- **Security Tests**: Authentication and authorization verification

## Deployment Considerations

### Development Environment
- **Local Development**: All services running locally with hot reload
- **Docker Compose**: Containerized development environment
- **Environment Variables**: Separate configs for dev/staging/production
- **Database Seeding**: Consistent test data across environments

### Production Deployment
- **Container Orchestration**: Docker containers with Kubernetes
- **Load Balancing**: Multiple service instances with proper load distribution
- **Database Scaling**: Read replicas and connection pooling
- **Monitoring**: Comprehensive logging, metrics, and alerting
- **Security**: SSL/TLS certificates, firewall rules, access controls

## Documentation & Resources

### Code Documentation
- **API Documentation**: Swagger/OpenAPI specs for all endpoints
- **Component Documentation**: Storybook for React components
- **Architecture Decisions**: ADR documents for major technical decisions
- **Setup Guides**: Platform-specific development setup instructions

### External Resources
- **Kotlin Documentation**: https://kotlinlang.org/docs/
- **Jetpack Compose**: https://developer.android.com/jetpack/compose
- **React Documentation**: https://reactjs.org/docs/
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/

This comprehensive development guide provides the foundation for effective collaboration and development within the Travira ecosystem, ensuring consistent code quality, security standards, and optimal performance across all platform components.
