import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

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
    const { user } = useContext(AuthContext);
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
                        <div style={valueStyle}>{user.name}</div>
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

            {/* Role Card */}
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
        </div>
    );
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
