"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const admin = useSelector((state) => state.adminAuth.adminInfo);

    useEffect(() => {
        // Only connect if admin is logged in
        if (!admin) {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Avoid reconnecting if already connected
        if (socket.current && socket.current.connected) return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

        // Initialize socket
        socket.current = io(backendUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.current.on('connect', () => {
            console.log('Global Socket Connected:', socket.current.id);
            setIsConnected(true);
        });

        socket.current.on('disconnect', () => {
            console.log('Global Socket Disconnected');
            setIsConnected(false);
        });

        socket.current.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
        });

        // Cleanup on unmount (only happens when app hard reloads or closes)
        return () => {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
                setIsConnected(false);
            }
        };
    }, [admin]); // Re-run only if admin state changes (login/logout)

    return (
        <SocketContext.Provider value={{ socket: socket.current, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
