const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

function validateBody(check) {
  return (req, res, next) => {
    const message = check(req.body);
    if (message) return res.status(400).json({ error: message, code: 'VALIDATION_ERROR' });
    return next();
  };
}

const validators = {
  credentials(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    if (typeof body.username !== 'string' || body.username.trim().length < 3 || body.username.trim().length > 64) return 'username must contain 3 to 64 characters';
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 72) return 'password must contain 8 to 72 characters';
    return null;
  },
  registration(body) {
    const credentialError = validators.credentials(body);
    if (credentialError) return credentialError;
    if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'email must be a valid email address';
    if (body.role !== undefined && !['tourist', 'officer', 'admin'].includes(body.role)) return 'role is not supported';
    return null;
  },
  location(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    if (!isNumber(body.lat) || body.lat < -90 || body.lat > 90) return 'lat must be between -90 and 90';
    if (!isNumber(body.lng) || body.lng < -180 || body.lng > 180) return 'lng must be between -180 and 180';
    if (body.accuracy !== undefined && (!isNumber(body.accuracy) || body.accuracy < 0 || body.accuracy > 10000)) return 'accuracy must be between 0 and 10000';
    if (body.timestamp !== undefined && Number.isNaN(Date.parse(body.timestamp))) return 'timestamp must be a valid date';
    return null;
  },
  panic(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    if ((body.lat === undefined) !== (body.lng === undefined)) return 'lat and lng must be provided together';
    if (body.lat !== undefined && (!isNumber(body.lat) || body.lat < -90 || body.lat > 90)) return 'lat must be between -90 and 90';
    if (body.lng !== undefined && (!isNumber(body.lng) || body.lng < -180 || body.lng > 180)) return 'lng must be between -180 and 180';
    if (body.message !== undefined && (typeof body.message !== 'string' || body.message.length > 1000)) return 'message must be at most 1000 characters';
    return null;
  },
  safetyScore(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    const ranges = { geofenceRisk: [0, 10], anomalies: [0, 5], movementSpeedKmh: [0, 500], historicalIncidentsNearby: [0, 100], timeOfDay: [0, 23] };
    for (const [field, [min, max]] of Object.entries(ranges)) {
      if (body[field] !== undefined && (!isNumber(body[field]) || body[field] < min || body[field] > max)) return `${field} must be between ${min} and ${max}`;
    }
    if (body.anomalies !== undefined && !Number.isInteger(body.anomalies)) return 'anomalies must be an integer';
    if (body.historicalIncidentsNearby !== undefined && !Number.isInteger(body.historicalIncidentsNearby)) return 'historicalIncidentsNearby must be an integer';
    if (body.timeOfDay !== undefined && !Number.isInteger(body.timeOfDay)) return 'timeOfDay must be an integer';
    return null;
  },
  geofenceCheck(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    if (!isNumber(body.lat) || body.lat < -90 || body.lat > 90) return 'lat must be between -90 and 90';
    if (!isNumber(body.lng) || body.lng < -180 || body.lng > 180) return 'lng must be between -180 and 180';
    return null;
  },
  incident(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    const incidentTypes = ['Medical Emergency', 'Lost Tourist', 'Emergency Alert', 'Security Threat', 'Natural Disaster', 'Accident', 'Theft', 'Other'];
    if (!incidentTypes.includes(body.type)) return 'type must be a supported incident type';
    if (typeof body.location !== 'string' || !body.location.trim() || body.location.length > 300) return 'location must contain 1 to 300 characters';
    if (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 5000) return 'description must contain 1 to 5000 characters';
    if (body.severity !== undefined && !['Low', 'Medium', 'High', 'Critical'].includes(body.severity)) return 'severity is not supported';
    if (body.coordinates !== undefined) {
      const { lat, lng } = body.coordinates || {};
      if (!isNumber(lat) || lat < -90 || lat > 90 || !isNumber(lng) || lng < -180 || lng > 180) return 'coordinates must contain a valid lat and lng';
    }
    return null;
  },
  incidentUpdate(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    const allowed = ['status', 'severity', 'resolution', 'assignedOfficer', 'assignedOfficerId', 'priority', 'description', 'evidenceUrls'];
    if (!Object.keys(body).length || Object.keys(body).some((key) => !allowed.includes(key))) return 'Incident update contains no supported fields or has unknown fields';
    if (body.status !== undefined && !['Open', 'In Progress', 'Resolved', 'Closed', 'Monitoring'].includes(body.status)) return 'status is not supported';
    if (body.severity !== undefined && !['Low', 'Medium', 'High', 'Critical'].includes(body.severity)) return 'severity is not supported';
    for (const field of ['resolution', 'assignedOfficer', 'assignedOfficerId', 'description']) {
      if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > 5000)) return `${field} must be a string of at most 5000 characters`;
    }
    if (body.priority !== undefined && (!Number.isInteger(body.priority) || body.priority < 1 || body.priority > 5)) return 'priority must be an integer from 1 to 5';
    if (body.evidenceUrls !== undefined && (!Array.isArray(body.evidenceUrls) || body.evidenceUrls.length > 20 || body.evidenceUrls.some((url) => typeof url !== 'string' || url.length > 2048))) return 'evidenceUrls must contain at most 20 strings of at most 2048 characters';
    return null;
  },
  userUpdate(body) {
    if (!isObject(body) || !Object.keys(body).length || Object.keys(body).some((key) => !['role', 'status'].includes(key))) return 'Provide role and/or status only';
    if (body.role !== undefined && !['admin', 'officer', 'tourist'].includes(body.role)) return 'role is not supported';
    if (body.status !== undefined && !['active', 'pending', 'suspended'].includes(body.status)) return 'status is not supported';
    return null;
  },
  safetyScoreUpdate(body) {
    if (!isObject(body) || !isNumber(body.safetyScore) || body.safetyScore < 0 || body.safetyScore > 100) return 'safetyScore must be a number from 0 to 100';
    return null;
  },
  geofence(body) {
    if (!isObject(body)) return 'Request body must be a JSON object';
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120) return 'name must contain 1 to 120 characters';
    if (!['safe_zone', 'restricted_area', 'high_risk', 'tourist_attraction', 'emergency_zone'].includes(body.type)) return 'type is not supported';
    if (!isObject(body.geometry) || !['Point', 'Polygon'].includes(body.geometry.type) || !Array.isArray(body.geometry.coordinates)) return 'geometry must contain a supported type and coordinates array';
    if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 1000)) return 'description must be at most 1000 characters';
    if (body.active !== undefined && typeof body.active !== 'boolean') return 'active must be a boolean';
    if (body.alertEnabled !== undefined && typeof body.alertEnabled !== 'boolean') return 'alertEnabled must be a boolean';
    if (body.geometry.type === 'Point') {
      const [lng, lat] = body.geometry.coordinates;
      if (!isNumber(lat) || lat < -90 || lat > 90 || !isNumber(lng) || lng < -180 || lng > 180) return 'Point coordinates must be [longitude, latitude] within geographic bounds';
      if (!isNumber(body.geometry.radius) || body.geometry.radius <= 0 || body.geometry.radius > 1000000) return 'Point radius must be between 0 and 1000000 meters';
    }
    if (body.riskLevel !== undefined && (!isNumber(body.riskLevel) || body.riskLevel < 1 || body.riskLevel > 10)) return 'riskLevel must be between 1 and 10';
    return null;
  },
  device(body) {
    if (!isObject(body) || typeof body.fcmToken !== 'string' || !body.fcmToken.trim() || body.fcmToken.length > 4096) return 'fcmToken must contain 1 to 4096 characters';
    return null;
  },
};

module.exports = { validateBody, validators };
