import React, { useState, useContext, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

// ── Security Utilities ────────────────────────────────────────────
const sanitize = (str) => str.replace(/<[^>]*>/g, '').trim();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (pw) => pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);

const useRateLimit = (maxAttempts = 5, windowMs = 60000) => {
    const attempts = useRef([]);
    return useCallback(() => {
        const now = Date.now();
        attempts.current = attempts.current.filter(t => now - t < windowMs);
        if (attempts.current.length >= maxAttempts) {
            const waitSec = Math.ceil((windowMs - (now - attempts.current[0])) / 1000);
            return { blocked: true, waitSec };
        }
        attempts.current.push(now);
        return { blocked: false };
    }, [maxAttempts, windowMs]);
};

// ── Live field validators (run as user types) ─────────────────────
const liveValidate = (field, value, mode) => {
    if (field === 'name' && mode === 'register') {
        if (!value) return null; // no error until they've typed something
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
    }
    if (field === 'email') {
        if (!value) return null;
        if (!value.includes('@')) return 'Email must include @.';
        if (!isValidEmail(value)) return 'Please enter a valid email (e.g. you@example.com).';
        return '';
    }
    if (field === 'password') {
        if (!value) return null;
        // Only enforce password strength requirements during registration
        if (mode === 'register') {
            if (value.length < 8) return `${8 - value.length} more character${8 - value.length === 1 ? '' : 's'} needed.`;
            if (!/[a-zA-Z]/.test(value)) return 'Add at least one letter.';
            if (!/[0-9]/.test(value)) return 'Add at least one number.';
        }
        return '';
    }
    return null;
};

const passwordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
    if (!isStrongPassword(pw)) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) return { label: 'Strong', color: '#10b981', width: '100%' };
    if (pw.length >= 10) return { label: 'Good', color: '#3b82f6', width: '75%' };
    return { label: 'Okay', color: '#f59e0b', width: '55%' };
};

// ── ShowHide Button (clean SVG icons, no emoji) ───────────────────
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

// ── Login Page ────────────────────────────────────────────────────
const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const checkRateLimit = useRateLimit(5, 60000);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    // Update field and run live validation immediately
    const handleChange = (field, value) => {
        setForm(p => ({ ...p, [field]: value }));
        if (touched[field] || value.length > 0) {
            const err = liveValidate(field, value, mode);
            setFieldErrors(p => ({ ...p, [field]: err }));
        }
    };

    const handleBlur = (field) => {
        setTouched(p => ({ ...p, [field]: true }));
        const err = liveValidate(field, form[field], mode);
        setFieldErrors(p => ({ ...p, [field]: err }));
    };

    const validateAll = () => {
        const fields = mode === 'register' ? ['name', 'email', 'password'] : ['email', 'password'];
        const errors = {};
        fields.forEach(f => {
            const err = liveValidate(f, form[f], mode);
            if (err) errors[f] = err;
            if (!form[f]) errors[f] = `${f.charAt(0).toUpperCase() + f.slice(1)} is required.`;
        });
        return errors;
    };

    const handleSubmit = async () => {
        setError('');
        const { blocked, waitSec } = checkRateLimit();
        if (blocked) { setError(`Too many attempts. Wait ${waitSec}s before trying again.`); return; }

        const errors = validateAll();
        setFieldErrors(errors);
        setTouched({ name: true, email: true, password: true });
        if (Object.keys(errors).length > 0) return;

        const payload = mode === 'login'
            ? { email: sanitize(form.email), password: form.password }
            : { name: sanitize(form.name), email: sanitize(form.email), password: form.password };

        setLoading(true);
        try {
            const res = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
            const token = res.data?.token;
            if (!token) { setError('Invalid server response. Please try again.'); return; }

            const user = await login(token);
            if (!user) { setError('Authentication failed. Please try again.'); return; }

            if (user.role === 'ROLE_ADMIN') navigate('/dashboard');
            else if (user.role === 'ROLE_TECHNICIAN') navigate('/technician/desk');
            else navigate('/dashboard');
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) setError('Invalid email or password.');
            else if (status === 409) setError('An account with this email already exists.');
            else if (status === 429) setError('Too many requests. Please wait and try again.');
            else setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        setError('');
        setFieldErrors({});
        setTouched({});
        setForm({ name: '', email: '', password: '' });
        setShowPassword(false);
    };

    const strength = mode === 'register' ? passwordStrength(form.password) : null;

    const inputWrap = (field, children) => (
        <div>
            {children}
            {touched[field] && fieldErrors[field] && (
                <p style={{ color: '#ef4444', fontSize: '12px', margin: '5px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚠</span> {fieldErrors[field]}
                </p>
            )}
            {touched[field] && fieldErrors[field] === '' && (
                <p style={{ color: '#10b981', fontSize: '12px', margin: '5px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓</span> Looks good
                </p>
            )}
        </div>
    );

    const inputStyle = (field) => ({
        width: '100%', padding: '13px 16px', borderRadius: '12px',
        border: `1px solid ${touched[field] && fieldErrors[field] ? '#ef4444' : touched[field] && fieldErrors[field] === '' ? '#10b981' : 'var(--border)'}`,
        background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)',
        fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '40px 20px', boxSizing: 'border-box' }}>
            {/* Background blobs */}
            <div style={{ position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

            <div className="premium-card glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                <div style={{ fontSize: '38px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '32px', letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #fff 0%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    SmartCampus
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
                    The unified hub for university facilities and resource management.
                </p>

                {/* Tab toggle */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid var(--border)' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => handleModeSwitch(m)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s', background: mode === m ? 'var(--primary)' : 'transparent', color: mode === m ? 'white' : 'var(--text-muted)', boxShadow: mode === m ? '0 4px 12px rgba(59,130,246,0.3)' : 'none' }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', textAlign: 'left' }}>

                    {mode === 'register' && inputWrap('name',
                        <input style={inputStyle('name')} placeholder="Full Name" value={form.name} maxLength={80} autoComplete="name"
                            onChange={e => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')} />
                    )}

                    {inputWrap('email',
                        <input style={inputStyle('email')} type="email" placeholder="Email Address" value={form.email} maxLength={254} autoComplete="email"
                            onChange={e => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')} />
                    )}

                    {inputWrap('password',
                        <div style={{ position: 'relative' }}>
                            <input
                                style={{ ...inputStyle('password'), paddingRight: '46px' }}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                maxLength={128}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                onChange={e => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                                style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <EyeIcon visible={showPassword} />
                            </button>
                        </div>
                    )}

                    {/* Password strength bar — register only */}
                    {mode === 'register' && form.password && strength && (
                        <div style={{ marginTop: '-6px' }}>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '4px', transition: 'width 0.3s ease, background 0.3s ease' }} />
                            </div>
                            <p style={{ fontSize: '11px', color: strength.color, margin: '4px 0 0 2px', fontWeight: '600' }}>{strength.label} password</p>
                        </div>
                    )}
                </div>

                {/* Forgot password — login mode only */}
                {mode === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '-6px', marginBottom: '18px' }}>
                        <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
                            onMouseOver={e => e.target.style.textDecoration = 'underline'}
                            onMouseOut={e => e.target.style.textDecoration = 'none'}>
                            Forgot password?
                        </Link>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600', textAlign: 'left' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit */}
                <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px 24px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'all 0.2s', opacity: loading ? 0.7 : 1, marginBottom: '20px' }}
                    onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.5)'; } }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.4)'; }}>
                    {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Google */}
                <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '14px 24px', fontSize: '15px', cursor: 'pointer', backgroundColor: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    Continue with Google
                </button>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Internal Access Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;