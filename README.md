# 🌟 Travira – AI-Powered Tourism Safety Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-brightgreen.svg)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)](https://mongodb.com/)

> A comprehensive AI-powered safety monitoring and incident management system for the tourism sector, providing real-time dashboards, tourist tracking, AI analytics, and blockchain-secured logging.

### 🌍 Live Demo & Repository
- **Live Platform URL**: [https://travira-iota.vercel.app/](https://travira-iota.vercel.app/)
- **Demo Video Walkthrough**: [Watch Video on GitHub](https://github.com/piyushkumar0707/sih-dashboard-test-1/raw/refs/heads/main/WhatsApp%20Video%202025-10-06%20at%2015.54.43.mp4)


- ## 🎯 Project Overview

**Travira** is a sophisticated tourism safety management platform designed to protect tourists through real-time monitoring, automated incident response, and secure data management. The system integrates cutting-edge technologies including AI analytics, blockchain security, geo-fencing, and digital identity management to create a comprehensive safety ecosystem.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Multi-Role Authentication**: Admin, Officer, Tourist roles with JWT-based security
- **Role-Based Access Control**: Granular permissions for different user types
- **User Profile Management**: Comprehensive user profiles with safety-relevant information
- **Account Approval Workflow**: Automated approval process for officers

### 📊 Real-Time Dashboard
- **Live KPI Monitoring**: Active tourists, incidents, safety scores, officers on duty
- **Interactive Charts**: Real-time data visualization with trends and analytics
- **System Health Monitoring**: Service status and uptime tracking
- **Quick Actions**: Streamlined access to common administrative tasks

### 🗺️ Tourist Monitoring & Safety
- **Real-Time GPS Tracking**: Continuous location monitoring with interactive maps
- **AI-Powered Safety Scoring**: Intelligent risk assessment algorithms
- **Geo-fencing Technology**: Virtual boundaries with automated alerts
- **Risk Assessment**: Predictive analytics for proactive safety measures
- **Emergency Alerts**: Multi-channel notification system

### 🚨 Incident Management
- **Automated E-FIR Generation**: Instant First Information Report creation
- **Incident Tracking**: Complete lifecycle management from creation to resolution
- **Multi-Channel Alerts**: SMS, email, and push notifications
- **Evidence Collection**: Automatic compilation of incident-related data
- **Response Coordination**: Inter-department collaboration tools

### 🧠 AI Analytics & Intelligence
- **Predictive Safety Analytics**: Machine learning for threat prediction
- **Anomaly Detection**: Unusual pattern recognition and alerts
- **Safety Trend Analysis**: Historical data analysis and insights
- **Risk Visualization**: Heat maps and risk indicators
- **Performance Metrics**: AI accuracy and system performance tracking

### 🔗 Blockchain Integration
- **Immutable Logging**: Tamper-proof incident and activity records
- **Audit Trails**: Complete tracking of all system activities
- **Data Integrity**: Blockchain-secured evidence and documentation
- **Smart Contracts**: Automated processes with Hardhat integration

### 📱 Progressive Web App (PWA)
- **Mobile-First Design**: Optimized for field officers and mobile use
- **Offline Capability**: Limited functionality without internet connection
- **Push Notifications**: Real-time alerts and updates
- **App-Like Experience**: Installable on mobile devices

## 🏗️ Technical Architecture

### 📁 Monorepo Structure
```
TOURISM-1/
├── frontend/               # React SPA with PWA features
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React context providers
│   │   ├── api.js          # API integration layer
│   │   └── App.js          # Main application component
│   ├── public/             # Static assets and PWA manifest
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js/Express API server
│   ├── models/             # MongoDB data models
│   ├── index.js            # Main server file with all endpoints
│   └── seed.js             # Database seeding script
├── AI_services/            # Python FastAPI microservices
│   ├── case_report/        # AI-powered report generation
│   └── safety_score/       # AI safety scoring algorithm
├── Blockchain/             # Hardhat blockchain integration
│   └── hardhat.config.js   # Blockchain configuration
└── Documentation/          # Project documentation
```

## 🛠️ Tech Stack

### Frontend Technologies
- **Framework**: React 19.1.1 with Create React App
- **Routing**: React Router DOM 7.8.2
- **Styling**: Tailwind CSS 3.3.3 with responsive design
- **Icons**: Heroicons 2.2.0 for consistent iconography
- **Maps**: Leaflet 1.9.4 with React-Leaflet 5.0.0
- **HTTP Client**: Axios 1.11.0 for API communication
- **PWA**: Service Worker with offline capabilities
- **State Management**: React Context API
- **UI Components**: Custom component library

### Backend Technologies
- **Runtime**: Node.js 18+ with Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM 8.18.0
- **Authentication**: JSON Web Tokens (JWT) 9.0.2
- **Security**: bcrypt 6.0.0 for password hashing
- **CORS**: Configured for cross-origin requests
- **API Architecture**: RESTful APIs with role-based access

### AI & Analytics
- **Framework**: Python 3.10+ with FastAPI
- **Server**: Uvicorn ASGI server
- **PDF Generation**: FPDF for report generation
- **Machine Learning**: Custom algorithms for safety scoring
- **Predictive Analytics**: Pattern recognition and anomaly detection

### Blockchain & Security
- **Framework**: Hardhat for Ethereum development
- **Smart Contracts**: Solidity-based contract deployment
- **Network**: Local development with testnet support
- **Security**: End-to-end encryption and secure logging

### Development Tools
- **Build System**: Webpack with code splitting
- **CSS Framework**: Tailwind CSS with PostCSS
- **Testing**: Jest and React Testing Library
- **Linting**: ESLint with React configuration
- **Version Control**: Git with comprehensive .gitignore

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **Python**: Version 3.10 or higher  
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

### 📥 Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/piyushkumar0707/sih-dashboard-test-1.git
cd sih-dashboard-test-1
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Seed the database with demo users
node seed.js

# Start the backend server
npm start
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install frontend dependencies
npm install

# Start the React development server
npm start
# Application opens at http://localhost:3000
```

#### 4. AI Services Setup
```bash
# Setup Safety Score Service
cd AI_services/safety_score
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# Service runs on http://localhost:8001

# Setup Case Report Service (in new terminal)
cd ../case_report
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
# Service runs on http://localhost:8002
```

#### 5. Blockchain Setup (Optional)
```bash
cd Blockchain
npm install
npx hardhat test
```

### 🔧 Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/travira

# JWT Security
JWT_SECRET=your-secret-key-here

# API Configuration
PORT=5000
NODE_ENV=development

# AI Services URLs
AI_SAFETY_SCORE_URL=http://localhost:8001
AI_CASE_REPORT_URL=http://localhost:8002
```

#### Frontend Environment Variables
Create a `.env` file in the frontend directory:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# Map Configuration
REACT_APP_MAPBOX_TOKEN=your-mapbox-token-here

# PWA Configuration
REACT_APP_VERSION=1.0.0
```

## 👥 Demo Accounts

Use these pre-configured accounts for testing:

| Role    | Username | Password   | Access Level |
|---------|----------|------------||--------------|
| Admin   | admin    | admin123   | Full system access |
| Officer | officer1 | officer123 | Operational access |
| Tourist | tourist1 | tourist123 | Limited access |

## 🖼️ UI Components & Pages

### 📋 Core Pages

#### 🏠 Dashboard (`/dashboard`)
- **KPI Cards**: Active tourists, incidents, safety scores, officers
- **Recent Incidents**: Real-time incident feed with status tracking
- **System Health**: Service monitoring and uptime statistics
- **Quick Actions**: Common administrative tasks

#### 👥 User Management (`/users`)
- **User Directory**: Complete user listing with roles and status
- **Role Management**: Admin tools for user role assignment
- **Account Approval**: Workflow for officer account verification
- **Activity Monitoring**: User login and activity tracking

#### 🗺️ Tourist Monitoring (`/tourists`)
- **Interactive Map**: Real-time tourist location tracking
- **Safety Scores**: AI-powered risk assessment display
- **Geo-fence Management**: Virtual boundary configuration
- **Alert Configuration**: Custom alert rules and thresholds

#### 🚨 Incident Management (`/incidents`)
- **Incident Dashboard**: Complete incident lifecycle management
- **E-FIR Generation**: Automated report creation
- **Status Tracking**: Progress monitoring and updates
- **Evidence Management**: Document and media handling

#### 🧠 AI Analytics (`/ai-analytics`)
- **Safety Metrics**: AI-powered analytics and insights
- **Trend Analysis**: Historical data visualization
- **Anomaly Alerts**: Unusual pattern detection
- **Predictive Models**: Risk forecasting and prevention

#### 🔗 Blockchain Logs (`/blockchain`)
- **Transaction History**: Immutable activity logs
- **Audit Trails**: Complete system accountability
- **Data Integrity**: Verification and validation tools
- **Smart Contract Monitoring**: Contract execution tracking

#### ⚕️ System Health (`/system-health`)
- **Service Monitoring**: Real-time service status
- **Performance Metrics**: Response times and uptime
- **Alert Configuration**: System health notifications
- **Maintenance Scheduling**: Planned downtime management

#### 📊 Reports (`/reports`)
- **Custom Reports**: AI-powered report generation
- **Data Export**: CSV and PDF export capabilities
- **Scheduled Reports**: Automated report delivery
- **Report Templates**: Pre-configured report formats

### 🎨 UI Component Library

#### Layout Components
- **Header**: Navigation bar with user profile and notifications
- **Sidebar**: Collapsible navigation with role-based menu items
- **Layout**: Responsive grid system with mobile optimization

#### Data Display
- **StatCard**: KPI display with trend indicators
- **DataTable**: Sortable and filterable data grids
- **Charts**: Interactive charts using Chart.js integration
- **Maps**: Leaflet-based interactive mapping

#### Forms & Inputs
- **AuthForm**: Login and registration forms
- **FilterPanel**: Advanced filtering and search
- **DatePicker**: Date and time selection components
- **FileUpload**: Drag-and-drop file handling

#### Feedback Components
- **Notifications**: Toast notifications for user feedback
- **Loading**: Skeleton screens and loading indicators
- **Modals**: Confirmation dialogs and detail views
- **Alerts**: System alerts and warnings

## 📡 API Endpoints

### Authentication Endpoints
- `POST /api/login` - User authentication
- `POST /api/register` - User registration

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Dashboard KPIs
- `GET /api/health` - System health status

### User Management
- `GET /api/users` - List all users (Admin only)
- `PUT /api/users/:id` - Update user role/status
- `DELETE /api/users/:id` - Delete user

### Tourist Monitoring
- `GET /api/tourists` - List all tourists with locations
- `GET /api/tourists/:id` - Get specific tourist details
- `PUT /api/tourists/:id/safety-score` - Update safety score

### Incident Management
- `GET /api/incidents` - List incidents with filtering
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident status

### AI Integration
- `POST /api/ai/safety-score` - Calculate safety score
- `POST /api/ai/generate-report` - Generate incident report
- `GET /api/ai/metrics` - AI performance metrics
- `GET /api/ai/trends` - Safety trend analysis
- `GET /api/ai/alerts` - AI-generated alerts

## 🔒 Security Features

### Authentication & Authorization
- **JWT Token Security**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Session Management**: Automatic token refresh and expiration
- **Multi-Factor Authentication**: Enhanced security for admin accounts

### Data Protection
- **Password Encryption**: bcrypt hashing for secure storage
- **API Security**: CORS configuration and request validation
- **Input Sanitization**: Protection against injection attacks
- **Audit Logging**: Complete activity tracking

### Privacy & Compliance
- **Data Anonymization**: Tourist data protection
- **GDPR Compliance**: Privacy regulation adherence
- **Secure Communication**: HTTPS enforcement
- **Regular Security Audits**: Vulnerability assessments

## 🚀 Deployment

### Development Environment
```bash
# Start all services
npm run dev              # Frontend development server
npm run backend         # Backend API server
npm run ai:case         # Case report AI service
npm run ai:safety       # Safety score AI service
```

### Production Deployment

#### Using Docker (Recommended)
```bash
# Build and deploy with Docker Compose
docker-compose up -d
```

#### Manual Deployment
```bash
# Build frontend for production
cd frontend
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
# Configure backend on cloud platform (AWS, Azure, GCP)
```

## 📊 Monitoring & Analytics

### Performance Metrics
- **Response Times**: API endpoint performance tracking
- **System Uptime**: Service availability monitoring
- **User Activity**: Login patterns and usage statistics
- **AI Accuracy**: Model performance and accuracy metrics

### Business Intelligence
- **Tourist Safety Trends**: Historical safety data analysis
- **Incident Patterns**: Recurring issue identification
- **Resource Utilization**: Officer deployment optimization
- **Risk Assessment**: Predictive analytics for prevention

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and conventions
4. Write tests for new functionality
5. Submit a pull request with detailed description

### Code Standards
- **React Components**: Use functional components with hooks
- **API Design**: Follow RESTful conventions
- **Code Style**: ESLint configuration for consistency
- **Documentation**: Update README and code comments

### Reporting Issues
- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include system information and error logs
- Suggest potential solutions when possible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tourism Department**: For providing requirements and feedback
- **Law Enforcement Agencies**: For collaboration and insights  
- **AI Research Community**: For algorithms and best practices
- **Open Source Libraries**: For enabling rapid development

## 📞 Support & Contact

- **Project Repository**: [GitHub Issues](https://github.com/piyushkumar0707/sih-dashboard-test-1/issues)
- **Email**: 121piyush466mits@gmail.com
- **Documentation**: Comprehensive guides in `/docs` directory
- **Community**: Join discussions in repository discussions section

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core dashboard functionality
- ✅ User authentication and management
- ✅ Basic incident tracking
- ✅ AI safety scoring integration

### Phase 2 (Planned)
- 🔄 Advanced AI analytics and reporting
- 🔄 Mobile app for tourists
- 🔄 IoT sensor integration
- 🔄 Multi-language support

### Phase 3 (Future)
- 📅 Drone surveillance integration
- 📅 Facial recognition capabilities
- 📅 Weather API integration
- 📅 Social media monitoring

---

**© 2025 Travira Team | Built with ❤️ for Tourist Safety**

*Making tourism safer through technology and innovation*
