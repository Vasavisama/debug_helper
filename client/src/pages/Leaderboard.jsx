import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/auth/leaderboard');
                setUsers(res.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="container mt-8 text-center animate-fade-in">
                <span className="spinner"></span>
            </div>
        );
    }

    return (
        <div className="container mt-8 animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="dashboard-header glass-panel mb-6" style={{ padding: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Points Leaderboard</h1>
                <p className="text-muted" style={{ margin: 0 }}>Top 100 members ranking by AI Accuracy Points</p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem 0' }}>
                {users.length === 0 ? (
                    <div className="text-center p-8 text-muted" style={{ padding: '2rem' }}>No users found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {users.map((user, index) => (
                            <div 
                                key={user._id} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    padding: '1rem 2rem',
                                    borderBottom: index < users.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    backgroundColor: index < 3 ? 'var(--bg-tertiary)' : 'transparent',
                                }}
                            >
                                <div style={{ 
                                    width: '30px', 
                                    fontWeight: 'bold', 
                                    color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'var(--text-muted)'
                                }}>
                                    #{index + 1}
                                </div>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                    marginRight: '1rem'
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.name}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span className="badge badge-accent" style={{ padding: '0.4rem 0.8rem' }}>
                                        ✨ {user.points || 0} Points
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
