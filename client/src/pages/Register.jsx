import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-8 animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="text-center mb-6" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Join DebugHelper</h2>
                <p className="text-center text-muted mb-6" style={{ marginTop: '-1rem', fontSize: '0.95rem' }}>Solve problems faster, together.</p>

                {error && <div className="badge mb-4" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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

                    <div className="form-group">
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

                    <div className="form-group mb-6">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                        {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center mt-6 text-muted" style={{ fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
