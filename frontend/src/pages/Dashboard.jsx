import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';
import { generateReport } from '../utils/reportGenerator';

const roleWelcome = {
    ROLE_ADMIN: { subtitle: "You have full access to manage campus operations, users, and resources.", icon: '🛡️' },
    ROLE_TECHNICIAN: { subtitle: "Ready to tackle today's maintenance tickets and service requests.", icon: '🔧' },
    ROLE_USER: { subtitle: "Here's what's happening with your campus operations today.", icon: '🎓' },
};

const ROLE_COLORS = {
    ROLE_ADMIN: { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.25)' },
    ROLE_TECHNICIAN: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
    ROLE_USER: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
};

const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: 'var(--text-muted)', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
};

const Modal = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            {children}
        </div>
    </div>
);

const CreateUserModal = ({ onClose, onSuccess, showToast }) => {
    const [form, setForm] = useState({ name: '', email: '', role: 'ROLE_USER', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async () => {
        if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
        if ((form.role === 'ROLE_TECHNICIAN' || form.role === 'ROLE_ADMIN') && !form.password.trim()) {
            setError('Password is required for Technician and Admin accounts.');
            return;
        }
        setLoading(true); setError('');
        try {
            await api.post('/auth/users', form);
            showToast(`User "${form.name}" created.`);
            onSuccess();
            onClose();
        }
        catch (e) { setError(e.response?.data?.message || 'Failed to create user.'); }
        finally { setLoading(false); }
    };
    const needsPassword = form.role === 'ROLE_TECHNICIAN' || form.role === 'ROLE_ADMIN';
    return (
        <Modal title="👤 Create New User" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><label style={labelStyle}>Full Name</label><input style={inputStyle} placeholder="e.g. John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label style={labelStyle}>Email Address</label><input style={inputStyle} type="email" placeholder="e.g. john@university.edu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div>
                    <label style={labelStyle}>Role</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                        <option value="ROLE_USER">User (Student / Staff)</option>
                        <option value="ROLE_TECHNICIAN">Technician</option>
                        <option value="ROLE_ADMIN">Admin</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Password</label>
                    <input style={inputStyle} type="password" placeholder={needsPassword ? 'Required' : 'Optional'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>{loading ? 'Creating...' : 'Create User'}</button>
                </div>
            </div>
        </Modal>
    );
};

const CreateResourceModal = ({ onClose, onSuccess, showToast }) => {
    const [form, setForm] = useState({ name: '', type: 'ROOM', location: '', capacity: '', description: '', status: 'ACTIVE' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async () => {
        if (!form.name.trim() || !form.location.trim() || !form.capacity) { setError('Name, location, and capacity are required.'); return; }
        setLoading(true); setError('');
        try { await api.post('/resources', { ...form, capacity: Number(form.capacity) }); showToast(`Resource "${form.name}" created.`); onSuccess(); onClose(); }
        catch (e) { setError(e.response?.data?.message || 'Failed to create resource.'); }
        finally { setLoading(false); }
    };
    return (
        <Modal title="🏢 Add New Resource" onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><label style={labelStyle}>Resource Name</label><input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div><label style={labelStyle}>Type</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option value="ROOM">Room</option><option value="LAB">Lab</option><option value="EQUIPMENT">Equipment</option><option value="SPORTS_FACILITY">Sports Facility</option></select></div>
                    <div><label style={labelStyle}>Status</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="MAINTENANCE">Maintenance</option></select></div>
                </div>
                <div><label style={labelStyle}>Location</label><input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
                <div><label style={labelStyle}>Capacity</label><input style={inputStyle} type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>{loading ? 'Creating...' : 'Add Resource'}</button>
                </div>
            </div>
        </Modal>
    );
};

const AssignTechnicianModal = ({ ticket, technicians, onClose, onSuccess, showToast }) => {
    const [selectedId, setSelectedId] = useState(ticket.technician?.id || '');
    const [loading, setLoading] = useState(false);
    const handleAssign = async () => {
        if (!selectedId) return;
        setLoading(true);
        try { await api.put(`/tickets/${ticket.id}/assign/${selectedId}`); showToast(`Ticket #${ticket.id} assigned successfully.`); onSuccess(); onClose(); }
        catch (e) { showToast('Failed to assign ticket.', 'error'); }
        finally { setLoading(false); }
    };
    return (
        <Modal title={`🔧 Assign Ticket #${ticket.id}`} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                    <label style={labelStyle}>Assign to Technician</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                        <option value="">— Select a technician —</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleAssign} disabled={loading || !selectedId} style={{ flex: 2, padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>{loading ? 'Assigning...' : 'Assign Technician'}</button>
                </div>
            </div>
        </Modal>
    );
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

    // Admin Specific State
    const [users, setUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [updatingId, setUpdatingId] = useState(null);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateResource, setShowCreateResource] = useState(false);
    const [assignTicket, setAssignTicket] = useState(null);

    const fetchAdminData = async () => {
        try {
            const [usersRes, resourcesRes, ticketsRes, bookingsRes] = await Promise.all([
                api.get('/auth/users'), 
                api.get('/resources'), 
                api.get('/tickets'), 
                api.get('/bookings')
            ]);
            setUsers(usersRes.data);
            setResources(resourcesRes.data);
            setAllTickets(ticketsRes.data);
            setAllBookings(bookingsRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (!user) return;
        api.get(`/notifications/user/${user.id}`).then(res => setNotifications(res.data)).catch(() => {});
        
        if (user.role === 'ROLE_ADMIN') {
            fetchAdminData();
        }

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

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try { 
            await api.put(`/auth/users/${userId}/role`, { role: newRole }); 
            showNotification(`Role updated to ${newRole.replace('ROLE_', '')}.`, 'success'); 
            fetchAdminData(); 
        }
        catch (e) { showNotification('Failed to update role.', 'error'); } finally { setUpdatingId(null); }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        try { await api.delete(`/auth/users/${userId}`); showNotification(`User "${userName}" deleted.`, 'success'); fetchAdminData(); }
        catch (e) { showNotification('Failed to delete user.', 'error'); }
    };

    const handleDeleteResource = async (resourceId, resourceName) => {
        if (!window.confirm(`Delete resource "${resourceName}"?`)) return;
        try { await api.delete(`/resources/${resourceId}`); showNotification(`Resource "${resourceName}" deleted.`, 'success'); fetchAdminData(); }
        catch (e) { showNotification('Failed to delete resource.', 'error'); }
    };

    const stats = {
        totalUsers: users.length,
        totalResources: resources.length,
        activeResources: resources.filter(r => r.status === 'ACTIVE').length,
        openTickets: allTickets.filter(t => t.status === 'OPEN').length,
        inProgressTickets: allTickets.filter(t => t.status === 'IN_PROGRESS').length,
        pendingBookings: allBookings.filter(b => b.status === 'PENDING').length,
    };

    const technicians = users.filter(u => u.role === 'ROLE_TECHNICIAN');
    
    const cardStyle = { background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
    const tabStyle = (tab) => ({ padding: '10px 22px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.04)', color: activeTab === tab ? 'white' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 4px 14px rgba(59,130,246,0.3)' : 'none' });


    const handleIncidentSuccess = () => {
        showNotification('Incident ticket submitted successfully!', 'success');
        api.get(`/tickets/user/${user.id}`).then(res => setMyTickets(res.data)).catch(console.error);
    };

    const welcome = roleWelcome[user?.role] || roleWelcome['ROLE_USER'];

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', padding: '40px 20px' }}>
            {showReportModal && (
                <ReportIncidentModal userId={user.id} onClose={() => setShowReportModal(false)} onSuccess={handleIncidentSuccess} />
            )}
            {showCreateUser && (
                <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={fetchAdminData} showToast={showNotification} />
            )}
            {showCreateResource && (
                <CreateResourceModal onClose={() => setShowCreateResource(false)} onSuccess={fetchAdminData} showToast={showNotification} />
            )}
            {assignTicket && (
                <AssignTechnicianModal ticket={assignTicket} technicians={technicians} onClose={() => setAssignTicket(null)} onSuccess={fetchAdminData} showToast={showNotification} />
            )}

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {user.role === 'ROLE_ADMIN' ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
                                    🛡️ Admin Command Center
                                </h1>
                                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '16px' }}>
                                    Comprehensive system management and campus oversight.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => generateReport(user, { users, resources, tickets: allTickets, bookings: allBookings }, 'ADMIN_AUDIT')} style={{ padding: '10px 20px', background: 'white', color: 'black', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📥 Download System Audit
                                </button>
                                <button onClick={fetchAdminData} style={{ padding: '10px 20px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                                    🔄 Refresh All Data
                                </button>
                            </div>
                        </div>

                        {/* Admin Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
                            <button onClick={() => setActiveTab('overview')} style={tabStyle('overview')}>Overview</button>
                            <button onClick={() => setActiveTab('users')} style={tabStyle('users')}>Users</button>
                            <button onClick={() => setActiveTab('resources')} style={tabStyle('resources')}>Resources</button>
                            <button onClick={() => setActiveTab('servicedesk')} style={tabStyle('servicedesk')}>Service Desk</button>
                            <button onClick={() => setActiveTab('tickets')} style={tabStyle('tickets')}>All Tickets</button>
                            <button onClick={() => setActiveTab('bookings')} style={tabStyle('bookings')}>All Bookings</button>
                        </div>

                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>👥</div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{stats.totalUsers}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Total Registered Users</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏢</div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{stats.activeResources}/{stats.totalResources}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Active Campus Resources</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎫</div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>{stats.openTickets}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Unassigned Open Tickets</div>
                                    </div>
                                    <div style={cardStyle}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>📅</div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>{stats.pendingBookings}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Pending Booking Requests</div>
                                    </div>
                                </div>

                                <h3 style={{ color: 'var(--text-main)', fontSize: '20px', marginBottom: '20px' }}>System Command & Quick Access</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                    {/* Primary Admin Actions */}
                                    <button onClick={() => setShowCreateUser(true)} className="premium-card" style={{ padding: '24px', border: '1px solid var(--primary)', background: 'rgba(59,130,246,0.05)', textAlign: 'left', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>👤</div>
                                        <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Add New User</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Register a student, staff, or technician.</div>
                                    </button>
                                    <button onClick={() => setShowCreateResource(true)} className="premium-card" style={{ padding: '24px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.05)', textAlign: 'left', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🏢</div>
                                        <div style={{ fontWeight: '700', color: '#10b981' }}>New Resource</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add a room, lab, or piece of equipment.</div>
                                    </button>
                                    
                                    {/* Bridge to standard tools */}
                                    <button onClick={() => navigate('/catalogue')} className="premium-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🗂️</div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Facilities Catalogue</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Browse and book as a standard user.</div>
                                    </button>
                                    <button onClick={() => navigate('/notifications')} className="premium-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer', position: 'relative' }}>
                                        {notifications.filter(n => !n.read).length > 0 && (
                                            <span style={{ position: 'absolute', top: '20px', right: '20px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '10px' }}>{notifications.filter(n => !n.read).length}</span>
                                        )}
                                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔔</div>
                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Notifications Hub</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Check your personal alerts and messages.</div>
                                    </button>
                                </div>

                                {/* Recent Notifications Preview */}
                                {notifications.length > 0 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3 style={{ color: 'var(--text-main)', fontSize: '20px', margin: 0 }}>🔔 Recent Activity</h3>
                                            <button onClick={() => navigate('/notifications')} style={{ padding: '8px 18px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>View All</button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {notifications.slice(0, 5).map(n => (
                                                <div key={n.id} onClick={() => navigate('/notifications')} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', borderRadius: '12px', padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{n.message}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>User Management</h3>
                                    <button onClick={() => setShowCreateUser(true)} style={{ padding: '10px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>+ Add User</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['User', 'System Role', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <select style={{ padding: '6px 12px', borderRadius: '8px', background: ROLE_COLORS[u.role].bg, color: ROLE_COLORS[u.role].color, border: `1px solid ${ROLE_COLORS[u.role].border}`, fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                                                            value={u.role} disabled={updatingId === u.id || u.id === user.id} onChange={e => handleRoleChange(u.id, e.target.value)}>
                                                            <option value="ROLE_USER">USER</option>
                                                            <option value="ROLE_TECHNICIAN">TECHNICIAN</option>
                                                            <option value="ROLE_ADMIN">ADMIN</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <button onClick={() => handleDeleteUser(u.id, u.name)} disabled={u.id === user.id} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '700', opacity: u.id === user.id ? 0.4 : 1 }}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* RESOURCES TAB */}
                        {activeTab === 'resources' && (
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>Campus Resources</h3>
                                    <button onClick={() => setShowCreateResource(true)} style={{ padding: '10px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>+ New Resource</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['Resource', 'Type', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {resources.map(r => (
                                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '16px' }}><div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{r.name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.location} (Cap: {r.capacity})</div></td>
                                                    <td style={{ padding: '16px' }}><span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>{r.type}</span></td>
                                                    <td style={{ padding: '16px' }}><span style={{ color: r.status === 'ACTIVE' ? '#10b981' : '#f59e0b', fontSize: '13px', fontWeight: '700' }}>{r.status}</span></td>
                                                    <td style={{ padding: '16px' }}><button onClick={() => handleDeleteResource(r.id, r.name)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Delete</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* SERVICE DESK TAB */}
                        {activeTab === 'servicedesk' && (
                            <div style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>Service Desk Oversight</h3>
                                    <div style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '4px 12px' }}>{technicians.length} Technicians Active</div>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['Incident', 'Priority', 'Assigned To', 'Action'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr></thead>
                                        <tbody>
                                            {allTickets.filter(t => t.status === 'OPEN').map(t => (
                                                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '16px' }}><div style={{ fontWeight: '700', color: 'var(--text-main)' }}>#{t.id} - {t.resource?.name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description?.substring(0, 60)}...</div></td>
                                                    <td style={{ padding: '16px' }}><span style={{ color: t.priority === 'HIGH' ? '#ef4444' : 'var(--text-muted)', fontWeight: '700' }}>{t.priority}</span></td>
                                                    <td style={{ padding: '16px' }}><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span></td>
                                                    <td style={{ padding: '16px' }}><button onClick={() => setAssignTicket(t)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>Assign</button></td>
                                                </tr>
                                            ))}
                                            {allTickets.filter(t => t.status === 'OPEN').length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>All tickets are currently assigned or resolved.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ALL TICKETS/BOOKINGS TABS (Simplified list views could be added here) */}
                        {activeTab === 'tickets' && (
                            <div style={cardStyle}>
                                <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-main)' }}>Global Incident Log</h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {allTickets.slice().reverse().slice(0, 20).map(t => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>#{t.id} - {t.resource?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.status} • Reported by User #{t.creatorId}</div>
                                            </div>
                                            <button onClick={() => navigate(`/ticket/${t.id}`)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Details</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div style={cardStyle}>
                                <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-main)' }}>Global Booking Log</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>To review and approve pending bookings, please use the <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/admin/bookings')}>Manage Bookings</span> page.</p>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {allBookings.slice().reverse().slice(0, 15).map(b => (
                                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{b.resource?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.status} • {new Date(b.startTime).toLocaleDateString()}</div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>User #{b.userId}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Hero (Standard User) */}
                        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', padding: '40px', borderRadius: '32px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden', marginBottom: '40px' }}>
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
                        <h3 style={{ marginTop: '30px', color: 'var(--text-main)', fontSize: '20px' }}>Quick Actions</h3>
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

                            {user?.role === 'ROLE_TECHNICIAN' && (
                                <div onClick={() => navigate('/technician/desk')} className="premium-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', padding: '30px', cursor: 'pointer', textAlign: 'center' }}
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

                        {/* My Bookings */}
                        {user?.role === 'ROLE_USER' && (
                            <div style={{ marginTop: '50px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ color: 'var(--text-main)', fontSize: '20px', margin: 0 }}>📅 My Bookings</h3>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => generateReport(user, { tickets: myTickets, bookings: myBookings }, 'USER_ACTIVITY')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                                            📥 Download My Activity
                                        </button>
                                        <button onClick={() => navigate('/catalogue')} style={{ padding: '8px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>+ New Booking</button>
                                    </div>
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;