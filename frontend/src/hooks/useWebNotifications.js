import { useEffect, useRef } from 'react';
import useSocket from './useSocket';

/**
 * useWebNotifications
 *
 * Requests browser Notification permission on first call, then subscribes
 * to socket events and fires native OS-level notifications so officers are
 * alerted even when the dashboard tab is minimised or in the background.
 *
 * Events handled:
 *   alert:panic     → urgent red-icon notification with tourist name + location
 *   alert:geofence  → warning notification with zone + tourist ID
 *   incident:created→ informational notification with incident type + location
 *
 * Usage: call once at the top of AppContent (after login):
 *   useWebNotifications();
 */
const useWebNotifications = () => {
  const { subscribe, unsubscribe } = useSocket();
  const permissionRef = useRef(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // ── Request permission once on mount ────────────────────────────────────
  useEffect(() => {
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        permissionRef.current = p;
        if (p === 'granted') {
          // Confirmation notification
          new Notification('Travira Dashboard', {
            body: '🔔 Notifications enabled — you will be alerted for panic alerts and geofence violations.',
            icon: '/favicon.ico',
          });
        }
      });
    } else {
      permissionRef.current = Notification.permission;
    }
  }, []);

  // ── Helper: fire a native notification safely ────────────────────────────
  const notify = (title, body, options = {}) => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: options.requireInteraction ?? false,
        tag: options.tag,           // prevents duplicate stacking
        silent: false,
        ...options,
      });
      // Auto-close informational ones after 8 s
      if (!options.requireInteraction) {
        setTimeout(() => n.close(), 8000);
      }
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.warn('[WebNotifications] Failed to show notification:', e.message);
    }
  };

  // ── Socket subscriptions ─────────────────────────────────────────────────
  useEffect(() => {
    // 🚨 PANIC
    const handlePanic = (data) => {
      const name     = data.tourist?.name || data.incident?.tourist || 'Unknown tourist';
      const location = data.incident?.location || 'Unknown location';
      const id       = data.incident?.incidentId || '';
      notify(
        '🚨 PANIC ALERT',
        `${name} needs help at ${location}${id ? ` — ${id}` : ''}`,
        { requireInteraction: true, tag: `panic-${id}` }
      );
    };

    // ⚠️ GEOFENCE
    const handleGeofence = (data) => {
      const tourist  = data.tourist?.touristId || data.tourist?.name || 'Unknown';
      const zone     = data.alert || data.zone || 'Restricted zone';
      notify(
        '⚠️ Geofence Violation',
        `Tourist ${tourist}: ${zone}`,
        { requireInteraction: false, tag: `geofence-${tourist}` }
      );
    };

    // 📋 NEW INCIDENT
    const handleIncident = (incident) => {
      const type     = incident.type || 'Incident';
      const location = incident.location || 'Unknown';
      const severity = incident.severity || '';
      notify(
        `📋 New Incident${severity ? ` (${severity})` : ''}`,
        `${type} at ${location}`,
        { requireInteraction: false, tag: `incident-${incident.incidentId}` }
      );
    };

    subscribe('alert:panic',      handlePanic);
    subscribe('alert:geofence',   handleGeofence);
    subscribe('incident:created', handleIncident);

    return () => {
      unsubscribe('alert:panic',      handlePanic);
      unsubscribe('alert:geofence',   handleGeofence);
      unsubscribe('incident:created', handleIncident);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useWebNotifications;
