import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Custom hook for subscribing to real-time IoT events via Socket.io.
 * @param serverUrl - The URL of the Socket.io server.
 */
export const useIoTSocket = (serverUrl: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: string; data: any } | null>(null);

  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    const events = [
      "iot:action_triggered",
      "iot:action_update",
      "iot:device_status",
      "iot:override_applied"
    ];

    events.forEach(event => {
      newSocket.on(event, (data: any) => {
        setLastEvent({ type: event, data });
      });
    });

    return () => {
      newSocket.close();
    };
  }, [serverUrl]);

  return { socket, lastEvent };
};
