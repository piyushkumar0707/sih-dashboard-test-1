# 📚 Travira API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Get Token
Login or register to receive JWT token valid for 24 hours.

---

## 🔐 Authentication Endpoints

### POST /api/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "tourist|officer|admin" (optional, default: "tourist")
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role",
    "status": "active|pending"
  }
}
```

### POST /api/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "string (or email)",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role",
    "status": "status"
  }
}
```

---

## 👥 User Management (Admin Only)

### GET /api/users
Get all users (requires admin role).

**Headers:** Authorization Bearer token

**Response:**
```json
[
  {
    "id": "user-id",
    "username": "username",
    "email": "email",
    "role": "role",
    "status": "status",
    "createdAt": "timestamp"
  }
]
```

### PUT /api/users/:id
Update user role or status.

**Headers:** Authorization Bearer token

**Request Body:**
```json
{
  "role": "admin|officer|tourist",
  "status": "active|pending|suspended"
}
```

### DELETE /api/users/:id
Delete a user.

**Headers:** Authorization Bearer token

---

## 🗺️ Tourist Monitoring

### GET /api/tourists
Get all tourists with location data (Admin/Officer only).

**Headers:** Authorization Bearer token

**Response:**
```json
{
  "tourists": [
    {
      "touristId": "T-001",
      "name": "John Doe",
      "location": { "lat": 28.6139, "lng": 77.2090 },
      "safetyScore": 85,
      "status": "active",
      "lastUpdated": "timestamp"
    }
  ],
  "summary": {
    "total": 10,
    "active": 8,
    "highRisk": 2,
    "averageSafetyScore": 87
  }
}
```

### GET /api/tourists/:id
Get specific tourist by ID.

**Headers:** Authorization Bearer token

**Response:** Single tourist object

### PUT /api/tourists/:id/safety-score
Update tourist safety score.

**Request Body:**
```json
{
  "safetyScore": 75
}
```

---

## 🚨 Incident Management

### GET /api/incidents
Get all incidents with optional filters.

**Headers:** Authorization Bearer token

**Query Parameters:**
- `status`: Filter by status (Open, In Progress, Resolved, Closed)
- `severity`: Filter by severity (Low, Medium, High, Critical)

**Response:**
```json
{
  "incidents": [
    {
      "incidentId": "INC-2024-001",
      "type": "Medical Emergency",
      "location": "Tourism Zone A",
      "coordinates": { "lat": 28.6139, "lng": 77.2090 },
      "severity": "High",
      "status": "Open",
      "touristId": "T-001",
      "tourist": "John Doe",
      "assignedOfficer": "Officer-123",
      "description": "Description",
      "createdAt": "timestamp",
      "blockchainHash": "0x..."
    }
  ],
  "summary": {
    "total": 50,
    "open": 10,
    "resolved": 38,
    "highSeverity": 5
  }
}
```

### POST /api/incidents
Create new incident.

**Headers:** Authorization Bearer token

**Request Body:**
```json
{
  "type": "Medical Emergency|Lost Tourist|Emergency Alert|etc",
  "location": "Description of location",
  "coordinates": { "lat": 28.6139, "lng": 77.2090 },
  "severity": "Low|Medium|High|Critical",
  "touristId": "T-001",
  "tourist": "Tourist Name",
  "assignedOfficer": "Officer Name",
  "description": "Incident description"
}
```

**Response:** Created incident object with blockchain hash

### PUT /api/incidents/:id
Update incident details.

**Headers:** Authorization Bearer token

**Request Body:** Any incident fields to update

---

## 🤖 AI Services

### POST /api/ai/safety-score
Calculate safety score using AI.

**Request Body:**
```json
{
  "telemetry": {},
  "geofenceRisk": 1,
  "anomalies": 0
}
```

**Response:**
```json
{
  "success": true,
  "safetyScore": 85,
  "timestamp": "timestamp"
}
```

### POST /api/ai/generate-report
Generate incident report PDF.

**Request Body:**
```json
{
  "touristId": "T-001",
  "type": "Incident Type",
  "location": "Location description"
}
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "filename": "report_xxx.pdf",
  "reportId": "report_123"
}
```

### GET /api/ai/metrics
Get AI analytics metrics.

**Response:**
```json
{
  "avgSafetyScore": 87,
  "predictedRisks": 3,
  "anomaliesDetected": 12,
  "aiAccuracy": 94.2
}
```

### GET /api/ai/trends
Get safety trend data.

**Response:** Array of hourly safety scores

### GET /api/ai/alerts
Get AI-generated alerts.

**Response:** Array of alert objects

---

## 📍 Geofencing

### GET /api/geofences
Get all active geofences.

