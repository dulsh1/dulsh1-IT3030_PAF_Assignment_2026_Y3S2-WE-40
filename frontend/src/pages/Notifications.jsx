import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);

    const fetchNotifs = () => {
        if (!user) return;
        api.get(`/notifications/user/${user.id}`).then(res => setNotifications(res.data)).catch(console.error);
    };

    useEffect(() => { fetchNotifs(); }, [user]);

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifs();
        } catch(e) {}
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', minHeight: 'calc(100vh - 100px)' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '32px', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px' }}>Inbox Notifications</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>Stay updated on your tickets, bookings, and campus operations.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notifications.length === 0 ? (
                    <div className="premium-card" style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📬</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '500' }}>Your inbox is quiet for now.</p>
                    </div>
                ) : notifications.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(n => (
                    <div key={n.id} className="premium-card" style={{ 
                        padding: '20px 24px', 
                        background: n.read ? 'rgba(255,255,255,0.02)' : 'var(--surface)', 
                        borderLeft: `5px solid ${n.type === 'SUCCESS' ? '#10b981' : n.type === 'WARNING' ? '#f59e0b' : '#3b82f6'}`,
                        transition: 'transform 0.2s',
                        opacity: n.read ? 0.7 : 1,
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ 
                                    fontSize: '10px', 
                                    fontWeight: '800', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '1px',
                                    color: n.type === 'SUCCESS' ? '#10b981' : n.type === 'WARNING' ? '#f59e0b' : '#3b82f6',
                                    background: n.type === 'SUCCESS' ? 'rgba(16,185,129,0.1)' : n.type === 'WARNING' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '6px'
                                }}>
                                    {n.type}
                                </span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {new Date(n.createdAt).toLocaleDateString()} — {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p style={{ margin: '0 0 15px 0', fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: n.read ? '400' : '500' }}>
                            {n.message}
                        </p>
                        {!n.read && (
                            <button 
                                onClick={() => markRead(n.id)} 
                                style={{
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '8px 16px', 
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    fontSize: '12px', 
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
                                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
