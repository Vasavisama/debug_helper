import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                // Server responded with an error status
                setError(err.response.data?.message || 'Login failed. Please check your credentials.');
            } else if (err.request) {
                // No response received — server is likely not running
                setError('Cannot connect to server. Please make sure the backend server is running.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-8 animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="text-center mb-6" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>

                {error && <div className="badge mb-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="developer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                        {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : 'Login'}
                    </button>
                </form>

                <p className="text-center mt-6 text-muted" style={{ fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
