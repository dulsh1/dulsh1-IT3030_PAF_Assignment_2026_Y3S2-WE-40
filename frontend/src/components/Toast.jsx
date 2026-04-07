import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const ToastContainer = () => {
    const { notifications, removeNotification } = useContext(NotificationContext);

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(note => (
                <div key={note.id} style={{
                    minWidth: '280px', 
                    background: note.type === 'error' ? '#e74c3c' : '#2ecc71', 
                    color: 'white',
                    padding: '16px 20px', 
                    borderRadius: '8px', 
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontWeight: '600',
                    fontSize: '15px',
                    animation: 'fadein 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <span>{note.message}</span>
                    <button 
                        onClick={() => removeNotification(note.id)} 
                        style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px', marginLeft: '20px', opacity: 0.8}}
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
