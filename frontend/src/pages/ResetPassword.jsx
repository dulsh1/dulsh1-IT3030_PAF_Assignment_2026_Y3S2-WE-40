import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';

const isStrongPassword = (pw) => pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);

const passwordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (!isStrongPassword(pw)) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) return { label: 'Strong', color: '#10b981', width: '100%' };
    if (pw.length >= 10) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Okay', color: '#f59e0b', width: '55%' };
};

const EyeIcon = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {visible ? (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        ) : (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </>
        )}
    </svg>
);

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    // If no token in URL, mark invalid immediately
    useEffect(() => {
        if (!token) setTokenValid(false);
    }, [token]);

    const validateField = (field, value) => {
        if (field === 'password') {
            if (!value) return 'Password is required.';
            if (value.length < 8) return `${8 - value.length} more character${8 - value.length === 1 ? '' : 's'} needed.`;
            if (!/[a-zA-Z]/.test(value)) return 'Add at least one letter.';
            if (!/[0-9]/.test(value)) return 'Add at least one number.';
            return '';
        }
        if (field === 'confirm') {
            if (!value) return 'Please confirm your password.';
            if (value !== form.password) return 'Passwords do not match.';
            return '';
        }
        return null;
    };

    const handleChange = (field, value) => {
        setForm(p => ({ ...p, [field]: value }));
        if (touched[field]) {
            setFieldErrors(p => ({ ...p, [field]: validateField(field, value) }));
        }
        // Re-validate confirm when password changes
        if (field === 'password' && touched.confirm) {
            setFieldErrors(p => ({ ...p, confirm: form.confirm !== value ? 'Passwords do not match.' : '' }));
        }
    };

    const handleBlur = (field) => {
        setTouched(p => ({ ...p, [field]: true }));
        setFieldErrors(p => ({ ...p, [field]: validateField(field, form[field]) }));
    };

    const handleSubmit = async () => {
        setTouched({ password: true, confirm: true });
        const errors = {
            password: validateField('password', form.password),
            confirm: validateField('confirm', form.confirm),
        };
        setFieldErrors(errors);
        if (errors.password || errors.confirm) return;

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { token, newPassword: form.password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (e) {
            const status = e.response?.status;
            if (status === 400 || status === 410) {
                setTokenValid(false);
            } else {
                setError(e.response?.data?.message || 'Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const strength = passwordStrength(form.password);

    const inputStyle = (field) => ({
        width: '100%', padding: '13px 16px', borderRadius: '12px', paddingRight: '46px',
        border: `1px solid ${touched[field] && fieldErrors[field] ? '#ef4444' : touched[field] && fieldErrors[field] === '' ? '#10b981' : 'var(--border)'}`,
        background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)',
        fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    });

    const containerStyle = {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)', padding: '40px 20px', boxSizing: 'border-box',
    };

    // ── Invalid / expired token ────────────────────────────────────
    if (!tokenValid) {
        return (
            <div style={containerStyle}>
                <div className="premium-card glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏰</div>
                    <h1 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 12px 0', fontWeight: '800' }}>Link expired or invalid</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 28px 0', lineHeight: '1.7' }}>
                        This password reset link has expired or is no longer valid. Reset links are only valid for 15 minutes.
                    </p>
                    <Link to="/forgot-password" style={{ display: 'block', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', borderRadius: '14px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', marginBottom: '14px', boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>
                        Request a new link
                    </Link>
                    <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // ── Success state ─────────────────────────────────────────────
    if (success) {
        return (
            <div style={containerStyle}>
                <div className="premium-card glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center', zIndex: 1 }}>
                    <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '20px', margin: '0 auto 25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 10px 20px rgba(16,185,129,0.3)' }}>✅</div>
                    <h1 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 12px 0', fontWeight: '800' }}>Password reset!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 28px 0', lineHeight: '1.7' }}>
                        Your password has been updated successfully. Redirecting you to sign in...
                    </p>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#10b981', borderRadius: '4px', animation: 'progressBar 3s linear forwards' }} />
                    </div>
                    <style>{`@keyframes progressBar { from { width: 0% } to { width: 100% } }`}</style>
                </div>
            </div>
        );
    }

    // ── Main form ─────────────────────────────────────────────────
    return (
        <div style={containerStyle}>
            <div style={{ position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

            <div className="premium-card glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '20px', margin: '0 auto 25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(59,130,246,0.3)', fontSize: '32px' }}>🔒</div>

                <h1 style={{ fontSize: '26px', color: 'var(--text-main)', margin: '0 0 10px 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Set a new password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.7' }}>
                    Choose a strong password. At least 8 characters with a letter and a number.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginBottom: '20px' }}>

                    {/* New password */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={form.password} maxLength={128} autoComplete="new-password"
                                style={inputStyle('password')}
                                onChange={e => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                                style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <EyeIcon visible={showPassword} />
                            </button>
                        </div>
                        {touched.password && fieldErrors.password && <p style={{ color: '#ef4444', fontSize: '12px', margin: '5px 0 0 4px' }}>⚠ {fieldErrors.password}</p>}
                        {touched.password && fieldErrors.password === '' && <p style={{ color: '#10b981', fontSize: '12px', margin: '5px 0 0 4px' }}>✓ Looks good</p>}

                        {/* Strength bar */}
                        {form.password && strength && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                                </div>
                                <p style={{ fontSize: '11px', color: strength.color, margin: '4px 0 0 2px', fontWeight: '600' }}>{strength.label} password</p>
                            </div>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter your password" value={form.confirm} maxLength={128} autoComplete="new-password"
                                style={inputStyle('confirm')}
                                onChange={e => handleChange('confirm', e.target.value)}
                                onBlur={() => handleBlur('confirm')}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                                style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <EyeIcon visible={showConfirm} />
                            </button>
                        </div>
                        {touched.confirm && fieldErrors.confirm && <p style={{ color: '#ef4444', fontSize: '12px', margin: '5px 0 0 4px' }}>⚠ {fieldErrors.confirm}</p>}
                        {touched.confirm && fieldErrors.confirm === '' && <p style={{ color: '#10b981', fontSize: '12px', margin: '5px 0 0 4px' }}>✓ Passwords match</p>}
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1, marginBottom: '20px' }}
                    onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {loading ? '⏳ Updating...' : 'Reset Password'}
                </button>

                <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    ← Back to Sign In
                </Link>
            </div>
        </div>
    );
};

export default ResetPassword;