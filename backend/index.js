// ...existing code...
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
const PORT = 5000;

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'travira-secret-key-2024';

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control middleware
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

app.use(cors());
app.use(express.json());

// ===== AI ANALYTICS EXTRA ENDPOINTS =====
// AI Metrics
app.get('/api/ai/metrics', (req, res) => {
  res.json({
    avgSafetyScore: 87,
    predictedRisks: 3,
    anomaliesDetected: 12,
    aiAccuracy: 94.2
  });
});

// AI Trends
app.get('/api/ai/trends', (req, res) => {
  res.json([
    { hour: '00:00', safety: 92 },
    { hour: '06:00', safety: 88 },
    { hour: '12:00', safety: 85 },
    { hour: '18:00', safety: 89 },
    { hour: '24:00', safety: 91 }
  ]);
});

// AI Alerts
app.get('/api/ai/alerts', (req, res) => {
  res.json([
    { id: 1, type: 'High Risk', message: 'Tourist T-003 entered restricted area', time: '2 min ago', severity: 'high' },
    { id: 2, type: 'Anomaly', message: 'Unusual movement pattern detected', time: '15 min ago', severity: 'medium' },
    { id: 3, type: 'Prediction', message: 'Crowding expected at Heritage Site B', time: '1 hour ago', severity: 'low' }
  ]);
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/travira', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Sample data for demonstration
const tourists = [
  { id: 'T-001', name: 'John Doe', location: { lat: 28.6139, lng: 77.2090 }, safetyScore: 85, status: 'active' },
  { id: 'T-002', name: 'Jane Smith', location: { lat: 28.6129, lng: 77.2295 }, safetyScore: 92, status: 'active' },
  { id: 'T-003', name: 'Bob Johnson', location: { lat: 28.6169, lng: 77.2090 }, safetyScore: 67, status: 'high-risk' }
];

const incidents = [
  {
    id: 'INC-2024-001',
    type: 'Medical Emergency',
    location: 'Tourism Zone A',
    severity: 'High',
    status: 'In Progress',
    touristId: 'T-001',
    assignedOfficer: 'Officer-123',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    description: 'Tourist reported chest pain during sightseeing'
  },
  {
    id: 'INC-2024-002',
    type: 'Lost Tourist',
    location: 'Heritage Site B',
    severity: 'Medium',
    status: 'Resolved',
    touristId: 'T-002',
    assignedOfficer: 'Officer-456',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    description: 'Tourist separated from group, found safe'
  }
];

// ===== AUTHENTICATION ENDPOINTS =====

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role = 'tourist' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Set initial status based on role
    const status = role === 'officer' ? 'pending' : 'active';
    
    const user = new User({ 
      username, 
      email, 
      password, 
      role, 
      status,
      verified: role !== 'officer'
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact administrator.' });
    }
    
    // Update last active
    user.lastActive = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role/status (Admin only)
app.put('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, status },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== TOURIST MONITORING ENDPOINTS =====

// Get all tourists with locations (Admin/Officer only)
app.get('/api/tourists', authenticateToken, requireRole('admin', 'officer'), (req, res) => {
  res.json({
    tourists,
    summary: {
      total: tourists.length,
      active: tourists.filter(t => t.status === 'active').length,
      highRisk: tourists.filter(t => t.safetyScore < 70).length,
      averageSafetyScore: Math.round(tourists.reduce((sum, t) => sum + t.safetyScore, 0) / tourists.length)
    }
  });
});

// Get tourist by ID
app.get('/api/tourists/:id', (req, res) => {
  const tourist = tourists.find(t => t.id === req.params.id);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }
  res.json(tourist);
});

// Update tourist safety score (from AI service)
app.put('/api/tourists/:id/safety-score', (req, res) => {
  const { safetyScore } = req.body;
  const touristIndex = tourists.findIndex(t => t.id === req.params.id);
  if (touristIndex === -1) {
    return res.status(404).json({ error: 'Tourist not found' });
  }
  tourists[touristIndex].safetyScore = safetyScore;
  tourists[touristIndex].status = safetyScore < 70 ? 'high-risk' : 'active';
  res.json(tourists[touristIndex]);
});

// ===== INCIDENT MANAGEMENT ENDPOINTS =====

// Get all incidents (Admin/Officer only)
app.get('/api/incidents', authenticateToken, requireRole('admin', 'officer'), (req, res) => {
  const { status, severity } = req.query;
  let filteredIncidents = [...incidents];
  
  if (status) {
    filteredIncidents = filteredIncidents.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  
  if (severity) {
    filteredIncidents = filteredIncidents.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
  }
  
  res.json({
    incidents: filteredIncidents,
    summary: {
      total: incidents.length,
      open: incidents.filter(i => i.status !== 'Resolved').length,
      resolved: incidents.filter(i => i.status === 'Resolved').length,
      highSeverity: incidents.filter(i => i.severity === 'High').length
    }
  });
});

// Create new incident
app.post('/api/incidents', (req, res) => {
  const newIncident = {
    id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'Open'
  };
  incidents.push(newIncident);
  res.status(201).json(newIncident);
});

// Update incident
app.put('/api/incidents/:id', (req, res) => {
  const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
  if (incidentIndex === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  incidents[incidentIndex] = { ...incidents[incidentIndex], ...req.body };
  res.json(incidents[incidentIndex]);
});

// ===== AI SERVICE INTEGRATION ENDPOINTS =====

// Calculate safety score via AI service
app.post('/api/ai/safety-score', async (req, res) => {
  try {
    // In real implementation, this would call the AI microservice
    // For now, simulate the response
    const { telemetry, geofenceRisk = 1, anomalies = 0 } = req.body;
    const score = Math.max(0, 100 - (geofenceRisk * 10 + anomalies * 20) + Math.random() * 10);
    
    res.json({
      safetyScore: Math.round(score),
      factors: {
        geofenceRisk,
        anomalies,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// Generate incident report via AI service
app.post('/api/ai/generate-report', async (req, res) => {
  try {
    const { touristId, alert, location } = req.body;
    // Simulate PDF generation
    const reportId = `report_${Date.now()}`;
    
    res.json({
      status: 'success',
      reportId,
      downloadUrl: `/api/reports/download/${reportId}`,
      message: 'Report generated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: 'Report generation failed' });
  }
});

// ===== SYSTEM HEALTH ENDPOINTS =====

// System health check
app.get('/api/health', (req, res) => {
  const services = [
    { name: 'Main API', status: 'online', uptime: '99.9%', responseTime: '120ms' },
    { name: 'AI Safety Score', status: 'online', uptime: '98.5%', responseTime: '450ms' },
    { name: 'AI Case Report', status: 'online', uptime: '99.2%', responseTime: '1200ms' },
    { name: 'Database', status: 'online', uptime: '100%', responseTime: '45ms' },
    { name: 'Blockchain', status: 'warning', uptime: '95.1%', responseTime: '2300ms' }
  ];
  
  const overallStatus = services.every(s => s.status === 'online') ? 'healthy' : 'degraded';
  
  res.json({
    overall: overallStatus,
    services,
    timestamp: new Date().toISOString()
  });
});

// ===== DASHBOARD STATS ENDPOINTS =====

// Dashboard overview stats (Admin/Officer only)
app.get('/api/dashboard/stats', authenticateToken, requireRole('admin', 'officer'), (req, res) => {
  res.json({
    activeTourists: tourists.filter(t => t.status === 'active').length,
    totalTourists: tourists.length,
    openIncidents: incidents.filter(i => i.status !== 'Resolved').length,
    totalIncidents: incidents.length,
    averageSafetyScore: Math.round(tourists.reduce((sum, t) => sum + t.safetyScore, 0) / tourists.length),
    highRiskTourists: tourists.filter(t => t.safetyScore < 70).length,
    systemUptime: '99.8%',
    averageResponseTime: '2.3 min'
  });
});

// Recent activity feed
app.get('/api/dashboard/recent-activity', (req, res) => {
  const activities = [
    { type: 'incident', message: 'New medical emergency reported in Zone A', timestamp: new Date(Date.now() - 600000).toISOString() },
    { type: 'tourist', message: 'Tourist T-003 entered high-risk area', timestamp: new Date(Date.now() - 900000).toISOString() },
    { type: 'system', message: 'AI safety score service restarted', timestamp: new Date(Date.now() - 1200000).toISOString() }
  ];
  res.json(activities);
});

// Sample API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Travira backend!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  - POST /api/login');
  console.log('  - POST /api/register');
  console.log('  - GET  /api/users');
  console.log('  - GET  /api/tourists');
  console.log('  - GET  /api/incidents');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/dashboard/stats');
});
