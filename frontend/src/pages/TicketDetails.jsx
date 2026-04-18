import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const tRes = await api.get(`/tickets/${id}`);
            setTicket(tRes.data);
            const cRes = await api.get(`/tickets/${id}/comments`);
            setComments(cRes.data);
            const aRes = await api.get(`/tickets/${id}/attachments`);
            setAttachments(aRes.data);
        } catch(err) {
            showNotification('Error loading ticket details', 'error');
        }
    }, [id, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/tickets/${id}/comments`, { userId: user.id, content: newComment });
            setNewComment('');
            fetchData();
            showNotification('Comment posted', 'success');
        } catch(e) { showNotification('Failed to post comment', 'error'); }
    };

    const handleDeleteComment = async (cid) => {
        if (!window.confirm("Delete this comment permanently?")) return;
        try {
            await api.delete(`/tickets/comments/${cid}/user/${user.id}`);
            fetchData();
            showNotification('Comment deleted', 'success');
        } catch(e) { showNotification('Failed to delete comment', 'error'); }
    };

    if (!ticket) return <div style={{padding: '50px'}}>Loading...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ 
                    background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                    cursor: 'pointer', fontWeight: 'bold', marginBottom: '25px', 
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' 
                }}
            >
                &larr; Back to Details
            </button>
            
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '40px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Ticket Details</div>
                    <h2 style={{ margin: 0, fontSize: '32px', letterSpacing: '-1px' }}>#{ticket.id}: {ticket.category} Issue</h2>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
                        <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px' }}>Status: <strong>{ticket.status}</strong></span>
                        <span style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px' }}>Priority: <strong>{ticket.priority}</strong></span>
                    </div>
                </div>

                <div style={{ padding: '40px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '30px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--primary)', fontSize: '14px', textTransform: 'uppercase' }}>Description & Information</h4>
                        <p style={{ margin: '0 0 20px 0', lineHeight: 1.6, color: 'var(--text)' }}>{ticket.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>📍 Resource: <strong style={{color: 'var(--text)'}}>{ticket.resource?.name}</strong></span>
                            <span style={{ color: 'var(--text-muted)' }}>📞 Contact: <strong style={{color: 'var(--text)'}}>{ticket.contactDetails}</strong></span>
                        </div>
                    </div>

                    {ticket.resolutionNotes && (
                        <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', marginBottom: '30px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#22c55e', fontSize: '13px', textTransform: 'uppercase' }}>Resolution Notes</h4>
                            <p style={{ margin: 0, color: '#22c55e', fontWeight: '500' }}>{ticket.resolutionNotes}</p>
                        </div>
                    )}

            {user.role !== 'ROLE_USER' && (
                <div style={{
                    marginTop: '20px', padding: '25px', 
                    background: 'rgba(59, 130, 246, 0.03)', 
                    borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '20px'
                }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        🛠️ <span style={{color: 'var(--primary)'}}>Technician Control</span> • Override Status
                    </label>
                    <select value={ticket.status} className="premium-input" style={{ width: 'auto', padding: '8px 40px 8px 15px', margin: 0 }} onChange={async (e) => {
                        const newStatus = e.target.value;
                        let notes = ticket.resolutionNotes || '';
                        if (newStatus === 'REJECTED' || newStatus === 'CLOSED' || newStatus === 'RESOLVED') {
                            const res = prompt(`Enter ${newStatus.toLowerCase()} notes/reason:`, notes);
                            if (res === null) return;
                            notes = res;
                        }
                        try {
                            await api.put(`/tickets/${ticket.id}/status`, { status: newStatus, resolutionNotes: notes });
                            fetchData();
                            showNotification(`Ticket successfully marked as ${newStatus}`, 'success');
                        } catch (err) { showNotification('Status Update Failed', 'error'); }
                    }}>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="REJECTED">REJECTED</option>
                    </select>
                </div>
            )}
            
            {attachments.length > 0 && (
                <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)'}}>
                    <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text)' }}>Attachments (Evidence)</h4>
                    <div style={{
                        display: 'flex', gap: '20px', flexWrap: 'wrap', 
                        padding: '25px', background: 'rgba(255,255,255,0.01)', 
                        borderRadius: '16px', border: '1px solid var(--border)'
                    }}>
                        {attachments.map(att => (
                            <div key={att.id} style={{ 
                                position: 'relative', 
                                transition: 'transform 0.2s', 
                                cursor: 'pointer' 
                            }} 
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                <img 
                                    src={`data:${att.contentType};base64,${att.data}`} 
                                    alt="evidence" 
                                    style={{
                                        maxWidth: '220px', borderRadius: '12px', 
                                        border: '1px solid var(--border)', 
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                                    }} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                        <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', letterSpacing: '-0.5px' }}>Comments & Updates</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                            {comments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border)' }}>No comments yet.</p>
                            ) : comments.map(c => (
                                <div key={c.id} style={{ padding: '20px', background: c.user?.id === user.id ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                            <div style={{width: '32px', height: '32px', background: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold'}}>
                                                {c.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <strong>{c.user?.name || 'User'} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal', textTransform: 'uppercase', marginLeft: '5px' }}>({c.user?.role.replace('ROLE_', '')})</span></strong>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p style={{ margin: '0 0 15px 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{c.content}</p>
                                    {c.user?.id === user.id && (
                                        <button onClick={() => handleDeleteComment(c.id)} style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', opacity: 0.8 }}>
                                            &times; Delete Comment
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <textarea rows="4" required placeholder="Add a comment or update..." value={newComment} 
                                onChange={e => setNewComment(e.target.value)}
                                className="premium-input"
                                style={{ resize: 'vertical' }} />
                            <button type="submit" style={{ 
                                alignSelf: 'flex-start', padding: '12px 30px', background: 'var(--primary)', 
                                color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', 
                                fontWeight: '700', fontSize: '14px', transition: 'all 0.2s' 
                            }}>
                                Post Comment
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
