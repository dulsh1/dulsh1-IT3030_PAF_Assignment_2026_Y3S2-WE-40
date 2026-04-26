import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import api from '../api/axiosConfig';

const roleInfo = {
    ROLE_ADMIN: {
        label: 'Administrator',
        description: 'Full access to all system features including user management, bookings, and admin panel.',
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.3)',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.2)',
        icon: '🛡️',
    },
    ROLE_TECHNICIAN: {
        label: 'Technician',
        description: 'Access to the Service Desk for managing and resolving maintenance tickets.',
        color: '#34d399',
        glow: 'rgba(52, 211, 153, 0.3)',
        bg: 'rgba(52, 211, 153, 0.08)',
        border: 'rgba(52, 211, 153, 0.2)',
        icon: '🔧',
    },
    ROLE_USER: {
        label: 'Student / Staff',
        description: 'Access to facility booking, asset catalogue, and issue reporting.',
        color: '#60a5fa',
        glow: 'rgba(96, 165, 250, 0.3)',
        bg: 'rgba(96, 165, 250, 0.08)',
        border: 'rgba(96, 165, 250, 0.2)',
        icon: '🎓',
    },
};

const Settings = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const { showNotification } = useContext(NotificationContext);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [submittingName, setSubmittingName] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false); // Controls visibility for all users
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [submittingPassword, setSubmittingPassword] = useState(false);

    useEffect(() => {
        if (user) setNewName(user.name);
    }, [user]);

    if (!user) return null;

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            showNotification('Name cannot be empty', 'error');
            return;
        }
        setSubmittingName(true);
        try {
            await api.post('/auth/update-name', { newName });
            await fetchUser();
            setIsEditingName(false);
            showNotification('Profile name updated successfully', 'success');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to update name', 'error');
        } finally {
            setSubmittingName(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword.length < 8) {
            showNotification('New password must be at least 8 characters', 'error');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        setSubmittingPassword(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            showNotification('Password updated successfully', 'success');
            fetchUser(); // To update hasPassword flag
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSubmittingPassword(false);
        }
    };
    if (!user) return null;

    const role = roleInfo[user.role] || roleInfo['ROLE_USER'];
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    const containerStyle = {
        maxWidth: '700px',
        margin: '40px auto',
        padding: '0 20px',
        fontFamily: 'inherit',
    };

    const cardStyle = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '36px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    };

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--text-muted)',
        marginBottom: '6px',
    };

    const valueStyle = {
        fontSize: '16px',
        fontWeight: '600',
        color: 'var(--text-main)',
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    Account Settings
                </h1>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Your profile information and system access level.
                </p>
            </div>

            {/* Profile Card */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', fontWeight: '800', color: 'white',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
                        flexShrink: 0,
                    }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            SmartCampus User
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <div style={labelStyle}>Full Name</div>
                        {isEditingName ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="premium-input"
                                    style={{ padding: '8px 12px', fontSize: '14px', flex: 1, margin: 0 }}
                                />
                                <button 
                                    onClick={handleUpdateName}
                                    disabled={submittingName}
                                    style={{ 
                                        padding: '8px 16px', background: 'var(--primary)', color: 'white', 
                                        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' 
                                    }}
                                >
                                    {submittingName ? '...' : 'Save'}
                                </button>
                                <button 
                                    onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                                    style={{ 
                                        padding: '8px 16px', background: 'transparent', color: 'var(--text-muted)', 
                                        border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer' 
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={valueStyle}>{user.name}</div>
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    style={{ 
                                        background: 'transparent', border: 'none', color: '#60a5fa', 
                                        cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' 
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={labelStyle}>User ID</div>
                        <div style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '14px', color: 'var(--text-muted)' }}>
                            #{user.id}
                        </div>
                    </div>
                    {user.email && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={labelStyle}>Email Address</div>
                            <div style={valueStyle}>{user.email}</div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                ...cardStyle,
                border: `1px solid ${role.border}`,
                background: role.bg,
                boxShadow: `0 8px 32px ${role.glow}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: `rgba(0,0,0,0.2)`,
                        border: `1px solid ${role.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', flexShrink: 0,
                    }}>
                        {role.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <div style={labelStyle}>System Role</div>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: role.color, marginBottom: '8px', letterSpacing: '-0.3px' }}>
                            {role.label}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            {role.description}
                        </div>

                        {/* Permissions badge row */}
                        <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TECHNICIAN' || user.role === 'ROLE_USER') && (
                                <span style={badgeStyle('#60a5fa')}>📅 Facility Booking</span>
                            )}
                            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TECHNICIAN' || user.role === 'ROLE_USER') && (
                                <span style={badgeStyle('#60a5fa')}>🗂️ Asset Catalogue</span>
                            )}
                            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TECHNICIAN') && (
                                <span style={badgeStyle('#34d399')}>🔧 Service Desk</span>
                            )}
                            {user.role === 'ROLE_ADMIN' && (
                                <span style={badgeStyle('#f59e0b')}>⚙️ Admin Panel</span>
                            )}
                            {user.role === 'ROLE_ADMIN' && (
                                <span style={badgeStyle('#f59e0b')}>📋 Manage Bookings</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '20px' }}>🔐</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>Security & Password</div>
                </div>

                {!isChangingPassword ? (
                    <div style={{ 
                        padding: '24px', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid var(--border)', textAlign: 'center' 
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '12px' }}>{user.hasPassword ? '🛡️' : '🔑'}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                            {user.hasPassword ? 'Password Protection Active' : 'No Local Password Set'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
                            {user.hasPassword 
                                ? 'Your account is protected with a local password. You can change it at any time.' 
                                : 'Setting a local password allows you to log in directly with your email address instead of using Google Sign-In.'}
                        </div>
                        <button 
                            onClick={() => setIsChangingPassword(true)}
                            style={{ 
                                padding: '10px 24px', background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa', 
                                border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '12px', 
                                cursor: 'pointer', fontWeight: '700', fontSize: '13px' 
                            }}
                        >
                            {user.hasPassword ? 'Change Password' : 'Set Account Password'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '600' }}>
                                {user.hasPassword ? '🔄 Updating current password' : '✨ Setting new account password'}
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsChangingPassword(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}
                            >
                                Cancel
                            </button>
                        </div>

                        {user.hasPassword && (
                            <div>
                                <label style={labelStyle}>Current Password</label>
                                <input 
                                    type="password"
                                    required
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    style={inputFieldStyle}
                                />
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>New Password</label>
                                <input 
                                    type="password"
                                    required
                                    placeholder="Min 8 characters"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    style={inputFieldStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password</label>
                                <input 
                                    type="password"
                                    required
                                    placeholder="Repeat new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    style={inputFieldStyle}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={submittingPassword}
                            style={{
                                marginTop: '10px',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                            }}
                        >
                            {submittingPassword ? 'Processing...' : (user.hasPassword ? 'Update Password' : 'Save New Password')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

const inputFieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--text-main)',
    fontSize: '14px',
    marginTop: '6px',
    outline: 'none',
    boxSizing: 'border-box'
};

const badgeStyle = (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}30`,
});

export default Settings;
