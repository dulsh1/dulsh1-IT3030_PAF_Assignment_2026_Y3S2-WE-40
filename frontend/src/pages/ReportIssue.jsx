import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const ReportIssue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);
    const [resource, setResource] = useState(null);
    const [formData, setFormData] = useState({ category: 'IT_EQUIPMENT', priority: 'MEDIUM', description: '', contactDetails: '' });
    const [files, setFiles] = useState([]);
    const [contactError, setContactError] = useState('');

    // Sanitization function for phone numbers - only 10 digits
    const sanitizePhoneNumber = (input) => {
        const digitsOnly = input.replace(/\D/g, '');
        return digitsOnly.slice(0, 10);
    };

    // Sanitization function for email
    const sanitizeEmail = (input) => {
        return input.trim().toLowerCase();
    };

    // Validation function for contact details
    const validateContactDetails = (contact) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        
        if (emailRegex.test(contact)) {
            return { isValid: true, type: 'email' };
        } else if (phoneRegex.test(contact)) {
            return { isValid: true, type: 'phone' };
        } else if (contact.length === 0) {
            return { isValid: false, error: 'Contact details are required' };
        } else if (/^\d+$/.test(contact) && contact.length < 10) {
            return { isValid: false, error: `Phone number must be 10 digits (${contact.length}/10)` };
        } else if (/^\d+$/.test(contact) && contact.length > 10) {
            return { isValid: false, error: 'Phone number cannot exceed 10 digits' };
        } else {
            return { isValid: false, error: 'Enter a valid email (user@domain.com) or 10-digit phone number' };
        }
    };

    // Handle contact details change with sanitization
    const handleContactDetailsChange = (e) => {
        let value = e.target.value;
        
        // If input contains only digits, sanitize as phone number
        if (/^\d*$/.test(value)) {
            value = sanitizePhoneNumber(value);
        } else if (value.includes('@')) {
            // If input contains @, sanitize as email
            value = sanitizeEmail(value);
        }
        
        setFormData({...formData, contactDetails: value});
        
        // Validate and show error message
        const validation = validateContactDetails(value);
        if (!validation.isValid) {
            setContactError(validation.error);
        } else {
            setContactError('');
        }
    };

    useEffect(() => {
        api.get(`/resources/${id}`).then(res => setResource(res.data)).catch(err => console.error(err));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description.trim()) {
            showNotification('Please fill in the description field.', 'error');
            return;
        }
        
        // Validate contact details before submission
        const validation = validateContactDetails(formData.contactDetails);
        if (!validation.isValid) {
            showNotification(`Invalid contact details: ${validation.error}`, 'error');
            return;
        }
        
        try {
            if (files.length > 3) {
                showNotification('Maximum 3 attachments allowed.', 'error');
                return;
            }

            const res = await api.post('/tickets', {
                creatorId: user.id,
                resourceId: Number(id),
                category: formData.category,
                priority: formData.priority,
                description: formData.description,
                contactDetails: formData.contactDetails
            });
            const ticketId = res.data.id;

            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                await api.post(`/tickets/${ticketId}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            }

            showNotification('Incident Ticket and attachments submitted successfully!', 'success');
            navigate('/dashboard');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to submit ticket.', 'error');
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
                <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '40px', color: 'white' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Incident Reporting</div>
                    <h2 style={{ margin: 0, fontSize: '32px', letterSpacing: '-1px' }}>{resource.name}</h2>
                    <p style={{ margin: '15px 0 0 0', opacity: 0.9, fontSize: '14px', lineHeight: '1.5' }}>
                        Help us keep the campus running smoothly by reporting any damages or issues with this resource.
                    </p>
                </div>

                <div style={{ padding: '40px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="form-grid">
                            <div>
                                <label className="form-label">Issue Category</label>
                                <select value={formData.category} className="premium-input" 
                                        onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="IT_EQUIPMENT">IT / Technology</option>
                                    <option value="FURNITURE">Furniture / Hardware</option>
                                    <option value="PLUMBING">Plumbing / Leaks</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Priority Severity</label>
                                <select value={formData.priority} className="premium-input"
                                        onChange={e => setFormData({...formData, priority: e.target.value})}>
                                    <option value="LOW">Low (Not urgent)</option>
                                    <option value="MEDIUM">Medium (Affects usage)</option>
                                    <option value="HIGH">High (Critical emergency)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Detailed Description</label>
                            <textarea required rows="4" value={formData.description} className="premium-input"
                                      placeholder="Please describe exactly what is broken or malfunctioning..."
                                      onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>

                        <div>
                            <label className="form-label">Preferred Contact Details</label>
                            <input required type="text" value={formData.contactDetails} className="premium-input"
                                   placeholder="e.g. john@university.edu or 0771234567"
                                   onChange={handleContactDetailsChange}
                                   style={{
                                       borderColor: contactError ? '#ef4444' : 'var(--border)',
                                       borderWidth: contactError ? '2px' : '1px'
                                   }} />
                            {contactError && (
                                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '500' }}>
                                    ⚠️ {contactError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="form-label">Evidence Attachments (Optional, max 3)</label>
                            <div style={{ 
                                position: 'relative', border: '2px dashed var(--border)', padding: '20px', 
                                borderRadius: '16px', textAlign: 'center', transition: 'all 0.2s',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))}
                                       style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                                    {files.length > 0 ? (
                                        <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{files.length} file(s) selected</span>
                                    ) : (
                                        'Click or drag images here to upload'
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button type="submit" style={{ 
                                flex: 2, padding: '16px', background: '#ef4444', color: 'white', 
                                border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '16px', 
                                fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                            >
                                Submit Incident Ticket
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

export default ReportIssue;
