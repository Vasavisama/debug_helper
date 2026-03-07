import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser(res.data);
                } catch (error) {
                    console.error('Failed to fetch user, token invalid', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUserReputation = (amount) => {
        if (user) {
            setUser({ ...user, reputation: user.reputation + amount });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserReputation }}>
            {children}
        </AuthContext.Provider>
    );
};
