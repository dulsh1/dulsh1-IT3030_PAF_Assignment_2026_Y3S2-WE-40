import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const BookResource = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [resource, setResource] = useState(null);
    const [formData, setFormData] = useState({ startTime: '', endTime: '', purpose: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/resources/${id}`).then(res => setResource(res.data)).catch(err => console.error(err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);

        if (end <= start) {
            setError('End time must be after start time.');
            return;
        }


        try {
            await api.post('/bookings', {
                userId: user.id,
                resourceId: Number(id),
                startTime: formData.startTime,
                endTime: formData.endTime,
                purpose: formData.purpose
            });
            showNotification('Booking request submitted successfully! Awaiting Admin approval.', 'success');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit booking request. Time slot may be overlapping.');
        }
    };

    if (!resource) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div className="skeleton" style={{ width: '400px', height: '300px', borderRadius: '20px' }} />
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
            <button 
                onClick={() => navigate('/catalogue')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
            >
                &larr; Back to Catalogue
            </button>

            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '40px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Resource Booking</div>
                    <h2 style={{ margin: 0, fontSize: '32px', letterSpacing: '-1px' }}>{resource.name}</h2>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
                        <span>📍 {resource.location}</span>
                        <span>👤 Cap: {resource.capacity}</span>
                        <span>🏷️ {resource.type.replace('_', ' ')}</span>
                    </div>
                </div>

                <div style={{ padding: '40px' }}>
                    {error && (
                        <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '30px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px', fontWeight: '600' }}>
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="form-grid">
                            <div>
                                <label className="form-label">Start Date & Time</label>
                                <input type="datetime-local" required value={formData.startTime} 
                                    className="premium-input"
                                    onChange={e => setFormData({...formData, startTime: e.target.value})} />
                            </div>
                            <div>
                                <label className="form-label">End Date & Time</label>
                                <input type="datetime-local" required value={formData.endTime} 
                                    className="premium-input"
                                    onChange={e => setFormData({...formData, endTime: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Purpose of Booking</label>
                            <textarea required rows="4" value={formData.purpose} 
                                className="premium-input"
                                placeholder="Please describe the nature of your event or meeting..."
                                onChange={e => setFormData({...formData, purpose: e.target.value})} />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <button type="submit" style={{ 
                                flex: 2, padding: '16px', background: 'var(--primary)', color: 'white', 
                                border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                            >
                                Confirm Booking Request
                            </button>
                            <button type="button" onClick={() => navigate('/catalogue')} style={{ 
                                flex: 1, padding: '16px', background: 'var(--surface)', color: 'var(--text-muted)', 
                                border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700' 
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookResource;
