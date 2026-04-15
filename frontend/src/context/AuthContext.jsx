import { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            localStorage.removeItem('jwt_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (token) => {
        localStorage.setItem('jwt_token', token);
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user after login', error);
            localStorage.removeItem('jwt_token');
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};