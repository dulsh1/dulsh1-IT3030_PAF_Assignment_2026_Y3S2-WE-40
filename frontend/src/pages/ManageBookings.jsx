import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { NotificationContext } from '../context/NotificationContext';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useContext(NotificationContext);
    
    const fetchBookings = () => {
        setLoading(true);
        api.get('/bookings').then(res => {
            // Artificial delay to show premium skeleton loaders for 3 seconds
            setTimeout(() => {
                setBookings(res.data);
                setLoading(false);
            }, 3000);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id, newStatus, reason = null) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus, rejectionReason: reason });
            fetchBookings(); // Refresh grid
            showNotification(`Booking successfully marked as ${newStatus}`, 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to update booking status due to conflicts.', 'error');
        }
    };

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
    const approvedCount = bookings.filter(b => b.status === 'APPROVED').length;
    const rejectedCount = bookings.filter(b => b.status === 'REJECTED').length;

    const cardStyle = {
        flex: 1, minWidth: '200px', background: 'var(--surface)', padding: '25px', borderRadius: '24px',
        boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden'
    };
    
    const metricStyle = { fontSize: '36px', fontWeight: '800', margin: '10px 0 0 0', color: 'var(--text-main)' };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 70px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Manage Bookings</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Oversee and approve facility reservations securely.</p>
                </div>
                <div style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '30px', fontSize: '14px', fontWeight: '600' }}>
                    Total Logs: {bookings.length}
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#3b82f6' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Requests</span>
                    <h3 style={metricStyle}>{pendingCount}</h3>
                </div>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Approved</span>
                    <h3 style={metricStyle}>{approvedCount}</h3>
                </div>
                <div style={cardStyle}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }} />
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Rejected</span>
                    <h3 style={metricStyle}>{rejectedCount}</h3>
                </div>
            </div>
            
            <div className="premium-card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resource</th>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requester</th>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schedule</th>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                <th style={{ padding: '18px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '40px', height: '16px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="skeleton" style={{ width: '120px', height: '18px', marginBottom: '8px' }}></div>
                                            <div className="skeleton" style={{ width: '150px', height: '14px' }}></div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '160px', height: '16px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="skeleton" style={{ width: '140px', height: '14px', marginBottom: '8px' }}></div>
                                            <div className="skeleton" style={{ width: '140px', height: '14px' }}></div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}><div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div></td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }}></div>
                                                <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : bookings.map(b => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--surface)' } }}>
                                    <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>#{b.id}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px' }}>{b.resource.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{b.purpose.substring(0, 30)}...</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{b.user.email}</td>
                                    <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                            <span style={{display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', background:'#10b981'}}></span>
                                            {new Date(b.startTime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                        <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'4px'}}>
                                            <span style={{display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444'}}></span>
                                            {new Date(b.endTime).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{
                                            fontWeight: '700', fontSize: '11px', padding: '6px 12px', borderRadius: '30px', letterSpacing: '0.5px',
                                            backgroundColor: b.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : b.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: b.status === 'APPROVED' ? '#10b981' : b.status === 'REJECTED' ? '#ef4444' : '#f59e0b',
                                            border: `1px solid ${b.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : b.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                        }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        {b.status === 'PENDING' ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => updateStatus(b.id, 'APPROVED')} 
                                                    style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)', transition: 'transform 0.1s' }}
                                                    onMouseOver={e => e.target.style.transform = 'scale(1.05)'} onMouseOut={e => e.target.style.transform = 'scale(1)'}>
                                                    Approve
                                                </button>
                                                <button onClick={() => {
                                                    const reason = prompt('Provide rejection reason:');
                                                    if(reason) updateStatus(b.id, 'REJECTED', reason);
                                                }} 
                                                    style={{ background: 'white', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' }}
                                                    onMouseOver={e => { e.target.style.background = '#fef2f2'; }} onMouseOut={e => { e.target.style.background = 'white'; }}>
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && bookings.length === 0 && (
                    <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
                        <div style={{fontSize: '48px', marginBottom: '15px'}}>📋</div>
                        <p style={{fontSize: '16px', fontWeight: '500'}}>No bookings found in the system yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageBookings;
