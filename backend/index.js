// Load environment variables (local dev only; Railway injects env vars natively)
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Tourist = require('./models/Tourist');
const Incident = require('./models/Incident');
const Geofence = require('./models/Geofence');

// Services
const AIService = require('./services/aiService');
const BlockchainService = require('./services/blockchainService');
const GeofencingService = require('./services/geofencingService');
const NotificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'travira-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully');
  console.log('Database:', process.env.MONGODB_URI.split('/').pop().split('?')[0]);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

// Utility function to emit real-time updates
const emitUpdate = (event, data) => {
  io.emit(event, data);
};

// ===== AUTHENTICATION ENDPOINTS =====

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, role = 'tourist' } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
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

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Contact administrator.' });
    }
    
    user.lastActive = new Date();
    await user.save();
    
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

app.get('/api/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.delete('/api/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== TOURIST MONITORING ENDPOINTS =====

app.get('/api/tourists', authenticateToken, requireRole('admin', 'officer'), async (req, res) => {
  try {
    const tourists = await Tourist.find({}).sort({ lastUpdated: -1 });
    const total = tourists.length;
    const active = tourists.filter(t => t.status === 'active').length;
    const highRisk = tourists.filter(t => t.safetyScore < 70).length;
    const avgScore = total > 0 ? Math.round(tourists.reduce((sum, t) => sum + t.safetyScore, 0) / total) : 0;
    
    res.json({
      tourists,
      summary: {
        total,
        active,
        highRisk,
        averageSafetyScore: avgScore
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tourists/:id', authenticateToken, async (req, res) => {
  try {
    const tourist = await Tourist.findOne({ touristId: req.params.id });
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    res.json(tourist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tourists/:id/safety-score', async (req, res) => {
  try {
    const { safetyScore } = req.body;
    const tourist = await Tourist.findOne({ touristId: req.params.id });
    
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    
    await tourist.updateSafetyScore(safetyScore);
    
    // Emit real-time update
    emitUpdate('tourist:updated', tourist);
    
    res.json(tourist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== INCIDENT MANAGEMENT ENDPOINTS =====

app.get('/api/incidents', authenticateToken, async (req, res) => {
  try {
    const { status, severity } = req.query;
    const userRole = req.user.role;
    let query = {};
    
    // If tourist, only show incidents related to them
    if (userRole === 'tourist') {
      const touristData = await Tourist.findOne({ userId: req.user.userId });
      if (!touristData) {
        return res.json({ incidents: [], summary: { total: 0, open: 0, resolved: 0, investigating: 0 } });
      }
      query.touristId = touristData._id;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    const incidents = await Incident.find(query).sort({ createdAt: -1 });
    const stats = await Incident.getStats();
    
    res.json({
      incidents,
      summary: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', authenticateToken, async (req, res) => {
  try {
    const incidentCount = await Incident.countDocuments();
    const incidentId = `INC-2024-${String(incidentCount + 1).padStart(3, '0')}`;
    
    const incident = new Incident({
      incidentId,
      ...req.body,
      status: 'Open'
    });
    
    await incident.save();
    
    // Log to blockchain
    const blockchainResult = await BlockchainService.logIncident(incident);
    if (blockchainResult.success) {
      incident.blockchainHash = blockchainResult.vcHash;
      await incident.save();
    }
    
    // Emit real-time update
    emitUpdate('incident:created', incident);
    
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id });
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    Object.assign(incident, req.body);
    await incident.save();
    
    // Emit real-time update
    emitUpdate('incident:updated', incident);
    
    res.json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.4 — Generate E-FIR PDF for an incident
app.post('/api/incidents/:id/generate-report', authenticateToken, async (req, res) => {
  try {
    const incident = await Incident.findOne({ incidentId: req.params.id });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    // Enrich with tourist safety score if available
    let safetyScore = null;
    if (incident.touristId) {
      const tourist = await Tourist.findOne({ touristId: incident.touristId });
      if (tourist) safetyScore = tourist.safetyScore ?? null;
    }

    const coordStr = incident.coordinates?.lat && incident.coordinates?.lng
      ? `${incident.coordinates.lat.toFixed(5)}, ${incident.coordinates.lng.toFixed(5)}`
      : null;

    const result = await AIService.generateIncidentReport({
      incident_id: incident.incidentId,
      type: incident.type,
      location: incident.location,
      severity: incident.severity,
      description: incident.description,
      tourist_name: incident.tourist || 'Unknown',
      tourist_id: incident.touristId || '-',
      officer_name: incident.assignedOfficer || 'Unassigned',
      timestamp: incident.createdAt ? incident.createdAt.toISOString() : null,
      safety_score_at_time: safetyScore,
      coordinates: coordStr,
      blockchain_hash: incident.blockchainHash || null,
      status: incident.status,
    });

    if (!result.success && !result.pdf_base64) {
      return res.status(503).json({ error: result.error || 'Report generation failed' });
    }

    // 6.5 — Mark report generated on the incident
    incident.reportGenerated = true;
    incident.reportGeneratedAt = new Date();
    await incident.save();

    res.json({
      success: true,
      incident_id: incident.incidentId,
      fir_number: result.fir_number,
      pdf_base64: result.pdf_base64,
      generated_at: result.generated_at,
    });
  } catch (err) {
    console.error('E-FIR generation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== AI SERVICE INTEGRATION ENDPOINTS =====

app.post('/api/ai/safety-score', async (req, res) => {
  try {
    const result = await AIService.calculateSafetyScore(req.body);
    res.json({
      safetyScore: result.safetyScore,
      confidence: result.confidence,
      risk_level: result.riskLevel,
      anomaly_flags: result.anomalyFlags || [],
      model: result.model,
      factors: result.factors,
      timestamp: result.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

app.post('/api/ai/generate-report', async (req, res) => {
  try {
    const result = await AIService.generateIncidentReport(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Report generation failed' });
  }
});

app.get('/api/ai/metrics', async (req, res) => {
  try {
    const tourists = await Tourist.find({}, 'safetyScore status scoreHistory');
    const scores = tourists.map(t => t.safetyScore || 0);
    const avgSafetyScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const predictedRisks = tourists.filter(t => (t.safetyScore || 0) < 50).length;
    const highRisk = tourists.filter(t => t.status === 'high-risk' || t.status === 'emergency').length;
    // Count anomalies from recent score history drops
    let anomaliesDetected = 0;
    tourists.forEach(t => {
      const hist = t.scoreHistory || [];
      for (let i = 1; i < hist.length; i++) {
        if ((hist[i - 1].score || 0) - (hist[i].score || 0) > 20) anomaliesDetected++;
      }
    });
    res.json({
      avgSafetyScore,
      predictedRisks,
      anomaliesDetected,
      highRisk,
      aiAccuracy: 94.2  // reported from last model evaluation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/trends', async (req, res) => {
  try {
    // Build per-hour average safety score from scoreHistory of all tourists
    const tourists = await Tourist.find({}, 'scoreHistory');
    const hourBuckets = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
    tourists.forEach(t => {
      (t.scoreHistory || []).forEach(entry => {
        const h = new Date(entry.timestamp).getHours();
        hourBuckets[h].sum += entry.score || 0;
        hourBuckets[h].count += 1;
      });
    });
    const trends = hourBuckets.map((b, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      safety: b.count ? Math.round(b.sum / b.count) : null
    })).filter(t => t.safety !== null);
    // Fall back to static data when no history exists yet
    if (trends.length === 0) {
      return res.json([
        { hour: '00:00', safety: 92 },
        { hour: '06:00', safety: 88 },
        { hour: '12:00', safety: 85 },
        { hour: '18:00', safety: 89 },
        { hour: '23:00', safety: 91 }
      ]);
    }
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ai/alerts', (req, res) => {
  res.json([
    { id: 1, type: 'High Risk', message: 'Tourist entered restricted area', time: '2 min ago', severity: 'high' },
    { id: 2, type: 'Anomaly', message: 'Unusual movement pattern detected', time: '15 min ago', severity: 'medium' },
    { id: 3, type: 'Prediction', message: 'Crowding expected at Heritage Site B', time: '1 hour ago', severity: 'low' }
  ]);
});

// ===== GEOFENCING ENDPOINTS =====

app.get('/api/geofences', authenticateToken, async (req, res) => {
  try {
    const geofences = await GeofencingService.getAllGeofences();
    res.json(geofences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/geofences', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await GeofencingService.createGeofence(req.body);
    if (result.success) {
      res.status(201).json(result.geofence);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/geofences/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await Geofence.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Geofence not found' });
    res.json({ success: true, message: 'Geofence deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/geofences/check', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const result = await GeofencingService.checkGeofenceViolations(lat, lng);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== BLOCKCHAIN ENDPOINTS =====

app.get('/api/blockchain/logs', async (req, res) => {
  try {
    const result = await BlockchainService.getLogs();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SYSTEM HEALTH ENDPOINTS =====

app.get('/api/health', async (req, res) => {
  try {
    const aiServices = await AIService.checkHealth();
    const blockchainOnline = await BlockchainService.checkHealth();
    
    const services = [
      { name: 'Main API', status: 'online', uptime: '99.9%', responseTime: '120ms' },
      { 
        name: 'AI Safety Score', 
        status: aiServices.safetyScore ? 'online' : 'offline', 
        uptime: aiServices.safetyScore ? '98.5%' : '0%', 
        responseTime: aiServices.safetyScore ? '450ms' : 'N/A',
        optional: true
      },
      { 
        name: 'AI Case Report', 
        status: aiServices.caseReport ? 'online' : 'offline', 
        uptime: aiServices.caseReport ? '99.2%' : '0%', 
        responseTime: aiServices.caseReport ? '1200ms' : 'N/A',
        optional: true
      },
      { 
        name: 'Database', 
        status: mongoose.connection.readyState === 1 ? 'online' : 'offline', 
        uptime: '100%', 
        responseTime: '45ms' 
      },
      { 
        name: 'Blockchain', 
        status: blockchainOnline ? 'online' : 'offline', 
        uptime: blockchainOnline ? '95.1%' : '0%', 
        responseTime: blockchainOnline ? '2300ms' : 'N/A',
        optional: true
      }
    ];
    
    // Only consider critical services (non-optional) for overall status
    const criticalServices = services.filter(s => !s.optional);
    const overallStatus = criticalServices.every(s => s.status === 'online') ? 'healthy' : 'degraded';
    
    res.json({
      overall: overallStatus,
      services,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== DASHBOARD STATS ENDPOINTS =====

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // If tourist, return limited stats relevant to them
    if (userRole === 'tourist') {
      const touristData = await Tourist.findOne({ userId: req.user.userId });
      const allIncidents = await Incident.find({});
      const openIncidents = allIncidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
      
      return res.json({
        activeTourists: 1,
        totalTourists: 1,
        openIncidents: openIncidents,
        totalIncidents: allIncidents.length,
        averageSafetyScore: touristData ? touristData.safetyScore : 85,
        highRiskTourists: touristData && touristData.safetyScore < 70 ? 1 : 0,
        systemUptime: '99.8%',
        averageResponseTime: '2.3 min'
      });
    }
    
    // For admin/officer, return full stats
    const tourists = await Tourist.find({});
    const incidentStats = await Incident.getStats();
    
    const activeTourists = tourists.filter(t => t.status === 'active').length;
    const avgSafetyScore = tourists.length > 0 
      ? Math.round(tourists.reduce((sum, t) => sum + t.safetyScore, 0) / tourists.length)
      : 0;
    const highRiskTourists = tourists.filter(t => t.safetyScore < 70).length;
    
    res.json({
      activeTourists,
      totalTourists: tourists.length,
      openIncidents: incidentStats.open,
      totalIncidents: incidentStats.total,
      averageSafetyScore: avgSafetyScore,
      highRiskTourists,
      systemUptime: '99.8%',
      averageResponseTime: '2.3 min'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/recent-activity', authenticateToken, async (req, res) => {
  try {
    const recentIncidents = await Incident.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    
    const activities = recentIncidents.map(inc => ({
      type: 'incident',
      message: `${inc.type} reported in ${inc.location}`,
      timestamp: inc.createdAt
    }));
    
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== MOBILE-SPECIFIC ENDPOINTS =====

app.post('/api/mobile/auth/login', async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;
    
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role, status: user.status },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      },
      apiBaseUrl: `http://localhost:${PORT}/api`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mobile/location/update', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, accuracy, timestamp } = req.body;
    const userId = req.user.userId;
    
    let tourist = await Tourist.findOne({ userId: userId.toString() });
    
    if (!tourist) {
      const touristCount = await Tourist.countDocuments();
      tourist = new Tourist({
        touristId: `T-${String(touristCount + 1).padStart(3, '0')}`,
        userId: userId.toString(),
        name: req.user.username,
        location: { lat, lng },
        safetyScore: 85,
        status: 'active',
        lastUpdated: new Date(timestamp || Date.now()),
        accuracy: accuracy || 0
      });
    } else {
      await tourist.updateLocation(lat, lng, accuracy);
    }
    
    // Check geofence violations
    const geofenceCheck = await GeofencingService.checkGeofenceViolations(lat, lng);
    
    // Calculate safety score with AI
    const aiScoreResult = await AIService.calculateSafetyScore({
      telemetry: { location: { lat, lng } },
      geofenceRisk: GeofencingService.calculateRiskMultiplier(geofenceCheck.violations),
      anomalies: 0
    });
    
    if (aiScoreResult.success) {
      await tourist.updateSafetyScore(aiScoreResult.safetyScore);
    }
    
    await tourist.save();
    
    // Emit real-time update
    emitUpdate('tourist:location', tourist);
    
    // Generate alert if geofence violation
    if (geofenceCheck.hasViolations && GeofencingService.shouldSendAlert(tourist, geofenceCheck.violations)) {
      const alertMessage = GeofencingService.generateAlertMessage(tourist, geofenceCheck.violations);
      emitUpdate('alert:geofence', { tourist, alert: alertMessage });

      // 5.4 — Email emergency contact on geofence breach
      const contactEmail = tourist.emergencyContact?.email;
      if (contactEmail) {
        const name = tourist.name || req.user.username;
        const loc = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        NotificationService.sendEmail(
          contactEmail,
          `⚠️ Travira Geofence Alert: ${name}`,
          `TRAVIRA ALERT: ${name} has entered a restricted zone at ${loc}. Please check in with them.`,
          `<h2>⚠️ Geofence Alert</h2><p><strong>${name}</strong> has entered a restricted zone.</p><p>Location: <strong>${loc}</strong></p><p>Please check in with them immediately.</p><hr><small>Sent by Travira Tourist Safety System</small>`
        ).catch(() => {});
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Location updated successfully',
      tourist,
      geofenceCheck: geofenceCheck.hasViolations ? geofenceCheck : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mobile/panic/alert', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    const userId = req.user.userId;
    const username = req.user.username;
    
    const tourist = await Tourist.findOne({ userId: userId.toString() });
    const touristId = tourist ? tourist.touristId : `T-${userId.toString().slice(-3)}`;
    
    const incident = new Incident({
      incidentId: `PANIC-${Date.now()}`,
      type: 'Emergency Alert',
      location: lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Unknown Location',
      coordinates: { lat, lng },
      severity: 'High',
      status: 'Open',
      touristId: touristId,
      tourist: username,
      assignedOfficer: 'Emergency Response Team',
      description: message || 'Panic button activated - Emergency assistance required!'
    });
    
    await incident.save();
    
    // Log to blockchain
    const blockchainResult = await BlockchainService.logIncident(incident);
    if (blockchainResult.success) {
      incident.blockchainHash = blockchainResult.vcHash;
      await incident.save();
    }
    
    // Update tourist status
    if (tourist) {
      tourist.status = 'emergency';
      tourist.safetyScore = 0;
      await tourist.save();
    }
    
    // Emit real-time emergency alert
    emitUpdate('alert:panic', { incident, tourist });

    // 5.3 — Email emergency contact on panic
    const contactEmail = tourist?.emergencyContact?.email;
    if (contactEmail) {
      const loc = lat && lng ? `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` : 'unknown location';
      NotificationService.sendEmail(
        contactEmail,
        `🚨 EMERGENCY: ${username} needs help!`,
        `EMERGENCY: ${username} has activated the panic button at ${loc}. Please call emergency services immediately!`,
        `<h2 style="color:red">🚨 EMERGENCY ALERT</h2><p><strong>${username}</strong> has activated the panic button.</p><p>Location: <strong>${loc}</strong></p><p style="color:red"><strong>Please call emergency services immediately!</strong></p><hr><small>Sent by Travira Tourist Safety System</small>`
      ).catch(() => {});
    }

    // 5.8 — FCM push to all officers/admins
    NotificationService.sendPushToOfficers(
      '🚨 PANIC ALERT',
      `${username} triggered panic at ${lat ? `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` : 'unknown location'}`,
      { incidentId: incident.incidentId, type: 'panic' }
    ).catch(() => {});

    console.log(`🚨 PANIC ALERT: ${username} at ${lat}, ${lng}`);
    
    res.json({ 
      success: true, 
      incidentId: incident.incidentId,
      message: 'Emergency alert sent successfully! Help is on the way!',
      estimatedResponse: '5-10 minutes'
    });
  } catch (error) {
    console.error('Panic alert error:', error);
    res.status(500).json({ error: 'Failed to send panic alert' });
  }
});

app.get('/api/mobile/tourist/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tourist = await Tourist.findOne({ userId: userId.toString() });
    
    if (!tourist) {
      return res.json({
        status: 'not_tracking',
        message: 'Location tracking not yet started',
        safetyScore: 85,
        recommendations: ['Enable location sharing for better safety monitoring']
      });
    }
    
    res.json({
      tourist: tourist,
      safetyTips: [
        'Stay in well-lit areas',
        'Keep your phone charged',
        'Share your location with family',
        'Use the panic button in emergencies'
      ],
      nearbyServices: [
        { type: 'police', distance: '0.5 km', contact: '100' },
        { type: 'hospital', distance: '1.2 km', contact: '102' },
        { type: 'tourist_help', distance: '0.8 km', contact: '1363' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TEST ENDPOINTS =====

// 5.10 — Register / refresh device FCM token
app.post('/api/mobile/device/register', authenticateToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ error: 'fcmToken required' });

    await User.findByIdAndUpdate(req.user.userId, { fcmToken });
    console.log(`📱 FCM token saved for user ${req.user.username}`);
    res.json({ success: true, message: 'Device token registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the Travira backend!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API connection successful!',
    timestamp: new Date().toISOString(),
    server: 'Travira Backend v2.0'
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Travira Backend Server Started');
  console.log(`📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Also accessible at http://localhost:${PORT}`);
  console.log('\n✅ Features Enabled:');
  console.log('  - JWT Authentication');
  console.log('  - MongoDB Integration');
  console.log('  - WebSocket Real-time Updates');
  console.log('  - AI Service Integration');
  console.log('  - Blockchain Logging');
  console.log('  - Geofencing');
  console.log('\n📚 API Endpoints Available:');
  console.log('Authentication:');
  console.log('  POST /api/login');
  console.log('  POST /api/register');
  console.log('Tourist Monitoring:');
  console.log('  GET  /api/tourists');
  console.log('  GET  /api/tourists/:id');
  console.log('Incident Management:');
  console.log('  GET  /api/incidents');
  console.log('  POST /api/incidents');
  console.log('Mobile API:');
  console.log('  POST /api/mobile/auth/login');
  console.log('  POST /api/mobile/location/update');
  console.log('  POST /api/mobile/panic/alert');
  console.log('  GET  /api/mobile/tourist/status');
  console.log('AI Services:');
  console.log('  POST /api/ai/safety-score');
  console.log('  POST /api/ai/generate-report');
  console.log('System:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/dashboard/stats\n');
});
