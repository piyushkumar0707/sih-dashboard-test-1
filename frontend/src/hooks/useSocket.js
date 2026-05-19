import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Singleton socket instance shared across all components
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('🔌 Socket connection error:', err.message);
    });
  }
  return socketInstance;
};

/**
 * useSocket — provides subscribe / unsubscribe helpers backed by a singleton
 * socket.io connection.
 *
 * Usage:
 *   const { subscribe, unsubscribe } = useSocket();
 *
 *   useEffect(() => {
 *     subscribe('tourist:location', handler);
 *     return () => unsubscribe('tourist:location', handler);
 *   }, []);
 */
const useSocket = () => {
  const socketRef = useRef(getSocket());

  // Ensure the ref always points at the current singleton
  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  const subscribe = (event, cb) => {
    socketRef.current.on(event, cb);
  };

  const unsubscribe = (event, cb) => {
    if (cb) {
      socketRef.current.off(event, cb);
    } else {
      socketRef.current.off(event);
    }
  };

  return { subscribe, unsubscribe, socket: socketRef.current };
};

export default useSocket;
