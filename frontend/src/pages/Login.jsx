import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleSubmit = async () => {
        setError('');
        const { name, email, password } = form;

        if (!email.trim() || !password.trim()) {
            setError('Email and password are required.');
            return;
        }
        if (mode === 'register' && !name.trim()) {
            setError('Name is required.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login'
                ? { email, password }
                : { name, email, password };

            const res = await api.post(endpoint, payload);
            const token = res.data.token;

            const user = await login(token);
            if (!user) { setError('Login failed. Please try again.'); return; }

            if (user.role === 'ROLE_ADMIN') navigate('/admin/panel');
            else if (user.role === 'ROLE_TECHNICIAN') navigate('/technician/desk');
            else navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '14px 16px', borderRadius: '12px',
        border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-main)', fontSize: '15px', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s',
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--background)', position: 'fixed', inset: 0, zIndex: 2000
        }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />

            <div className="premium-card glass" style={{
                width: '100%', maxWidth: '440px', padding: '50px',
                textAlign: 'center', position: 'relative', zIndex: 1
            }}>
                {/* Logo */}
                <div style={{
                    width: '70px', height: '70px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '20px', margin: '0 auto 25px auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(59,130,246,0.3)', fontSize: '32px'
                }}>🏫</div>

                <h1 style={{ fontSize: '30px', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-1px', fontWeight: '800' }}>
                    Welcome to <span style={{ color: 'var(--primary)' }}>SmartCampus</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
                    The unified hub for university facilities and resource management.
                </p>

                {/* Tab toggle */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: '1px solid var(--border)' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }}
                            style={{
                                flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                                fontWeight: '700', fontSize: '14px', transition: 'all 0.2s',
                                background: mode === m ? 'var(--primary)' : 'transparent',
                                color: mode === m ? 'white' : 'var(--text-muted)',
                                boxShadow: mode === m ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                            }}>
                            {m === 'login' ? 'Sign In' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {mode === 'register' && (
                        <input style={inputStyle} placeholder="Full Name" value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    )}
                    <input style={inputStyle} type="email" placeholder="Email Address" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <input style={inputStyle} type="password" placeholder="Password" value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit button */}
                <button onClick={handleSubmit} disabled={loading} style={{
                    width: '100%', padding: '15px 24px', fontSize: '15px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700',
                    boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1, marginBottom: '20px',
                }}
                    onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.5)'; } }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.4)'; }}>
                    {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                </div>

                {/* Google button */}
                <button onClick={handleGoogleLogin} style={{
                    width: '100%', padding: '14px 24px', fontSize: '15px', cursor: 'pointer',
                    backgroundColor: 'var(--surface)', color: 'var(--text-main)',
                    border: '1px solid var(--border)', borderRadius: '14px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                    transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    Continue with Google
                </button>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        Internal Access Only &bull; University of Smart Campus
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;