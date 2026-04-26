import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const TOAST_CONFIG = {
    success: {
        icon: '✅',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.25)',
        bar: '#10b981',
    },
    error: {
        icon: '⚠️',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.25)',
        bar: '#ef4444',
    },
    warning: {
        icon: '🔔',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.25)',
        bar: '#f59e0b',
    },
    info: {
        icon: 'ℹ️',
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.25)',
        bar: '#3b82f6',
    },
};

const DURATION = 4500;

const Toast = ({ note, onRemove }) => {
    const config = TOAST_CONFIG[note.type] || TOAST_CONFIG.success;
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    // Fade in
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    // Progress bar countdown
    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
            setProgress(remaining);
            if (remaining === 0) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onRemove(note.id), 300);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '300px',
            maxWidth: '420px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${config.border}`,
            borderLeft: `4px solid ${config.color}`,
            borderRadius: '16px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${config.border}`,
            overflow: 'hidden',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(40px)',
            transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            {/* Main content */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px' }}>
                {/* Icon */}
                <div style={{
                    width: '34px', height: '34px', borderRadius: '10px',
                    background: config.bg, border: `1px solid ${config.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                }}>
                    {config.icon}
                </div>

                {/* Message */}
                <div style={{ flex: 1, paddingTop: '2px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: config.color, marginBottom: '3px' }}>
                        {note.type || 'notification'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '500', lineHeight: '1.4' }}>
                        {note.message}
                    </div>
                </div>

                {/* Close button */}
                <button onClick={handleClose} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8', cursor: 'pointer', fontSize: '14px',
                    width: '26px', height: '26px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.2s', marginTop: '2px',
                }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f1f5f9'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}>
                    ✕
                </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: config.bar,
                    transition: 'width 0.03s linear',
                    borderRadius: '0 0 0 16px',
                }} />
            </div>
        </div>
    );
};

const ToastContainer = () => {
    const { notifications, removeNotification } = useContext(NotificationContext);

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '10px',
            pointerEvents: 'none',
        }}>
            {notifications.map(note => (
                <div key={note.id} style={{ pointerEvents: 'auto' }}>
                    <Toast note={note} onRemove={removeNotification} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;