import {useEffect, useRef, useState} from 'react';
import {api} from '../api.js';

function useAuthenticatedWebSocket(path, onMessage) {
    const socketRef = useRef(null);
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        let active = true;
        let retryTimer;
        let retryCount = 0;

        const connect = () => {
            const token = localStorage.getItem('access');
            if (!token) {
                setStatus('Authentication required');
                return;
            }

            const baseUrl = api.defaults.baseURL.endsWith('/')
                ? api.defaults.baseURL
                : `${api.defaults.baseURL}/`;
            const socketUrl = new URL(path, baseUrl);
            socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';

            const socket = new WebSocket(socketUrl, ['eventvault', `jwt.${token}`]);
            socketRef.current = socket;
            socket.onopen = () => {
                retryCount = 0;
                if (active) setStatus('Connected');
            };
            socket.onmessage = (event) => {
                try {
                    onMessage(JSON.parse(event.data));
                } catch (error) {
                    console.error('Unable to read WebSocket message:', error);
                }
            };
            socket.onerror = () => {
                if (active) setStatus('Connection interrupted');
            };
            socket.onclose = (event) => {
                socketRef.current = null;
                if (!active) return;
                if (event.code === 4401 || event.code === 4403) {
                    setStatus('Access denied');
                    return;
                }
                setStatus('Reconnecting');
                const delay = Math.min(30000, 1000 * (2 ** retryCount));
                retryCount += 1;
                retryTimer = setTimeout(connect, delay);
            };
        };

        connect();
        return () => {
            active = false;
            clearTimeout(retryTimer);
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, [onMessage, path]);

    return {socketRef, status};
}

export default useAuthenticatedWebSocket;
