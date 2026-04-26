import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { generateReport } from '../utils/reportGenerator';

const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: 'var(--text-muted)', marginBottom: '6px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-main)', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
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

// ── Assign Technician Modal ────────────────────────────────────────
const AssignTechnicianModal = ({ ticket, technicians, onClose, onSuccess, showNotification }) => {
    const [selectedId, setSelectedId] = useState(ticket.technician?.id || '');
    const [loading, setLoading] = useState(false);
    const handleAssign = async () => {
        if (!selectedId) return;
        setLoading(true);
        try { 
            await api.put(`/tickets/${ticket.id}/assign/${selectedId}`); 
            showNotification(`Ticket #${ticket.id} assigned successfully.`, 'success'); 
            onSuccess(); 
            onClose(); 
        }
        catch (e) { showNotification('Failed to assign ticket.', 'error'); }
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
                {technicians.length === 0 && <p style={{ color: '#f59e0b', fontSize: '13px', margin: 0 }}>⚠️ No technicians found in the system.</p>}
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

// ── Resolve Modal ─────────────────────────────────────────────────
const ResolveModal = ({ ticket, onClose, onSuccess, showNotification }) => {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResolve = async () => {
        if (!notes.trim()) return;
        setLoading(true);
        try {
            await api.put(`/tickets/${ticket.id}/status`, { status: 'RESOLVED', resolutionNotes: notes });
            showNotification('Ticket marked as resolved!', 'success');
            onSuccess();
            onClose();
        } catch (err) {
            showNotification('Failed to resolve ticket.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>✅ Resolve Ticket #{ticket.id}</h2>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{ticket.resource?.name} — {ticket.category?.replace('_', ' ')}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>{ticket.description?.substring(0, 100)}...</div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>Resolution Notes *</label>
                    <textarea
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box' }}
                        placeholder="Describe what was done to fix the issue (e.g. Replaced projector bulb, cleared drain blockage)..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        onFocus={e => e.target.style.borderColor = '#10b981'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>Cancel</button>
                    <button onClick={handleResolve} disabled={loading || !notes.trim()} style={{ flex: 2, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', opacity: (loading || !notes.trim()) ? 0.6 : 1 }}>
                        {loading ? 'Resolving...' : '✅ Mark as Resolved'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Technician Dashboard ──────────────────────────────────────────
const TechnicianDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);

    const [allTickets, setAllTickets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('mine');
    const [resolveTicket, setResolveTicket] = useState(null);
    const [assignTicket, setAssignTicket] = useState(null);

    const fetchTickets = () => {
        setLoading(true);
        api.get('/tickets')
            .then(res => setAllTickets(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { 
        fetchTickets(); 
        if (user?.role === 'ROLE_ADMIN') {
            api.get('/auth/users').then(res => {
                setTechnicians(res.data.filter(u => u.role === 'ROLE_TECHNICIAN'));
            }).catch(err => console.error("Failed to fetch technicians", err));
        }
    }, [user]);

    const claimTicket = async (ticketId) => {
        try {
            await api.put(`/tickets/${ticketId}/assign/${user.id}`);
            fetchTickets();
            showNotification('Ticket claimed! It\'s now in your queue.', 'success');
        } catch (err) { showNotification('Failed to claim ticket.', 'error'); }
    };

    // Tickets assigned to me
    const myTickets = allTickets.filter(t => t.technician?.id === user?.id);
    const openPool = allTickets.filter(t => t.status === 'OPEN');

    const myOpen = myTickets.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;
    const myResolved = myTickets.filter(t => t.status === 'RESOLVED').length;
    const totalOpen = allTickets.filter(t => t.status === 'OPEN').length;

    const statCard = (label, value, color, accent) => (
        <div style={{ flex: 1, minWidth: '160px', background: 'var(--surface)', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: accent }} />
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color, marginTop: '8px' }}>{value}</div>
        </div>
    );

    const tabStyle = (tab) => ({
        padding: '10px 22px', border: 'none', borderRadius: '10px', cursor: 'pointer',
        fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
        background: activeTab === tab ? '#f59e0b' : 'rgba(255,255,255,0.04)',
        color: activeTab === tab ? 'white' : 'var(--text-muted)',
        boxShadow: activeTab === tab ? '0 4px 14px rgba(245,158,11,0.3)' : 'none',
    });

    const priorityColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#10b981' };
    const statusColors = { OPEN: '#ef4444', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#6b7280' };

    const TicketRow = ({ t, showClaim }) => (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>#{t.id}</td>
            <td style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{t.resource?.name || '—'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{t.category?.replace('_', ' ')} — {t.description?.substring(0, 45)}...</div>
            </td>
            <td style={{ padding: '16px 20px' }}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: priorityColors[t.priority] || '#94a3b8', background: `${priorityColors[t.priority] || '#94a3b8'}18` }}>{t.priority}</span>
            </td>
            <td style={{ padding: '16px 20px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', color: statusColors[t.status] || '#94a3b8', background: `${statusColors[t.status] || '#94a3b8'}18` }}>{t.status?.replace('_', ' ')}</span>
            </td>
            <td style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/ticket/${t.id}`)}
                        style={{ padding: '6px 14px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        Details
                    </button>
                    {showClaim && t.status === 'OPEN' && (
                        <button onClick={() => claimTicket(t.id)}
                            style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                            Claim
                        </button>
                    )}
                    {user?.role === 'ROLE_ADMIN' && (t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                        <button onClick={() => setAssignTicket(t)}
                            style={{ padding: '6px 14px', background: t.technician ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', boxShadow: '0 2px 8px rgba(245,158,11,0.2)' }}>
                            {t.technician ? 'Reassign' : 'Assign'}
                        </button>
                    )}
                    {!showClaim && t.status === 'IN_PROGRESS' && (t.technician?.id === user?.id) && (
                        <button onClick={() => setResolveTicket(t)}
                            style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                            Resolve
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    const tableHeader = (
        <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Incident', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                ))}
            </tr>
        </thead>
    );

    const cardStyle = { background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };


    if (user?.role === 'ROLE_ADMIN') {
        return (
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
                {assignTicket && (
                    <AssignTechnicianModal 
                        ticket={assignTicket} 
                        technicians={technicians} 
                        onClose={() => setAssignTicket(null)} 
                        onSuccess={fetchTickets} 
                        showNotification={showNotification} 
                    />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
                            🔧 Service Desk
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
                            Administrative Oversight & Ticket Assignment
                        </p>
                    </div>
                    <button onClick={fetchTickets} style={{ padding: '10px 20px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                        🔄 Refresh List
                    </button>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>🎫 Tickets Requiring Attention</h3>
                        <div style={{ fontSize: '13px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '6px 14px' }}>
                            👷 {technicians.length} technician{technicians.length !== 1 ? 's' : ''} available
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 24px 0' }}>
                        Assign open incidents to technicians. They will receive a notification and can start work immediately.
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
                                {allTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').slice().reverse().map(t => {
                                    const statusColors = { OPEN: '#ef4444', IN_PROGRESS: '#f59e0b', REJECTED: '#94a3b8' };
                                    return (
                                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>#{t.id}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{t.resource?.name || '—'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.category?.replace('_', ' ')} — {t.description?.substring(0, 45)}...</div>
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
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => navigate(`/ticket/${t.id}`)}
                                                        style={{ padding: '7px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                                                        View
                                                    </button>
                                                    <button onClick={() => setAssignTicket(t)}
                                                        style={{ padding: '7px 16px', background: t.technician ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: t.technician ? '#f59e0b' : 'var(--primary)', border: `1px solid ${t.technician ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                                                        {t.technician ? 'Reassign' : 'Assign'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {allTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length === 0 && (
                                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>✨ All tickets are currently resolved. Good job!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>

            {resolveTicket && (
                <ResolveModal ticket={resolveTicket} onClose={() => setResolveTicket(null)} onSuccess={fetchTickets} showNotification={showNotification} />
            )}

            {assignTicket && (
                <AssignTechnicianModal 
                    ticket={assignTicket} 
                    technicians={technicians} 
                    onClose={() => setAssignTicket(null)} 
                    onSuccess={fetchTickets} 
                    showNotification={showNotification} 
                />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
                        🔧 Technician Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
                        Welcome back, <span style={{ color: '#f59e0b', fontWeight: '700' }}>{user?.name}</span>. Here's your work queue.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => generateReport(user, { tickets: myTickets }, 'TECH_PERFORMANCE')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📥 Download Task Report
                    </button>
                    <button onClick={fetchTickets} style={{ padding: '10px 20px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(245,158,11,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '36px' }}>
                {statCard('My Active', myOpen, 'var(--text-main)', '#f59e0b')}
                {statCard('My Resolved', myResolved, '#10b981', '#10b981')}
                {statCard('Pool (Open)', totalOpen, '#ef4444', '#ef4444')}
                {statCard('Total Assigned', myTickets.length, 'var(--primary)', 'var(--primary)')}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button style={tabStyle('mine')} onClick={() => setActiveTab('mine')}>🗂️ My Queue ({myTickets.filter(t => t.status !== 'RESOLVED').length})</button>
                <button style={tabStyle('pool')} onClick={() => setActiveTab('pool')}>📥 Open Pool ({openPool.length})</button>
                <button style={tabStyle('history')} onClick={() => setActiveTab('history')}>✅ My History ({myResolved})</button>
            </div>

            {/* My Queue — tickets assigned to me, not yet resolved */}
            {activeTab === 'mine' && (
                <div className="premium-card">
                    <div style={{ padding: '20px 24px 0', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>🗂️ My Active Queue</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 0 0' }}>Tickets assigned to you. Claim from the Open Pool to add more.</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            {tableHeader}
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}><td colSpan={5} style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '100%', height: '20px' }} /></td></tr>
                                    ))
                                ) : myTickets.filter(t => t.status !== 'RESOLVED').map(t => (
                                    <TicketRow key={t.id} t={t} showClaim={false} />
                                ))}
                                {!loading && myTickets.filter(t => t.status !== 'RESOLVED').length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
                                        <div>Your queue is empty! Check the Open Pool to claim new tickets.</div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Open Pool — unassigned tickets anyone can claim */}
            {activeTab === 'pool' && (
                <div className="premium-card">
                    <div style={{ padding: '20px 24px 0', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>📥 Open Ticket Pool</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 0 0' }}>Unassigned tickets available to claim. Click Claim to add one to your queue.</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            {tableHeader}
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <tr key={i}><td colSpan={5} style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '100%', height: '20px' }} /></td></tr>
                                    ))
                                ) : openPool.map(t => (
                                    <TicketRow key={t.id} t={t} showClaim={true} />
                                ))}
                                {!loading && openPool.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '36px', marginBottom: '12px' }}>✨</div>
                                        <div>No open tickets in the pool right now. All clear!</div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* My History — resolved tickets */}
            {activeTab === 'history' && (
                <div className="premium-card">
                    <div style={{ padding: '20px 24px 0', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>✅ My Resolved Tickets</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '6px 0 0 0' }}>Your resolution history.</p>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            {tableHeader}
                            <tbody>
                                {myTickets.filter(t => t.status === 'RESOLVED').map(t => (
                                    <TicketRow key={t.id} t={t} showClaim={false} />
                                ))}
                                {myTickets.filter(t => t.status === 'RESOLVED').length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>No resolved tickets yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianDashboard;