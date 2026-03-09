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
        <div className="container animate-fade-in" style={{ paddingTop: '1rem' }}>
            <div className="hero-section text-center" style={{ padding: '0 0 2rem 0' }}>
                <h1 style={{ fontSize: '2.75rem', letterSpacing: '-0.02em', fontWeight: 800, marginBottom: '0.8rem', lineHeight: 1.1 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Welcome to </span>
                    <span style={{
                        color: 'transparent',
                        background: 'linear-gradient(to right, #60a5fa, var(--accent-primary))',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        display: 'inline-block'
                    }}>DebugHelper</span>
                </h1>
                <p style={{
                    fontSize: '1.15rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '650px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                    fontWeight: 400
                }}>
                    The real-time platform for developers to post errors, share code snippets, chat live, and build reputation by helping others.
                </p>
            </div>

            <div className="search-section mb-8" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '9999px', padding: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(12px)' }}>
                    <svg style={{ position: 'absolute', left: '1.75rem', color: 'var(--text-muted)', width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', margin: 0, paddingRight: '0.25rem' }}>
                        <input
                            type="text"
                            placeholder="Search by title, technology, or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                padding: '1rem 1rem 1rem 4rem',
                                fontSize: '1.1rem',
                                outline: 'none',
                                width: '100%',
                                fontFamily: 'var(--font-sans)',
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {search && (
                                <button type="button" onClick={() => { setSearch(''); fetchErrors(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0 1rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s', fontFamily: 'var(--font-sans)' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}>
                                    Clear
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600 }}>
                                Search
                            </button>
                        </div>
                    </form>
                </div>
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
