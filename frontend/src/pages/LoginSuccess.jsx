import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            login(token).then((user) => {
                if (!user) {
                    navigate('/login');
                    return;
                }
                if (user.role === 'ROLE_ADMIN') {
                    navigate('/dashboard');
                } else if (user.role === 'ROLE_TECHNICIAN') {
                    navigate('/technician/desk');
                } else {
                    navigate('/dashboard');
                }
            });
        } else {
            console.error('No token found in callback URL');
            navigate('/login');
        }
    }, [location, login, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Authenticating securely... Please wait.</h2>
        </div>
    );
};

export default LoginSuccess;