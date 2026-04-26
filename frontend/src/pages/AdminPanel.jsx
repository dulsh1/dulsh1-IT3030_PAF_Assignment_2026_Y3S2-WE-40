import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_COLORS = {
    ROLE_ADMIN: { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.25)' },
    ROLE_TECHNICIAN: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
    ROLE_USER: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
};

const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-main)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
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
                <div><label style={labelStyle}>Full Name</label><input style={inputStyle} placeholder="e.g. John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><label style={labelStyle}>Email Address</label><input style={inputStyle} type="email" placeholder="e.g. john@university.edu" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div>
                    <label style={labelStyle}>Role</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                        <option value="ROLE_USER">User (Student / Staff)</option>
                        <option value="ROLE_TECHNICIAN">Technician</option>
                        <option value="ROLE_ADMIN">Admin</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>
                        Password {needsPassword ? <span style={{ color: '#ef4444' }}>*</span> : <span style={{ color: 'var(--text-muted)', fontWeight: '400', textTransform: 'none', fontSize: '11px' }}>(optional — leave blank for Google-only login)</span>}
                    </label>
                    <input
                        style={{ ...inputStyle, borderColor: needsPassword && !form.password ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}
                        type="password"
                        placeholder={needsPassword ? 'Required — used to log in' : 'Optional — leave blank for Google login'}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = needsPassword && !form.password ? 'rgba(239,68,68,0.4)' : 'var(--border)'}
                    />
                    {needsPassword && (
                        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#f59e0b' }}>
                            ⚠️ This user will log in with email + password (not Google).
                        </p>
                    )}
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating...' : 'Create User'}</button>
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
                <div><label style={labelStyle}>Resource Name</label><input style={inputStyle} placeholder="e.g. Lecture Hall A" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div><label style={labelStyle}>Type</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option value="ROOM">Room</option><option value="LAB">Lab</option><option value="EQUIPMENT">Equipment</option><option value="SPORTS_FACILITY">Sports Facility</option><option value="AUDITORIUM">Auditorium</option><option value="CONFERENCE_ROOM">Conference Room</option></select></div>
                    <div><label style={labelStyle}>Status</label><select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="MAINTENANCE">Under Maintenance</option></select></div>
                </div>
                <div><label style={labelStyle}>Location</label><input style={inputStyle} placeholder="e.g. Block B, Floor 2" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><label style={labelStyle}>Capacity (persons)</label><input style={inputStyle} type="number" min="1" placeholder="e.g. 40" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><label style={labelStyle}>Description (optional)</label><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} placeholder="Brief description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>{loading ? 'Creating...' : 'Add Resource'}</button>
                </div>
            </div>
        </Modal>
    );
};

