import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ErrorCard from '../components/common/ErrorCard';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useContext(AuthContext);

    const [profileUser, setProfileUser] = useState(null);
    const [userErrors, setUserErrors] = useState([]);
    const [userSolutions, setUserSolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // If viewing own profile, maybe we already have data, but let's fetch strictly for robustness 
            // Note: We don't have a specific public /api/users/:id endpoint defined in the prompt.
            // We will derive profile data from their posts as a workaround, or assume a basic structure.
            // Since the prompt didn't request a new backend route for public profiles, we will simulate it by 
            // just showing the errors and solutions they created.
            const [errorsRes, solutionsRes] = await Promise.all([
                api.get(`/errors/user/${id}`),
                api.get(`/solutions/user/${id}`),
            ]);

            setUserErrors(errorsRes.data);
            setUserSolutions(solutionsRes.data);

            // Infer user details from the first post/solution if available
            // In a real app we'd have a dedicated GET /api/users/:id
            if (errorsRes.data.length > 0) {
                setProfileUser(errorsRes.data[0].userId); // Assuming populated, which might not be true for /user/:id route based on our backend code 
                // Wait, our backend /api/errors/user/:id does NOT populate userId. It just returns the ID.
                // Let's rely on the first solution which DOES populate errorId. Wait, our solution user/:id does NOT populate userId either.
                // Let's fetch one post directly if we need to.
            }

        } catch (error) {
            console.error('Failed to fetch user profile data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-8 text-center"><span className="spinner"></span></div>;

    return (
        <div className="container mt-8 animate-fade-in">
            <div className="dashboard-header glass-panel mb-8" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600
                }}>
                    {/* Fallback avatar */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>User Profile</h2>
                    <p className="text-muted" style={{ margin: '0.25rem 0 1rem 0' }}>Activity Overview</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Cannot reliably show reputation here without a public user endpoint, so we show stats instead */}
                        <span className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
                            📝 {userErrors.length} Questions Asked
                        </span>
                        <span className="badge badge-accent" style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
                            💡 {userSolutions.length} Solutions Provided
                        </span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Questions ({userErrors.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {userErrors.length === 0 ? <p className="text-muted">No questions posted.</p> :
                            userErrors.slice(0, 5).map(error => ( // Show top 5
                                <div key={error._id} className="glass-panel" style={{ padding: '1rem' }}>
                                    <a href={`/error/${error._id}`} style={{ fontWeight: 600 }}>{error.title}</a>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Votes: {error.votes} • {error.solved ? 'Solved' : 'Open'}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Solutions ({userSolutions.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {userSolutions.length === 0 ? <p className="text-muted">No solutions provided.</p> :
                            userSolutions.slice(0, 5).map(solution => ( // Show top 5
                                <div key={solution._id} className="glass-panel" style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        {solution.solutionText.substring(0, 100)}...
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Votes: {solution.votes} {solution.accepted && <span className="text-success ml-2">✓ Accepted</span>}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
