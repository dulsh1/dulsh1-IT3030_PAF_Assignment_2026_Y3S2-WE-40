import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const roleWelcome = {
    ROLE_ADMIN: { subtitle: "You have full access to manage campus operations, users, and resources.", icon: '🛡️' },
    ROLE_TECHNICIAN: { subtitle: "Ready to tackle today's maintenance tickets and service requests.", icon: '🔧' },
    ROLE_USER: { subtitle: "Here's what's happening with your campus operations today.", icon: '🎓' },
};

const bookingStatusStyle = (status) => {
    const map = {
        PENDING:   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
        APPROVED:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
        REJECTED:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
        CANCELLED: { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
    };
    return map[status] || map['PENDING'];
};

const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-main)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
};

// ── Report Incident Modal ─────────────────────────────────────────
const ReportIncidentModal = ({ onClose, onSuccess, userId }) => {
    const [resources, setResources] = useState([]);
    const [form, setForm] = useState({
        resourceId: '', category: 'IT_EQUIPMENT', priority: 'MEDIUM', description: '', contactDetails: '',
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/resources').then(res => setResources(res.data)).catch(() => {});
    }, []);

    const handleSubmit = async () => {
        if (!form.resourceId) { setError('Please select a resource.'); return; }
        if (!form.description.trim()) { setError('Please describe the issue.'); return; }
        if (!form.contactDetails.trim()) { setError('Please provide contact details.'); return; }
        if (files.length > 3) { setError('Maximum 3 attachments allowed.'); return; }

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/tickets', {
                creatorId: userId,
                resourceId: Number(form.resourceId),
                category: form.category,
                priority: form.priority,
                description: form.description,
                contactDetails: form.contactDetails,
            });
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                await api.post(`/tickets/${res.data.id}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit ticket.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', width: '100%', maxWidth: '540px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>Incident Reporting</div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'white' }}>🚨 Report an Issue</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Affected Resource *</label>
                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.resourceId}
                            onChange={e => setForm(p => ({ ...p, resourceId: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = '#ef4444'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                            <option value="">— Select a resource —</option>
                            {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Category</label>
                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="IT_EQUIPMENT">IT / Technology</option>
                                <option value="FURNITURE">Furniture / Hardware</option>
                                <option value="PLUMBING">Plumbing / Leaks</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Priority</label>
                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                <option value="LOW">Low — Not urgent</option>
                                <option value="MEDIUM">Medium — Affects usage</option>
                                <option value="HIGH">High — Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Description *</label>
                        <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
                            placeholder="Describe exactly what is broken or malfunctioning..."
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = '#ef4444'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Contact Details *</label>
                        <input style={inputStyle} placeholder="e.g. john@university.edu or 0771234567"
                            value={form.contactDetails}
                            onChange={e => setForm(p => ({ ...p, contactDetails: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = '#ef4444'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px' }}>Attachments (Optional, max 3)</label>
                        <div style={{ position: 'relative', border: '2px dashed var(--border)', padding: '16px', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                            <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            <span style={{ fontSize: '13px', color: files.length > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: files.length > 0 ? '700' : '400' }}>
                                {files.length > 0 ? `${files.length} file(s) selected` : '📎 Click to attach images'}
                            </span>
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0, fontWeight: '600' }}>⚠️ {error}</p>}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
                        <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Submitting...' : '🚨 Submit Incident'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Dashboard ─────────────────────────────────────────────────────
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [myTickets, setMyTickets] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        if (!user) return;
        api.get(`/notifications/user/${user.id}`).then(res => setNotifications(res.data)).catch(() => {});
        if (user.role === 'ROLE_USER') {
            api.get(`/tickets/user/${user.id}`).then(res => setMyTickets(res.data)).catch(console.error);
            api.get(`/bookings/user/${user.id}`)
                .then(res => setMyBookings(res.data.slice().reverse()))
                .catch(console.error)
                .finally(() => setLoadingBookings(false));
        } else {
            setLoadingBookings(false);
        }
    }, [user]);

    const handleIncidentSuccess = () => {
        showNotification('Incident ticket submitted successfully!', 'success');
        api.get(`/tickets/user/${user.id}`).then(res => setMyTickets(res.data)).catch(console.error);
    };

    const welcome = roleWelcome[user?.role] || roleWelcome['ROLE_USER'];

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '60px 20px' }}>
            {showReportModal && (
                <ReportIncidentModal userId={user.id} onClose={() => setShowReportModal(false)} onSuccess={handleIncidentSuccess} />
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Hero */}
                <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '50%', height: '150%', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 100%)', transform: 'rotate(-45deg)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>{welcome.icon}</div>
                        <h1 style={{ fontSize: '36px', color: 'var(--text-main)', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
                            Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name}</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '18px', margin: 0 }}>{welcome.subtitle}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 style={{ marginTop: '50px', color: 'var(--text-main)', fontSize: '20px' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    <div onClick={() => navigate('/catalogue')} className="premium-card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '32px', marginBottom: '15px' }}>🏢</div>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>Facilities Catalogue</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Browse and book university assets.</p>
                    </div>

                    <div onClick={() => navigate('/notifications')} className="premium-card" style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', position: 'relative' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span style={{ position: 'absolute', top: '14px', right: '14px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '10px' }}>
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                        <div style={{ fontSize: '32px', marginBottom: '15px' }}>🔔</div>
                        <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '18px' }}>Notifications</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>View your inbox messages.</p>
                    </div>

                    {user?.role === 'ROLE_USER' && (
                        <div onClick={() => setShowReportModal(true)} className="premium-card"
                            style={{ padding: '30px', cursor: 'pointer', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}>
                            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🚨</div>
                            <h4 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '18px' }}>Report Incident</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Report a facility issue or damage.</p>
                        </div>
                    )}

                    {user?.role === 'ROLE_ADMIN' && (
                        <>
                            <div onClick={() => navigate('/admin/bookings')} className="premium-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '30px', cursor: 'pointer' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ fontSize: '32px', marginBottom: '15px' }}>📅</div>
                                <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '18px' }}>Manage Bookings</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe' }}>Review pending requests globally.</p>
                            </div>
                            <div onClick={() => navigate('/admin/panel')} className="premium-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '30px', cursor: 'pointer' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚙️</div>
                                <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '18px' }}>Admin Panel</h4>
                                <p style={{ margin: 0, fontSize: '13px', color: '#fef3c7' }}>Manage users and resources.</p>
                            </div>
                        </>
                    )}

                    {(user?.role === 'ROLE_TECHNICIAN' || user?.role === 'ROLE_ADMIN') && (
                        <div onClick={() => navigate('/technician/desk')} className="premium-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', padding: '30px', cursor: 'pointer' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '32px', marginBottom: '15px' }}>🛠️</div>
                            <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '18px' }}>Service Desk</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#ddd6fe' }}>Resolve maintenance tickets.</p>
                        </div>
                    )}
                </div>

                {/* Recent Notifications Preview */}
                {notifications.length > 0 && (
                    <div style={{ marginTop: '50px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '20px', margin: 0 }}>🔔 Recent Notifications</h3>
                            <button onClick={() => navigate('/notifications')} style={{ padding: '8px 18px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>View All →</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {notifications.slice(0, 3).map(n => (
                                <div key={n.id} onClick={() => navigate('/notifications')} style={{
                                    background: n.read ? 'var(--glass-bg)' : 'var(--surface)',
                                    border: `1px solid ${n.read ? 'var(--border)' : 'rgba(96,165,250,0.2)'}`,
                                    borderLeft: `4px solid ${n.type === 'SUCCESS' ? '#10b981' : n.type === 'WARNING' ? '#f59e0b' : '#3b82f6'}`,
                                    borderRadius: '14px', padding: '14px 18px', cursor: 'pointer',
                                    opacity: n.read ? 0.7 : 1, transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                                }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                    <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: n.read ? '400' : '600' }}>{n.message}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── USER ONLY ── */}
                {user?.role === 'ROLE_USER' && (
                    <>
                        {/* My Bookings */}
                        <div style={{ marginTop: '50px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '20px', margin: 0 }}>📅 My Bookings</h3>
                                <button onClick={() => navigate('/catalogue')} style={{ padding: '8px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>+ New Booking</button>
                            </div>
                            {loadingBookings ? (
                                <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Loading bookings...</p>
                                </div>
                            ) : myBookings.length === 0 ? (
                                <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                                    <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>No bookings yet.</p>
                                    <button onClick={() => navigate('/catalogue')} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Browse Facilities</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {myBookings.map(b => {
                                        const s = bookingStatusStyle(b.status);
                                        return (
                                            <div key={b.id} className="premium-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🏢</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>{b.resource?.name || 'Unknown Resource'}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                                            {b.startTime ? new Date(b.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}{' → '}
                                                            {b.endTime ? new Date(b.endTime).toLocaleString([], { timeStyle: 'short' }) : '—'}
                                                        </div>
                                                        {b.purpose && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>📝 {b.purpose}</div>}
                                                    </div>
                                                </div>
                                                <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{b.status}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* My Active Incidents */}
                        <div style={{ marginTop: '50px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '20px', margin: 0 }}>🎫 My Active Incidents</h3>
                                <button onClick={() => setShowReportModal(true)} style={{ padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>+ Report Incident</button>
                            </div>
                            {myTickets.length === 0 ? (
                                <div style={{ background: 'var(--glass-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                                    <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0' }}>You have a clean slate! No issues reported.</p>
                                    <button onClick={() => setShowReportModal(true)} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Report an Issue</button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {myTickets.map(t => (
                                        <div key={t.id} className="premium-card" style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <strong style={{ color: 'var(--text-main)', fontSize: '16px' }}>{t.category?.replace('_', ' ')}</strong>
                                                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: t.status === 'RESOLVED' ? 'rgba(16,185,129,0.12)' : t.status === 'IN_PROGRESS' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)', color: t.status === 'RESOLVED' ? '#10b981' : t.status === 'IN_PROGRESS' ? '#f59e0b' : '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {t.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {t.resource?.name && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>📍 {t.resource.name}</div>}
                                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                                                {t.description?.substring(0, 80)}{t.description?.length > 80 ? '...' : ''}
                                            </p>
                                            <button onClick={() => navigate(`/ticket/${t.id}`)}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: 'var(--primary)', border: '1px solid var(--border)', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'background 0.2s' }}
                                                onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                                                onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.04)'}>
                                                Track Progress →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;