**Headers:** Authorization Bearer token

**Response:** Array of geofence objects

### POST /api/geofences
Create new geofence (Admin only).

**Headers:** Authorization Bearer token

**Request Body:**
```json
{
  "name": "Safe Zone A",
  "type": "safe_zone|restricted_area|high_risk|tourist_attraction",
  "description": "Description",
  "geometry": {
    "type": "Circle|Polygon",
    "coordinates": [lng, lat],
    "radius": 500
  },
  "riskLevel": 5,
  "alertEnabled": true
}
```

### POST /api/geofences/check
Check if location violates geofences.

**Request Body:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090
}
```

**Response:**
```json
{
  "hasViolations": true,
  "violations": [...],
  "riskScore": 7
}
```

---

## ⛓️ Blockchain

### GET /api/blockchain/logs
Get all blockchain logs.

**Response:**
```json
{
  "success": true,
  "logs": [...],
  "timestamp": "timestamp"
}
```

---

## ⚡ System Health

### GET /api/health
Check system health status.

**Response:**
```json
{
  "overall": "healthy|degraded",
  "services": [
    {
      "name": "Main API",
      "status": "online",
      "uptime": "99.9%",
      "responseTime": "120ms"
    },
    ...
  ],
  "timestamp": "timestamp"
}
```

---

## 📊 Dashboard

### GET /api/dashboard/stats
Get dashboard statistics (Admin/Officer only).

**Headers:** Authorization Bearer token

**Response:**
```json
{
  "activeTourists": 245,
  "totalTourists": 300,
  "openIncidents": 7,
  "totalIncidents": 150,
  "averageSafetyScore": 87,
  "highRiskTourists": 15,
  "systemUptime": "99.8%",
  "averageResponseTime": "2.3 min"
}
```

### GET /api/dashboard/recent-activity
Get recent activity feed.

**Headers:** Authorization Bearer token

**Response:** Array of activity objects

---

## 📱 Mobile API Endpoints

### POST /api/mobile/auth/login
Mobile login endpoint with device ID tracking.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "deviceId": "device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {...},
  "apiBaseUrl": "http://localhost:5000/api"
}
```

### POST /api/mobile/location/update
Update tourist location from mobile app.

**Headers:** Authorization Bearer token

**Request Body:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "accuracy": 10,
  "timestamp": "iso-timestamp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "tourist": {...},
  "geofenceCheck": {...} (if violations detected)
}
```

### POST /api/mobile/panic/alert
Send panic/emergency alert.

**Headers:** Authorization Bearer token

**Request Body:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "message": "Emergency message"
}
```

**Response:**
```json
{
  "success": true,
  "incidentId": "PANIC-1234567890",
  "message": "Emergency alert sent successfully!",
  "estimatedResponse": "5-10 minutes"
}
```

### GET /api/mobile/tourist/status
Get current tourist status and safety info.

**Headers:** Authorization Bearer token

**Response:**
```json
{
  "tourist": {...},
  "safetyTips": [...],
  "nearbyServices": [...]
}
```

---

## 🧪 Test Endpoints

### GET /api/hello
Simple test endpoint.

**Response:**
```json
{
  "message": "Hello from the Travira backend!"
}
```

### GET /api/test
Connection test endpoint.

**Response:**
```json
{
  "status": "success",
  "message": "API connection successful!",
  "timestamp": "timestamp",
  "server": "Travira Backend v2.0"
}
```

---

## ⚡ WebSocket Events

Connect to WebSocket server at `http://localhost:5000`

### Server Events (Listen)

- **`tourist:updated`** - Tourist data updated
- **`tourist:location`** - Tourist location changed
- **`incident:created`** - New incident created
- **`incident:updated`** - Incident updated
- **`alert:panic`** - Emergency panic alert
- **`alert:geofence`** - Geofence violation alert

### Event Payload Examples

```javascript
// tourist:location
{
  "touristId": "T-001",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "safetyScore": 85
}

// incident:created
{
  "incidentId": "INC-2024-001",
  "type": "Medical Emergency",
  "severity": "High",
  ...
}

// alert:panic
{
  "incident": {...},
  "tourist": {...}
}
```

---

## 🔒 Security

- All passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- Role-based access control enforced
- CORS enabled for specified origins
- MongoDB connection uses secure connection string

## 📝 Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📞 Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- Authentication endpoints: 5 requests/minute
- General API: 100 requests/minute
- WebSocket: Unlimited

## 🔄 Pagination

Not currently implemented. For large datasets, consider adding:
```
GET /api/incidents?page=1&limit=20
```

---

Built with ❤️ for Smart India Hackathon 2025
