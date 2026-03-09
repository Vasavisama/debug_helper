import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ErrorCard from '../components/common/ErrorCard';

const Dashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('posts'); // posts | solutions
    const [userErrors, setUserErrors] = useState([]);
    const [userSolutions, setUserSolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            fetchUserData();
        }
    }, [user, authLoading, navigate]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const [errorsRes, solutionsRes] = await Promise.all([
                api.get(`/errors/my`),
                api.get(`/solutions/user/${user._id}`),
            ]);
            setUserErrors(errorsRes.data);
            setUserSolutions(solutionsRes.data);
        } catch (error) {
            console.error('Failed to fetch user data', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Edit Handlers ---
    const handleStartEdit = (error) => {
        setEditingId(error._id);
        setEditTitle(error.title);
        setEditDescription(error.description);
        setEditTags(error.tags ? error.tags.join(', ') : '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editDescription.trim()) return;

        const tags = editTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        try {
            setEditLoading(true);
            await api.put(`/errors/${editingId}`, {
                title: editTitle,
                description: editDescription,
                tags
            });
            setEditingId(null);
            fetchUserData();
        } catch (error) {
            console.error('Failed to update question', error);
            alert(error.response?.data?.message || 'Failed to update question');
        } finally {
            setEditLoading(false);
        }
    };

    // --- Delete Handler ---
    const handleDelete = async (questionId) => {
        if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

        try {
            await api.delete(`/errors/${questionId}`);
            fetchUserData();
        } catch (error) {
            console.error('Failed to delete question', error);
            alert(error.response?.data?.message || 'Failed to delete question');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="container mt-8 text-center animate-fade-in">
                <span className="spinner"></span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mt-8 animate-fade-in">
            <div className="dashboard-header glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.25rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600
                }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{user.name}</h2>
                    <p className="text-muted" style={{ margin: '0.25rem 0 1rem 0' }}>{user.email}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
                            🌟 {user.reputation} Reputation
                        </span>
                    </div>
                </div>
            </div>

            <div className="dashboard-tabs mb-6" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <button
                    className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('posts')}
                >
                    My Questions ({userErrors.length})
                </button>
                <button
                    className={`btn ${activeTab === 'solutions' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('solutions')}
                >
                    My Solutions ({userSolutions.length})
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'posts' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {userErrors.length === 0 ? (
                            <p className="text-muted text-center py-8">You haven't posted any questions yet.</p>
                        ) : (
                            userErrors.map(error => (
                                <div key={error._id}>
                                    {editingId === error._id ? (
                                        /* ---- INLINE EDIT FORM ---- */
                                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Edit Question</h3>
                                            <form onSubmit={handleSaveEdit}>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="editTitle">Title</label>
                                                    <input
                                                        type="text" id="editTitle" className="form-input"
                                                        value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="editDescription">Description</label>
                                                    <textarea
                                                        id="editDescription" className="form-textarea" rows="4"
                                                        value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label" htmlFor="editTags">Tags (comma separated)</label>
                                                    <input
                                                        type="text" id="editTags" className="form-input"
                                                        value={editTags} onChange={(e) => setEditTags(e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                                                    <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
                                                    <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                                        {editLoading ? <span className="spinner"></span> : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        /* ---- QUESTION CARD + ACTION BUTTONS ---- */
                                        <div>
                                            <ErrorCard error={{ ...error, userId: user }} />
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleStartEdit(error)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(error._id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'solutions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {userSolutions.length === 0 ? (
                            <p className="text-muted text-center py-8">You haven't posted any solutions yet.</p>
                        ) : (
                            userSolutions.map(solution => (
                                <div key={solution._id} className="glass-panel" style={{ padding: '1.25rem' }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Solution for: </span>
                                        <Link to={`/question/${solution.errorId?._id}`} style={{ fontWeight: 600 }}>
                                            {solution.errorId?.title || 'Unknown Error'}
                                        </Link>
                                    </div>
                                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                                        {solution.solutionText.length > 200 ? solution.solutionText.substring(0, 200) + '...' : solution.solutionText}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        <span className="badge">Votes: {solution.votes}</span>
                                        {solution.accepted && <span className="badge badge-success">Accepted Solution</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
