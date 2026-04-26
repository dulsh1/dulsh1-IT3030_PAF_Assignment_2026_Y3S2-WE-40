import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const prevCountRef = React.useRef(0);

    const playPing = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (e) { console.error("Sound failed", e); }
    };

    useEffect(() => {
        if (!user) return;
        const fetchNotifs = () => {
            api.get(`/notifications/user/${user.id}`).then(res => {
                const unread = res.data.filter(n => !n.read).length;
                
                // Play sound if count increased (for Staff/Admin)
                if (unread > prevCountRef.current && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_TECHNICIAN')) {
                    playPing();
                }
                
                setUnreadCount(unread);
                prevCountRef.current = unread;
            }).catch(() => {});
        };
        fetchNotifs();
        const intv = setInterval(fetchNotifs, 10000); // Poll every 10s
        return () => clearInterval(intv);
    }, [user, location.pathname]);

    // Do not show the navigation bar on public login pages
    if (!user || location.pathname === '/login' || location.pathname.startsWith('/oauth2')) {
        return null;
    }

    

    const navStyle = {
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '12px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: '15px',
        margin: '0 20px 20px 20px',
        borderRadius: '24px',
        zIndex: 1000,
        maxWidth: 'calc(100% - 40px)'
    };

    const linkStyle = (path) => {
        const isActive = location.pathname === path;
        return {
            textDecoration: 'none',
            color: isActive ? '#60a5fa' : '#94a3b8',
            fontWeight: '600',
            marginRight: '25px',
            fontSize: '14px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '10px',
            background: isActive ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
            boxShadow: isActive ? '0 0 0 1px rgba(96, 165, 250, 0.15)' : 'none'
        };
    };

    return (
        <nav style={navStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                    onClick={() => navigate('/dashboard')}
                    style={{ margin: 0, marginRight: '30px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '22px', fontWeight: '900', letterSpacing: '-1px' }}
                >
                    SmartCampus
                </div>
                
                <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
                <Link to="/catalogue" style={linkStyle('/catalogue')}>Facilities & Assets</Link>
                
                {user.role === 'ROLE_ADMIN' && (
                    <Link to="/admin/bookings" style={linkStyle('/admin/bookings')}>Manage Bookings</Link>
                )}
                {(user.role === 'ROLE_TECHNICIAN' || user.role === 'ROLE_ADMIN') && (
                    <Link to="/technician/desk" style={linkStyle('/technician/desk')}>Service Desk</Link>
                )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/notifications" style={{...linkStyle('/notifications'), position: 'relative', fontSize: '18px', marginRight: '15px', padding: '10px'}}>
                    <span style={{filter: unreadCount > 0 ? 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))' : 'none'}}>🔔</span>
                    {unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: '900', padding: '1px 5px', borderRadius: '10px', boxShadow: '0 0 0 3px var(--surface)' }}>
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <div style={{ marginRight: '20px', height: '32px', width: '1px', background: 'var(--border)', marginLeft: '5px' }} />

                <Link 
                    to="/settings" 
                    style={{ 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '6px 14px',
                        borderRadius: '14px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: location.pathname === '/settings' ? 'rgba(96, 165, 250, 0.1)' : 'transparent',
                        border: '1px solid',
                        borderColor: location.pathname === '/settings' ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                        marginRight: '10px'
                    }}
                    onMouseOver={(e) => { 
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseOut={(e) => { 
                        e.currentTarget.style.backgroundColor = location.pathname === '/settings' ? 'rgba(96, 165, 250, 0.1)' : 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '13px' }}>{user.name}</div>
                    <div style={{ 
                        width: '36px', height: '36px', borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.05)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', 
                        fontWeight: 'bold', color: '#60a5fa', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {user.name.charAt(0)}
                    </div>
                </Link>
                
                <button 
                    onClick={logout}
                    style={{
                        padding: '10px 18px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                        border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '13px', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.target.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.target.style.transform = 'translateY(0)'; }}
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
