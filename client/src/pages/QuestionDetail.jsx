import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';

const QuestionDetail = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [errorPost, setErrorPost] = useState(null);
    const [solutions, setSolutions] = useState([]);
    const [newSolution, setNewSolution] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPostingSolution, setIsPostingSolution] = useState(false);

    // Reply state tracking which solution's reply box is open
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCodeSnippet, setEditCodeSnippet] = useState('');
    const [editTechnology, setEditTechnology] = useState('');
    const [editTags, setEditTags] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        fetchQuestionAndAnswers();
    }, [id]);

    const fetchQuestionAndAnswers = async () => {
        setLoading(true);
        try {
            const errorRes = await api.get(`/errors/${id}`);
            setErrorPost(errorRes.data);

            const solutionsRes = await api.get(`/solutions/${id}`);
            setSolutions(solutionsRes.data);
        } catch (error) {
            console.error('Error fetching question or solutions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (targetId, targetType, voteType) => {
        if (!user) return alert('Please login to vote');
        try {
            await api.post('/votes', { targetId, targetType, voteType });
            fetchQuestionAndAnswers();
        } catch (error) {
            console.error('Failed to vote', error);
        }
    };

    const handlePostSolution = async (e) => {
        e.preventDefault();
        if (!newSolution.trim()) return;
        try {
            setIsPostingSolution(true);
            await api.post('/solutions', { errorId: id, solutionText: newSolution });
            setNewSolution('');
            fetchQuestionAndAnswers();
        } catch (error) {
            console.error('Failed to post solution', error);
        } finally {
            setIsPostingSolution(false);
        }
    };

    const handlePostReply = async (solutionId) => {
        const text = replyTexts[solutionId];
        if (!text || !text.trim()) return;

        try {
            await api.post('/replies', { solutionId, replyText: text });
            // Clear reply box and hide it
            setReplyTexts(prev => ({ ...prev, [solutionId]: '' }));
            setReplyingTo(null);
            fetchQuestionAndAnswers();
        } catch (error) {
            console.error('Failed to post reply', error);
        }
    };

    // --- Edit Handlers ---
    const handleStartEdit = () => {
        setEditTitle(errorPost.title);
        setEditDescription(errorPost.description);
        setEditCodeSnippet(errorPost.codeSnippet || '');
        setEditTechnology(errorPost.technology);
        setEditTags(errorPost.tags ? errorPost.tags.join(', ') : '');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editDescription.trim() || !editTechnology.trim()) return;

        const tags = editTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        try {
            setEditLoading(true);
            await api.put(`/errors/${id}`, {
                title: editTitle,
                description: editDescription,
                codeSnippet: editCodeSnippet,
                technology: editTechnology,
                tags
            });
            setIsEditing(false);
            fetchQuestionAndAnswers();
        } catch (error) {
            console.error('Failed to update question', error);
            alert(error.response?.data?.message || 'Failed to update question');
        } finally {
            setEditLoading(false);
        }
    };

    // --- Delete Handler ---
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;

        try {
            await api.delete(`/errors/${id}`);
            navigate('/home');
        } catch (error) {
            console.error('Failed to delete question', error);
            alert(error.response?.data?.message || 'Failed to delete question');
        }
    };

    const isAuthor = user && errorPost && errorPost.userId && user._id === errorPost.userId._id;

    if (loading) return <div className="container mt-8 text-center text-muted">Loading question...</div>;
    if (!errorPost) return <div className="container mt-8 text-center">Error not found</div>;

    return (
        <div className="container mt-6 animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* ERROR POST SECTION */}
            <div className="glass-panel mb-8" style={{ padding: '2rem' }}>

                {isEditing ? (
                    /* ---- EDIT MODE ---- */
                    <form onSubmit={handleSaveEdit}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit Question</h2>

                        <div className="form-group">
                            <label className="form-label" htmlFor="editTitle">Title <span className="text-danger">*</span></label>
                            <input
                                type="text" id="editTitle" className="form-input"
                                value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="editTechnology">Main Technology <span className="text-danger">*</span></label>
                                <input
                                    type="text" id="editTechnology" className="form-input"
                                    value={editTechnology} onChange={(e) => setEditTechnology(e.target.value)} required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="editTags">Tags (comma separated)</label>
                                <input
                                    type="text" id="editTags" className="form-input"
                                    value={editTags} onChange={(e) => setEditTags(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="editDescription">Description <span className="text-danger">*</span></label>
                            <textarea
                                id="editDescription" className="form-textarea" rows="6"
                                value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required
                            />
                        </div>

                        <div className="form-group mb-6">
                            <label className="form-label" htmlFor="editCodeSnippet">Code Snippet (Optional)</label>
                            <textarea
                                id="editCodeSnippet" className="form-textarea"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} rows="8"
                                value={editCodeSnippet} onChange={(e) => setEditCodeSnippet(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                {editLoading ? <span className="spinner"></span> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ---- VIEW MODE ---- */
                    <>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
                            {errorPost.title}
                        </h1>

                        <div style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1.5rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                            {errorPost.description}
                        </div>

                        {errorPost.codeSnippet && (
                            <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <div style={{ backgroundColor: '#1e1e1e', padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#9cdcfe', borderBottom: '1px solid #333' }}>
                                    Code Snippet
                                </div>
                                <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', fontSize: '0.9rem', backgroundColor: '#1e1e1e' }}>
                                    {errorPost.codeSnippet}
                                </SyntaxHighlighter>
                            </div>
                        )}

                        <div className="error-tags mb-6">
                            <span className="badge tech-badge">{errorPost.technology}</span>
                            {errorPost.tags.map(tag => <span key={tag} className="badge">#{tag}</span>)}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '1rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleVote(errorPost._id, 'error', 'upvote')}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                            >
                                <span>⬆</span> {errorPost.votes} Vote{errorPost.votes !== 1 && 's'}
                            </button>
                            <span>💬 {errorPost.answerCount} answers</span>

                            <span className="ml-auto" style={{ fontSize: '0.9rem' }}>
                                Asked by <Link to={`/profile/${errorPost.userId._id}`} style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{errorPost.userId.name}</Link> • {formatTimeAgo(errorPost.createdAt)}
                            </span>
                            {errorPost.solved && <span className="badge badge-success ml-2">Solved</span>}
                        </div>

                        {/* Edit / Delete Buttons — visible only to the question author */}
                        {isAuthor && (
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button
                                    onClick={handleStartEdit}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ANSWERS SECTION */}
            <div className="mb-8">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Answers
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {solutions.map(solution => (
                        <div key={solution._id} className="glass-panel" style={{ padding: '1.5rem', border: solution.accepted ? '1px solid var(--success)' : '1px solid var(--border-color)' }}>
                            {/* Answer Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {solution.userId.name.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Answer by {solution.userId.name}</span>
                                    {solution.accepted && <span className="badge badge-success ml-2">✓ Accepted</span>}
                                </div>
                                <span className="text-muted">{formatTimeAgo(solution.createdAt)}</span>
                            </div>

                            {/* Answer Body */}
                            <div style={{ fontSize: '1.05rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
                                {solution.solutionText}
                            </div>

                            {/* AI Accuracy */}
                            {solution.accuracyScore && (
                                <div className="ai-accuracy">
                                    AI Accuracy: {solution.accuracyScore}%
                                </div>
                            )}

                            {/* Answer Footer (Vote / Reply) */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => handleVote(solution._id, 'solution', 'upvote')}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <span>⬆</span> {solution.votes} Vote{solution.votes !== 1 && 's'}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === solution._id ? null : solution._id)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.25rem 0.75rem' }}
                                >
                                    Reply
                                </button>
                            </div>

                            {/* Reply Input Box */}
                            {replyingTo === solution._id && (
                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                    <textarea
                                        className="form-textarea mb-2" rows="3"
                                        placeholder="Write a reply..."
                                        value={replyTexts[solution._id] || ''}
                                        onChange={(e) => setReplyTexts({ ...replyTexts, [solution._id]: e.target.value })}
                                    ></textarea>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setReplyingTo(null)} className="btn btn-secondary">Cancel</button>
                                        <button onClick={() => handlePostReply(solution._id)} className="btn btn-primary">Post Reply</button>
                                    </div>
                                </div>
                            )}

                            {/* Replies List */}
                            {solution.replies && solution.replies.length > 0 && (
                                <div style={{ marginTop: '1.5rem', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Replies</h4>
                                    {solution.replies.map(reply => (
                                        <div key={reply._id} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{reply.userId.name}:</span>
                                                <span className="text-muted">{formatTimeAgo(reply.createdAt)}</span>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                {reply.replyText}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {solutions.length === 0 && (
                        <div className="text-center text-muted" style={{ padding: '2rem 0' }}>
                            No answers yet. Be the first to provide a solution!
                        </div>
                    )}
                </div>
            </div>

            {/* POST ANSWER SECTION */}
            <div className="mb-8">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Your Answer</h3>
                {user ? (
                    <form onSubmit={handlePostSolution}>
                        <textarea
                            className="form-textarea mb-4" rows="6"
                            value={newSolution} onChange={(e) => setNewSolution(e.target.value)}
                            placeholder="Write your solution..." required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }} disabled={isPostingSolution}>
                            {isPostingSolution ? 'Evaluating Answer...' : 'Post Answer'}
                        </button>
                    </form>
                ) : (
                    <div className="glass-panel text-center" style={{ padding: '2rem' }}>
                        <p className="mb-4">You need to log in to post an answer.</p>
                        <Link to="/login" className="btn btn-primary">Log In</Link>
                    </div>
                )}
            </div>

        </div>
    );
};

export default QuestionDetail;
