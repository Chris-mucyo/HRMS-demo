import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-stretch"
            style={{ fontFamily: 'var(--font-sans)', background: 'oklch(0.8452 0 0)' }}
        >
            {/* Left accent panel */}
            <div
                className="hidden lg:flex flex-col justify-between w-72 p-10"
                style={{
                    background: 'oklch(0.2393 0 0)',
                    borderRight: '3px solid oklch(0.5016 0.1887 27.4816)',
                }}
            >
                <div>
                    <div
                        className="text-xs font-bold uppercase tracking-widest mb-8"
                        style={{ color: 'oklch(0.5016 0.1887 27.4816)' }}
                    >
                        HRM System
                    </div>
                    <h1
                        className="text-4xl font-bold uppercase leading-tight"
                        style={{ color: 'oklch(0.9067 0 0)', letterSpacing: '0.05em' }}
                    >
                        Manage.<br />Track.<br />Grow.
                    </h1>
                </div>
                <p className="text-xs" style={{ color: 'oklch(0.55 0 0)' }}>
                    © {new Date().getFullYear()} HR Management System
                </p>
            </div>

            {/* Right login area */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="mb-8">
                        <div
                            className="text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'oklch(0.5016 0.1887 27.4816)' }}
                        >
                            Welcome back
                        </div>
                        <h2
                            className="text-3xl font-bold uppercase"
                            style={{ color: 'oklch(0.2393 0 0)', letterSpacing: '0.04em' }}
                        >
                            Sign In
                        </h2>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert-error mb-5">{error}</div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email-address" className="form-label">
                                Email Address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <Link
                                to="/forgot-password"
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: 'oklch(0.5016 0.1887 27.4816)' }}
                            >
                                Forgot Password?
                            </Link>
                            <Link
                                to="/register"
                                className="text-xs font-bold uppercase tracking-wider"
                                style={{ color: 'oklch(0.588 0.0993 245.7394)' }}
                            >
                                Create Account →
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-2"
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;