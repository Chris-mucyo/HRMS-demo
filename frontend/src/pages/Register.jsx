import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee'
    });
    const [loading, setLoading] = useState(false);
    const { register, error, setError } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
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
                    borderRight: '3px solid oklch(0.4955 0.0896 126.1858)',
                }}
            >
                <div>
                    <div
                        className="text-xs font-bold uppercase tracking-widest mb-8"
                        style={{ color: 'oklch(0.6423 0.1467 133)' }}
                    >
                        HRM System
                    </div>
                    <h1
                        className="text-4xl font-bold uppercase leading-tight"
                        style={{ color: 'oklch(0.9067 0 0)', letterSpacing: '0.05em' }}
                    >
                        Join.<br />Onboard.<br />Succeed.
                    </h1>
                </div>
                <p className="text-xs" style={{ color: 'oklch(0.55 0 0)' }}>
                    © {new Date().getFullYear()} HR Management System
                </p>
            </div>

            {/* Right register area */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <div
                            className="text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'oklch(0.4955 0.0896 126.1858)' }}
                        >
                            New account
                        </div>
                        <h2
                            className="text-3xl font-bold uppercase"
                            style={{ color: 'oklch(0.2393 0 0)', letterSpacing: '0.04em' }}
                        >
                            Register
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: 'oklch(0.4091 0 0)' }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-bold uppercase text-xs tracking-wider"
                                style={{ color: 'oklch(0.5016 0.1887 27.4816)' }}
                            >
                                Sign In →
                            </Link>
                        </p>
                    </div>

                    {error && <div className="alert-error mb-5">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Jane Doe' },
                            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@company.com' },
                            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                            { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
                        ].map(({ id, label, type, placeholder }) => (
                            <div key={id}>
                                <label htmlFor={id} className="form-label">{label}</label>
                                <input
                                    id={id}
                                    name={id}
                                    type={type}
                                    required
                                    value={formData[id]}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}

                        <div>
                            <label htmlFor="role" className="form-label">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="employee">Employee</option>
                                <option value="hr_manager">HR Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-2"
                            style={{ background: 'oklch(0.4955 0.0896 126.1858)', borderColor: 'oklch(0.4955 0.0896 126.1858)' }}
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;