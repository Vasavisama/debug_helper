import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ErrorCard from '../components/common/ErrorCard';
import AIDebugAssistant from '../components/AIDebugAssistant';

const Home = () => {
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchErrors();
    }, []);

    const fetchErrors = async (keyword = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/errors${keyword ? `?keyword=${keyword}` : ''}`);
            setErrors(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchErrors(search);
    };

    return (
        <div className="container mt-8 animate-fade-in">
            <div className="hero-section text-center mb-8">
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                    Welcome to <span style={{ color: 'var(--accent-primary)' }}>DebugHelper</span>
                </h1>
                <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    The real-time platform for developers to post errors, share code snippets, chat live, and build reputation by helping others.
                </p>
            </div>

            <div className="search-section glass-panel mb-8" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by title, technology, or tag..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>Search</button>
                </form>
                {search && (
                    <button onClick={() => { setSearch(''); fetchErrors(''); }} className="btn btn-secondary">Clear</button>
                )}
            </div>

            <div className="home-layout">
                {/* Left column — Questions Feed */}
                <div className="questions-feed">
                    <div className="posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Recent Discussions</h2>
                        <Link to="/post-error" className="btn btn-primary">Ask a Question</Link>
                    </div>

                    {loading ? (
                        <div className="text-center mt-8">
                            <span className="spinner"></span>
                            <p className="mt-4 text-muted">Loading latest errors...</p>
                        </div>
                    ) : errors.length === 0 ? (
                        <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
                            <h3 className="text-muted mb-4">No errors found.</h3>
                            <p>Be the first to ask a question!</p>
                            <Link to="/post-error" className="btn btn-primary mt-4">Post Error</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {errors.map(error => (
                                <ErrorCard key={error._id} error={error} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column — AI Debug Assistant */}
                <AIDebugAssistant />
            </div>
        </div>
    );
};

export default Home;
