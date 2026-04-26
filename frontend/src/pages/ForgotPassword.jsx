import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (val) => {
        if (!val) return 'Email is required.';
        if (!val.includes('@')) return 'Email must include @.';
        if (!isValidEmail(val)) return 'Please enter a valid email address.';
        return '';
    };

    const handleChange = (val) => {
        setEmail(val);
        if (touched) setEmailError(validateEmail(val));
    };

    const handleBlur = () => {
        setTouched(true);
        setEmailError(validateEmail(email));
    };

    const handleSubmit = async () => {
        setTouched(true);
        const err = validateEmail(email);
        setEmailError(err);
        if (err) return;

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email: sanitize(email) });
            setSubmitted(true);
        } catch (e) {
            // Don't reveal whether the email exists — always show success
            // Only show error for server-side failures
            if (e.response?.status >= 500) {
                setError('Server error. Please try again later.');
            } else {
                setSubmitted(true); // Show success even if email not found (security)
            }
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background)', padding: '40px 20px', boxSizing: 'border-box',
    };

    return (
        <div style={containerStyle}>
            <div style={{ position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

            <div className="premium-card glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                {!submitted ? (
                    <>
                        {/* Icon */}
                        <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '20px', margin: '0 auto 25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(139,92,246,0.3)', fontSize: '32px' }}>🔑</div>

                        <h1 style={{ fontSize: '26px', color: 'var(--text-main)', margin: '0 0 10px 0', letterSpacing: '-0.5px', fontWeight: '800' }}>Forgot your password?</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.7' }}>
                            Enter your email and we'll send you a link to reset your password.
                        </p>

                        {/* Email field */}
                        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                maxLength={254}
                                autoComplete="email"
                                onChange={e => handleChange(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                style={{
                                    width: '100%', padding: '13px 16px', borderRadius: '12px',
                                    border: `1px solid ${touched && emailError ? '#ef4444' : touched && emailError === '' ? '#10b981' : 'var(--border)'}`,
                                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)',
                                    fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                                }}
                            />
                            {touched && emailError && (
                                <p style={{ color: '#ef4444', fontSize: '12px', margin: '5px 0 0 4px' }}>⚠ {emailError}</p>
                            )}
                            {touched && emailError === '' && (
                                <p style={{ color: '#10b981', fontSize: '12px', margin: '5px 0 0 4px' }}>✓ Looks good</p>
                            )}
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600', textAlign: 'left' }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.4)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1, marginBottom: '20px' }}
                            onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {loading ? '⏳ Sending...' : 'Send Reset Link'}
                        </button>

                        <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            ← Back to Sign In
                        </Link>
                    </>
                ) : (
                    <>
                        {/* Success state */}
                        <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '20px', margin: '0 auto 25px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(16,185,129,0.3)', fontSize: '32px' }}>📧</div>
                        <h1 style={{ fontSize: '24px', color: 'var(--text-main)', margin: '0 0 12px 0', fontWeight: '800' }}>Check your email</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.7' }}>
                            If an account exists for <strong style={{ color: 'var(--text-main)' }}>{email}</strong>, you'll receive a password reset link shortly.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 32px 0' }}>
                            Didn't receive it? Check your spam folder or try again.
                        </p>
                        <button onClick={() => { setSubmitted(false); setEmail(''); setTouched(false); setEmailError(null); }}
                            style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginBottom: '14px', transition: 'all 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                            Try a different email
                        </button>
                        <Link to="/login" style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            ← Back to Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;