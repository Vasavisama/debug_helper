import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [reputation, setReputation] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (user) {
            setReputation(user.reputation);
            fetchData();
            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [notifRes, profileRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/auth/profile')
            ]);
            setNotifications(notifRes.data);
            setReputation(profileRes.data.reputation);
        } catch (error) {
            console.error('Failed to fetch navbar data');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">&#123;d&#125;</span>
                    DebugHelper
                </Link>
                <div className="navbar-links">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'}>Home</NavLink>
                    <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'}>Leaderboard</NavLink>
                    {user ? (
                        <>
                            <NavLink to="/post-error" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'}>Post Error</NavLink>
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active-nav' : 'nav-link'}>Dashboard</NavLink>

                            <div className="nav-user">
                                <div className="notification-wrapper">
                                    <button className="notification-btn" onClick={() => setShowDropdown(!showDropdown)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                        {unreadCount > 0 && <span className="notification-badge-icon"></span>}
                                    </button>

                                    {showDropdown && (
                                        <div className="notification-dropdown animate-fade-in">
                                            <div className="notif-header">Notifications ({unreadCount})</div>
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-muted" style={{ padding: '1.5rem' }}>No notifications</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif._id}
                                                        className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                                                        onClick={() => markAsRead(notif._id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <span style={{ color: notif.type === 'accepted' ? 'var(--success)' : 'var(--accent-primary)' }}>
                                                                {notif.type === 'accepted' ? '✓' : notif.type === 'chat' ? '💬' : '💡'}
                                                            </span>
                                                            <div>
                                                                {notif.message}
                                                                <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <span className="nav-rep badge badge-accent" title="Reputation">{reputation} rep</span>
                                <button onClick={handleLogout} className="btn btn-secondary nav-logout">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary nav-register">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
