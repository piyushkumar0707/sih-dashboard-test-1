const jwt = require('jsonwebtoken');

function verifyBearerToken(authorization, secret) {
  const [scheme, token] = (authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return { error: 'Bearer access token required' };
  try {
    return { user: jwt.verify(token, secret, { algorithms: ['HS256'] }) };
  } catch {
    return { error: 'Invalid or expired token' };
  }
}

function createAuthenticateToken(secret) {
  return (req, res, next) => {
    const result = verifyBearerToken(req.headers.authorization, secret);
    if (result.error) {
      return res.status(401).json({ error: result.error, code: 'UNAUTHENTICATED' });
    }
    req.user = result.user;
    return next();
  };
}

module.exports = { createAuthenticateToken, verifyBearerToken };
