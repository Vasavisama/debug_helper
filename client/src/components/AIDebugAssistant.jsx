import React, { useState, useRef } from 'react';
import api from '../services/api';
import './AIDebugAssistant.css';

const AIDebugAssistant = () => {
    const [errorText, setErrorText] = useState('');
    const [mode, setMode] = useState('explanation');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const responseRef = useRef(null);

    const handleAskAI = async () => {
        if (!errorText.trim()) {
            setError('Please paste an error message first.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');
        setCopied(false);

        try {
            const res = await api.post('/ai/debug', { errorText, mode });
            setResponse(res.data.answer);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get AI response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setErrorText('');
        setResponse('');
        setError('');
        setCopied(false);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(response);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = response;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Simple markdown-to-HTML renderer
    const renderMarkdown = (text) => {
        if (!text) return '';

        let html = text
            // Code blocks (```...```)
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
                return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`;
            })
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Bullet lists
            .replace(/^[•\-\*] (.+)$/gm, '<li>$1</li>')
            // Wrap consecutive <li> in <ul>
            .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
            // Paragraphs (double newline)
            .replace(/\n\n/g, '</p><p>')
            // Single newlines that aren't inside tags
            .replace(/\n/g, '<br/>');

        return `<p>${html}</p>`;
    };

    return (
        <div className="ai-assistant glass-panel" style={{ padding: '1.25rem' }}>
            <div className="ai-assistant-header">
                <div className="ai-icon">🤖</div>
                <h3>AI Debug Assistant</h3>
            </div>

            <div className="ai-controls">
                <select
                    className="form-select"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                >
                    <option value="explanation">🔍 Explanation Only</option>
                    <option value="solution">💡 Explanation + Solution</option>
                </select>

                <textarea
                    className="form-textarea"
                    placeholder="Paste your error message here..."
                    value={errorText}
                    onChange={(e) => setErrorText(e.target.value)}
                    rows={5}
                />

                <div className="ai-btn-row">
                    <button
                        className="btn btn-ai"
                        onClick={handleAskAI}
                        disabled={loading || !errorText.trim()}
                    >
                        {loading ? 'Analyzing...' : '✨ Ask AI'}
                    </button>
                    <button
                        className="btn btn-clear"
                        onClick={handleClear}
                        disabled={loading}
                    >
                        ✕ Clear
                    </button>
                </div>
            </div>

            {error && <div className="ai-error">{error}</div>}

            {loading && (
                <div className="ai-loading">
                    <div className="ai-loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                    <p>Analyzing your error...</p>
                </div>
            )}

            {response && !loading && (
                <div className="ai-response-container" ref={responseRef}>
                    <div className="ai-response-header">
                        <h4>✨ AI Response</h4>
                        <button
                            className={`btn-copy ${copied ? 'copied' : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? '✓ Copied' : '📋 Copy'}
                        </button>
                    </div>
                    <div
                        className="ai-response-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(response) }}
                    />
                </div>
            )}
        </div>
    );
};

export default AIDebugAssistant;
