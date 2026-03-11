import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PostError = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [technology, setTechnology] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [duplicateWarning, setDuplicateWarning] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!title || !description || !technology) {
            setErrorMsg('Title, description, and technology are required.');
            return;
        }

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            setLoading(true);
            setErrorMsg('');

            // If we haven't warned the user yet, check for duplicates
            if (!duplicateWarning) {
                try {
                    const aiRes = await api.post('/ai/check-duplicate', { title, description });
                    if (aiRes.data.isDuplicate && aiRes.data.similarQuestions.length > 0) {
                        setDuplicateWarning(aiRes.data.similarQuestions);
                        return; // Halt submission here
                    }
                } catch (aiCheckError) {
                    console.error("Duplicate check failed, proceeding anyway", aiCheckError);
                }
            }

            // Execute the actual submission
            const res = await api.post('/errors', {
                title,
                description,
                codeSnippet,
                technology,
                tags
            });
            navigate(`/error/${res.data._id}`);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to post error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="container mt-8 animate-fade-in" style={{ maxWidth: '800px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Ask a Question</h2>

                {errorMsg && <div className="badge mb-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Title <span className="text-danger">*</span></label>
                        <input
                            type="text" id="title" className="form-input"
                            placeholder="e.g. TypeError: Cannot read property 'map' of undefined"
                            value={title} onChange={(e) => setTitle(e.target.value)} required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="technology">Main Technology <span className="text-danger">*</span></label>
                            <input
                                type="text" id="technology" className="form-input"
                                placeholder="e.g. React, Node.js, Python"
                                value={technology} onChange={(e) => setTechnology(e.target.value)} required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                            <input
                                type="text" id="tags" className="form-input"
                                placeholder="javascript, frontend, hooks"
                                value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="description">Detailed Description <span className="text-danger">*</span></label>
                        <textarea
                            id="description" className="form-textarea" rows="6"
                            placeholder="Explain the problem, what you've tried, and what you expect to happen..."
                            value={description} onChange={(e) => setDescription(e.target.value)} required
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label" htmlFor="codeSnippet">Code Snippet (Optional)</label>
                        <textarea
                            id="codeSnippet" className="form-textarea" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} rows="8"
                            placeholder="// Paste your problematic code here..."
                            value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)}
                        />
                    </div>

                    {duplicateWarning ? (
                        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.05)' }}>
                            <h3 style={{ color: '#fbbf24', margin: '0 0 0.5rem 0', fontWeight: 600 }}>Similar Questions Found</h3>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                This question appears highly similar to ones already asked. Would you like to check them out first?
                            </p>
                            <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
                                {duplicateWarning.map(q => (
                                    <li key={q._id} style={{ marginBottom: '0.5rem' }}>
                                        <a href={`/question/${q._id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                            {q.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setDuplicateWarning(null)} className="btn btn-secondary">Edit Question</button>
                                <button type="button" onClick={() => handleSubmit()} className="btn btn-primary" style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none' }}>
                                    {loading ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }}></span> : 'Post Anyway'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <span className="spinner"></span> : 'Post Question'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostError;