// ── Assign Technician Modal ────────────────────────────────────────
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
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{ticket.category?.replace('_', ' ')} — {ticket.resource?.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{ticket.description?.substring(0, 80)}...</div>
                </div>
                <div>
                    <label style={labelStyle}>Assign to Technician</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={selectedId} onChange={e => setSelectedId(e.target.value)} onFocus={e => e.target.style.borderColor = '#f59e0b'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                        <option value="">— Select a technician —</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                    </select>
                </div>
                {technicians.length === 0 && <p style={{ color: '#f59e0b', fontSize: '13px', margin: 0 }}>⚠️ No technicians yet. Create one in User Management first.</p>}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleAssign} disabled={loading || !selectedId} style={{ flex: 2, padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 14px rgba(245,158,11,0.3)', opacity: (loading || !selectedId) ? 0.6 : 1 }}>
                        {loading ? 'Assigning...' : '🔧 Assign Technician'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// ── Main AdminPanel ────────────────────────────────────────────────
const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [resources, setResources] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [toast, setToast] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateResource, setShowCreateResource] = useState(false);
    const [assignTicket, setAssignTicket] = useState(null);

    useEffect(() => { if (user && user.role !== 'ROLE_ADMIN') navigate('/dashboard'); }, [user, navigate]);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    const fetchAll = async () => {
        try {
            const [usersRes, resourcesRes, ticketsRes, bookingsRes] = await Promise.all([api.get('/auth/users'), api.get('/resources'), api.get('/tickets'), api.get('/bookings')]);
            setUsers(usersRes.data); setResources(resourcesRes.data); setTickets(ticketsRes.data); setBookings(bookingsRes.data);
        } catch (e) { console.error(e); } finally { setLoadingUsers(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const technicians = users.filter(u => u.role === 'ROLE_TECHNICIAN');

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try { await api.put(`/auth/users/${userId}/role`, { role: newRole }); showToast(`Role updated to ${newRole.replace('ROLE_', '')}.`); fetchAll(); }
        catch (e) { showToast('Failed to update role.', 'error'); } finally { setUpdatingId(null); }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        try { await api.delete(`/auth/users/${userId}`); showToast(`User "${userName}" deleted.`); fetchAll(); }
        catch (e) { showToast('Failed to delete user.', 'error'); }
    };

    const handleDeleteResource = async (resourceId, resourceName) => {
        if (!window.confirm(`Delete resource "${resourceName}"?`)) return;
        try { await api.delete(`/resources/${resourceId}`); showToast(`Resource "${resourceName}" deleted.`); fetchAll(); }
        catch (e) { showToast('Failed to delete resource.', 'error'); }
    };

    const stats = {
        totalUsers: users.length,
        totalResources: resources.length,
        activeResources: resources.filter(r => r.status === 'ACTIVE').length,
        openTickets: tickets.filter(t => t.status === 'OPEN').length,
        inProgressTickets: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
        approvedBookings: bookings.filter(b => b.status === 'APPROVED').length,
    };

    const cardStyle = { background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
    const tabStyle = (tab) => ({ padding: '10px 22px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', transition: 'all 0.2s', background: activeTab === tab ? 'var(--primary)' : 'rgba(255,255,255,0.04)', color: activeTab === tab ? 'white' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 4px 14px rgba(59,130,246,0.3)' : 'none' });
    const btnPrimary = (color = 'var(--primary)', shadow = 'rgba(59,130,246,0.3)') => ({ padding: '10px 20px', background: color, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: `0 4px 14px ${shadow}`, transition: 'all 0.2s' });

    return (
        <div style={{ padding: '40px 30px', maxWidth: '1100px', margin: '0 auto', minHeight: 'calc(100vh - 100px)' }}>
            {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={fetchAll} showToast={showToast} />}
            {showCreateResource && <CreateResourceModal onClose={() => setShowCreateResource(false)} onSuccess={fetchAll} showToast={showToast} />}
            {assignTicket && <AssignTechnicianModal ticket={assignTicket} technicians={technicians} onClose={() => setAssignTicket(null)} onSuccess={fetchAll} showToast={showToast} />}

            {toast && (
                <div style={{ position: 'fixed', top: '100px', right: '30px', zIndex: 9999, background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}

            <div style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '34px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px' }}>⚙️ Admin Control Panel</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>Manage users, monitor activity, and oversee campus operations.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '36px' }}>
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3b82f6' },
                    { label: 'Active Resources', value: `${stats.activeResources}/${stats.totalResources}`, icon: '🏢', color: '#10b981' },
                    { label: 'Open Tickets', value: stats.openTickets, icon: '🎫', color: '#ef4444' },
                    { label: 'In Progress', value: stats.inProgressTickets, icon: '🔧', color: '#f59e0b' },
                    { label: 'Pending Bookings', value: stats.pendingBookings, icon: '📅', color: '#8b5cf6' },
                    { label: 'Approved Bookings', value: stats.approvedBookings, icon: '✅', color: '#10b981' },
                ].map(stat => (
                    <div key={stat.label} style={{ ...cardStyle, padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '26px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users</button>
                <button style={tabStyle('resources')} onClick={() => setActiveTab('resources')}>🏢 Resources</button>
                <button style={tabStyle('servicedesk')} onClick={() => setActiveTab('servicedesk')}>🔧 Service Desk</button>
                <button style={tabStyle('tickets')} onClick={() => setActiveTab('tickets')}>🎫 All Tickets</button>
                <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>📅 Bookings</button>
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-main)' }}>👥 User Role Distribution</h3>
                        {['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TECHNICIAN'].map(role => {
                            const count = users.filter(u => u.role === role).length;
                            const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                            const rc = ROLE_COLORS[role];
                            return (
                                <div key={role} style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: rc.color }}>{role.replace('ROLE_', '')}</span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: rc.color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={cardStyle}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-main)' }}>🎫 Ticket Status Breakdown</h3>
                        {[{ status: 'OPEN', color: '#ef4444' }, { status: 'IN_PROGRESS', color: '#f59e0b' }, { status: 'RESOLVED', color: '#10b981' }, { status: 'CLOSED', color: '#6b7280' }, { status: 'REJECTED', color: '#94a3b8' }].map(({ status, color }) => {
                            const count = tickets.filter(t => t.status === status).length;
                            const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                            return (
                                <div key={status} style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', color }}>{status.replace('_', ' ')}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{count}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-main)' }}>⚡ Quick Actions</h3>
                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            {[
                                { label: '+ Add Resource', action: () => setShowCreateResource(true), color: 'var(--primary)', shadow: 'rgba(59,130,246,0.3)' },
                                { label: '+ Create User', action: () => setShowCreateUser(true), color: '#10b981', shadow: 'rgba(16,185,129,0.3)' },
                                { label: '🔧 Service Desk', action: () => setActiveTab('servicedesk'), color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
                                { label: '📅 Manage Bookings', action: () => navigate('/admin/bookings'), color: '#8b5cf6', shadow: 'rgba(139,92,246,0.3)' },
                            ].map(btn => (
                                <button key={btn.label} onClick={btn.action} style={{ padding: '12px 22px', background: btn.color, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: `0 6px 16px ${btn.shadow}`, transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>{btn.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>👥 Registered Users ({users.length})</h3>
                        <button onClick={() => setShowCreateUser(true)} style={btnPrimary()}>+ Create User</button>
                    </div>
                    {loadingUsers ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</p> : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['#', 'Name', 'Email', 'Role', 'Change Role', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {users.map((u, idx) => {
                                        const rc = ROLE_COLORS[u.role] || ROLE_COLORS.ROLE_USER;
                                        return (
                                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                                                <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '32px', height: '32px', borderRadius: '10px', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: rc.color, fontSize: '14px' }}>{u.name.charAt(0)}</div>{u.name}</div></td>
                                                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{u.email}</td>
                                                <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, textTransform: 'uppercase' }}>{u.role.replace('ROLE_', '')}</span></td>
                                                <td style={{ padding: '14px 16px' }}>{u.id !== user?.id ? <select value={u.role} disabled={updatingId === u.id} onChange={e => handleRoleChange(u.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '12px', cursor: 'pointer' }}><option value="ROLE_USER">USER</option><option value="ROLE_ADMIN">ADMIN</option><option value="ROLE_TECHNICIAN">TECHNICIAN</option></select> : <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>You</span>}</td>
                                                <td style={{ padding: '14px 16px' }}>{u.id !== user?.id ? <button onClick={() => handleDeleteUser(u.id, u.name)} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>Delete</button> : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* RESOURCES */}
            {activeTab === 'resources' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>🏢 All Resources ({resources.length})</h3>
                        <button onClick={() => setShowCreateResource(true)} style={btnPrimary()}>+ Add Resource</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                        {resources.map(r => (
                            <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{r.type?.replace('_', ' ')}</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '800', background: r.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: r.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>{r.status}</span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>{r.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {r.location}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>👥 Capacity: {r.capacity} pax</div>
                                <div style={{ marginTop: '14px' }}>
                                    <button onClick={() => handleDeleteResource(r.id, r.name)} style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>🗑️ Delete</button>
                                </div>
                            </div>
                        ))}
                        {resources.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}><div style={{ fontSize: '40px', marginBottom: '12px' }}>🏢</div><p style={{ color: 'var(--text-muted)', margin: '0 0 20px 0' }}>No resources yet.</p><button onClick={() => setShowCreateResource(true)} style={btnPrimary()}>+ Add First Resource</button></div>}
                    </div>
                </div>
            )}

            {/* SERVICE DESK — Admin assigns tickets to technicians */}
            {activeTab === 'servicedesk' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>🔧 Service Desk — Assign Tickets</h3>
                        <div style={{ fontSize: '13px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '6px 14px' }}>
                            👷 {technicians.length} technician{technicians.length !== 1 ? 's' : ''} available
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 24px 0' }}>
                        Assign open tickets to available technicians. Technicians claim and resolve them from their own dashboard.
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Incident', 'Priority', 'Status', 'Assigned To', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').slice().reverse().map(t => {
                                    const statusColors = { OPEN: '#ef4444', IN_PROGRESS: '#f59e0b', REJECTED: '#94a3b8' };
                                    const priorityColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
                                    return (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>#{t.id}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{t.resource?.name || '—'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.category?.replace('_', ' ')} — {t.description?.substring(0, 40)}...</div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}><span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: priorityColors[t.priority] || '#94a3b8', background: `${priorityColors[t.priority] || '#94a3b8'}18` }}>{t.priority}</span></td>
                                            <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: statusColors[t.status] || '#94a3b8', background: `${statusColors[t.status] || '#94a3b8'}18` }}>{t.status?.replace('_', ' ')}</span></td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {t.technician ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>{t.technician.name?.charAt(0)}</div>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{t.technician.name}</span>
                                                    </div>
                                                ) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '13px' }}>Unassigned</span>}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <button onClick={() => setAssignTicket(t)}
                                                    style={{ padding: '7px 16px', background: t.technician ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: t.technician ? '#f59e0b' : 'var(--primary)', border: `1px solid ${t.technician ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                                                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                                                    {t.technician ? '🔄 Reassign' : '+ Assign'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>✨ No open tickets right now.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ALL TICKETS */}
            {activeTab === 'tickets' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>🎫 All Tickets ({tickets.length})</h3>
                        <div style={{ fontSize: '13px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '6px 14px' }}>
                            👷 {technicians.length} technician{technicians.length !== 1 ? 's' : ''} available
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Category', 'Priority', 'Status', 'Resource', 'Assigned To', 'Action'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.slice().reverse().map(t => {
                                    const sc = { OPEN: '#ef4444', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#6b7280', REJECTED: '#94a3b8' };
                                    const pc = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
                                    return (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => navigate(`/ticket/${t.id}`)}>#{t.id}</td>
                                            <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => navigate(`/ticket/${t.id}`)}>{t.category?.replace('_', ' ')}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', color: pc[t.priority] || '#94a3b8', background: `${pc[t.priority] || '#94a3b8'}18` }}>{t.priority}</span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: sc[t.status], background: `${sc[t.status]}18` }}>{t.status?.replace('_', ' ')}</span>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{t.resource?.name || '—'}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {t.technician ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#f59e0b', flexShrink: 0 }}>
                                                            {t.technician.name?.charAt(0)}
                                                        </div>
                                                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{t.technician.name}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                                                    <button
                                                        onClick={() => setAssignTicket(t)}
                                                        style={{
                                                            padding: '7px 14px',
                                                            background: t.technician ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                                                            color: t.technician ? '#f59e0b' : 'var(--primary)',
                                                            border: `1px solid ${t.technician ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                                                            borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px',
                                                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
                                                        onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                                                        {t.technician ? '🔄 Reassign' : '+ Assign'}
                                                    </button>
                                                )}
                                                {(t.status === 'RESOLVED' || t.status === 'CLOSED') && (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {tickets.length === 0 && <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No tickets yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* BOOKINGS */}
            {activeTab === 'bookings' && (
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>📅 All Bookings ({bookings.length})</h3>
                        <button onClick={() => navigate('/admin/bookings')} style={btnPrimary('#8b5cf6', 'rgba(139,92,246,0.3)')}>Approve / Reject →</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>{['#', 'Resource', 'Purpose', 'Start', 'End', 'Status'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>)}</tr></thead>
                            <tbody>
                                {bookings.slice().reverse().map(b => {
                                    const sc = { PENDING: '#f59e0b', APPROVED: '#10b981', REJECTED: '#ef4444', CANCELLED: '#94a3b8' };
                                    return (
                                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>#{b.id}</td>
                                            <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-main)' }}>{b.resource?.name || '—'}</td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.purpose}</td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{b.startTime ? new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{b.endTime ? new Date(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                                            <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: sc[b.status], background: `${sc[b.status]}18` }}>{b.status}</span></td>
                                        </tr>
                                    );
                                })}
                                {bookings.length === 0 && <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;