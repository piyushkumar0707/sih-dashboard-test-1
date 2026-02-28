/**
 * notificationService.js
 * Handles Gmail email alerts and Firebase Cloud Messaging (FCM) push notifications.
 *
 * Gracefully no-ops when env vars are absent so the server never crashes
 * in dev/demo mode. Set these in your .env to activate real delivery:
 *
 *   EMAIL_USER          – your Gmail address  e.g. yourapp@gmail.com
 *   EMAIL_PASS          – 16-char App Password (NOT your Gmail login password)
 *                         Generate at: myaccount.google.com → Security → App passwords
 *   SMTP_HOST           – defaults to smtp.gmail.com
 *   SMTP_PORT           – defaults to 587
 *   FIREBASE_SERVICE_ACCOUNT – absolute path to serviceAccountKey.json
 */

const User = require('../models/User');

// ─── Nodemailer / Gmail ───────────────────────────────────────────────────────
let transporter = null;

if (process.env.EMAIL_USER && (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
  try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD,
      },
    });
    // Verify connection at startup
    transporter.verify((err) => {
      if (err) console.warn('⚠️  Gmail transporter verify failed:', err.message);
      else     console.log('✅ Gmail email transporter ready');
    });
  } catch (e) {
    console.warn('⚠️  nodemailer not available:', e.message);
  }
} else {
  console.warn('⚠️  EMAIL_USER / EMAIL_PASS missing — email notifications disabled');
}

/**
 * Send an email via Gmail.
 * @param {string} to      – recipient email address
 * @param {string} subject – email subject
 * @param {string} text    – plain-text body
 * @param {string} html    – optional HTML body (falls back to text)
 */
async function sendEmail(to, subject, text, html) {
  if (!transporter) {
    console.log(`[Email disabled] To: ${to} | Subject: ${subject}`);
    return { success: false, reason: 'Gmail not configured' };
  }
  if (!to) {
    console.warn('[Email] No recipient address — skipping');
    return { success: false, reason: 'No recipient' };
  }
  try {
    const info = await transporter.sendMail({
      from: `"Travira Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    return { success: false, reason: err.message };
  }
}

// ─── Firebase Admin / FCM ─────────────────────────────────────────────────────
let firebaseAdmin = null;
let fcmMessaging = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const admin = require('firebase-admin');
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    firebaseAdmin = admin;
    fcmMessaging = admin.messaging();
    console.log('✅ Firebase Admin / FCM initialised');
  } catch (e) {
    console.warn('⚠️  Firebase Admin init failed:', e.message);
  }
} else {
  console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT env var missing — push notifications disabled');
}

/**
 * Send a push notification to a single FCM token.
 * @param {string} fcmToken – Device FCM registration token
 * @param {string} title
 * @param {string} body
 * @param {object} data     – Optional extra key-value data
 */
async function sendPush(fcmToken, title, body, data = {}) {
  if (!fcmMessaging) {
    console.log(`[FCM disabled] Token: ${fcmToken?.slice(0, 12)}… | ${title}: ${body}`);
    return { success: false, reason: 'FCM not configured' };
  }
  if (!fcmToken) {
    console.warn('[FCM] No device token provided — skipping');
    return { success: false, reason: 'No device token' };
  }
  try {
    const messageId = await fcmMessaging.send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    });
    console.log(`🔔 Push sent: ${messageId}`);
    return { success: true, messageId };
  } catch (err) {
    console.error('[FCM] Push failed:', err.message);
    return { success: false, reason: err.message };
  }
}

/**
 * Send a push notification to ALL officers and admins in the database.
 * @param {string} title
 * @param {string} body
 * @param {object} data
 */
async function sendPushToOfficers(title, body, data = {}) {
  try {
    const officers = await User.find(
      { role: { $in: ['officer', 'admin'] }, fcmToken: { $exists: true, $ne: null } },
      'fcmToken username'
    );

    if (officers.length === 0) {
      console.warn('[FCM] No officers with registered FCM tokens');
      return { success: true, sent: 0 };
    }

    const results = await Promise.allSettled(
      officers.map(o => sendPush(o.fcmToken, title, body, data))
    );

    const sent = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    console.log(`🔔 Push broadcast to ${sent}/${officers.length} officers`);
    return { success: true, sent, total: officers.length };
  } catch (err) {
    console.error('[FCM] sendPushToOfficers error:', err.message);
    return { success: false, reason: err.message };
  }
}

module.exports = { sendEmail, sendPush, sendPushToOfficers };
