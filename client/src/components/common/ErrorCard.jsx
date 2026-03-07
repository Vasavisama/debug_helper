import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import './ErrorCard.css';

const ErrorCard = ({ error }) => {
    return (
        <Link to={`/question/${error._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div className="error-card glass-panel" style={{ cursor: 'pointer' }}>
                <div className="error-card-header">
                    <span className="error-title">
                        {error.title}
                    </span>
                    {error.solved && (
                        <span className="badge badge-success ml-auto">Solved</span>
                    )}
                </div>

                <p className="error-description">
                    {error.description.length > 150
                        ? error.description.substring(0, 150) + '...'
                        : error.description}
                </p>

                <div className="error-tags">
                    <span className="badge tech-badge">{error.technology}</span>
                    {error.tags.map((tag, index) => (
                        <span key={index} className="badge">#{tag}</span>
                    ))}
                </div>

                <div className="error-card-footer">
                    <div className="error-stats" style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span className="stat">
                            ⬆ {error.votes}
                        </span>
                        <span className="stat">
                            💬 {error.answerCount || 0} answers
                        </span>

                        <span className="stat text-muted ml-auto" style={{ fontSize: '0.85rem' }}>
                            Posted by <span style={{ color: 'var(--text-primary)' }}>{error.userId.name}</span> • {formatTimeAgo(error.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ErrorCard;
