import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    StarIcon,
    ChartBarIcon,
    PencilIcon,
    EyeIcon,
    CheckIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

const Performance = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [formData, setFormData] = useState({
        employee: '', productivity: 3, quality: 3, attendance: 3,
        teamwork: 3, communication: 3, comments: '',
        strengths: [''], improvements: [''],
        goals: [{ description: '', targetDate: '', status: 'Not Started' }],
    });

    const isHR = user?.role === 'hr_manager' || user?.role === 'admin';
    const isEmployee = user?.role === 'employee';

    useEffect(() => { fetchReviews(); if (isHR) fetchEmployees(); }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const endpoint = isHR ? '/api/performance' : '/api/performance/my-reviews';
            const res = await api.get(endpoint);
            setReviews(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const reviewData = {
                ...formData,
                ratings: {
                    productivity: formData.productivity, quality: formData.quality,
                    attendance: formData.attendance, teamwork: formData.teamwork,
                    communication: formData.communication,
                },
                strengths: formData.strengths.filter(s => s.trim()),
                improvements: formData.improvements.filter(s => s.trim()),
                goals: formData.goals.filter(g => g.description.trim()),
            };
            if (selectedReview) {
                await api.put(`/api/performance/${selectedReview._id}`, reviewData);
            } else {
                await api.post('/api/performance', reviewData);
            }
            setShowModal(false);
            resetForm();
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving review');
        }
    };

    const handleAcknowledge = async (reviewId, feedback) => {
        try {
            await api.put(`/api/performance/${reviewId}/acknowledge`, {
                feedback: feedback || 'Acknowledged',
            });
            fetchReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'Error acknowledging review');
        }
    };

    const resetForm = () => {
        setSelectedReview(null);
        setFormData({
            employee: '', productivity: 3, quality: 3, attendance: 3,
            teamwork: 3, communication: 3, comments: '',
            strengths: [''], improvements: [''],
            goals: [{ description: '', targetDate: '', status: 'Not Started' }],
        });
    };

    const handleView = (review) => { setSelectedReview(review); setViewModal(true); };

    const handleEdit = (review) => {
        setSelectedReview(review);
        setFormData({
            employee: review.employee?._id || review.employee,
            productivity: review.ratings?.productivity || 3,
            quality: review.ratings?.quality || 3,
            attendance: review.ratings?.attendance || 3,
            teamwork: review.ratings?.teamwork || 3,
            communication: review.ratings?.communication || 3,
            comments: review.comments || '',
            strengths: review.strengths?.length ? review.strengths : [''],
            improvements: review.improvements?.length ? review.improvements : [''],
            goals: review.goals?.length ? review.goals : [{ description: '', targetDate: '', status: 'Not Started' }],
        });
        setShowModal(true);
    };

    const RatingBar = ({ value, max = 5, color = 'oklch(0.5016 0.1887 27.4816)' }) => (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5" style={{ background: 'oklch(0.65 0 0)' }}>
                <div style={{ width: `${(value / max) * 100}%`, background: color, height: '100%' }} />
            </div>
            <span className="text-xs font-bold w-6" style={{ color: 'oklch(0.3 0 0)' }}>{value}</span>
        </div>
    );

    const Stars = ({ rating }) => (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                    key={i}
                    className="h-4 w-4"
                    style={{
                        color: i < rating ? 'oklch(0.7076 0.1975 46.4558)' : 'oklch(0.65 0 0)',
                        fill: i < rating ? 'oklch(0.7076 0.1975 46.4558)' : 'none',
                    }}
                />
            ))}
        </div>
    );

    const ratingColor = (r) => {
        if (r >= 4) return 'oklch(0.4 0.1 130)';
        if (r >= 3) return 'oklch(0.5 0.12 80)';
        return 'oklch(0.5 0.15 30)';
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'Completed': return 'badge-green';
            case 'Acknowledged': return 'badge-blue';
            case 'Draft': return 'badge-yellow';
            default: return 'badge-gray';
        }
    };

    const RATING_FIELDS = ['productivity', 'quality', 'attendance', 'teamwork', 'communication'];
    const RATING_COLORS = [
        'oklch(0.5016 0.1887 27.4816)',
        'oklch(0.4955 0.0896 126.1858)',
        'oklch(0.588 0.0993 245.7394)',
        'oklch(0.7076 0.1975 46.4558)',
        'oklch(0.5656 0.0431 40.43)',
    ];

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="spinner" /></div>;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Header */}
            <div className="page-header flex items-start justify-between">
                <div>
                    <h1 className="page-title">Performance</h1>
                    <p className="page-subtitle">Track and evaluate employee performance reviews.</p>
                </div>
                {isHR && (
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        New Review
                    </button>
                )}
            </div>

            {/* Review cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review, i) => (
                    <div key={review._id} className="card relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ background: RATING_COLORS[i % RATING_COLORS.length] }}
                        />
                        <div className="p-5 pt-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3
                                        className="text-sm font-bold uppercase tracking-wide"
                                        style={{ color: 'oklch(0.2393 0 0)' }}
                                    >
                                        {review.employee?.fullName || 'Employee Review'}
                                    </h3>
                                    {review.employee?.position && (
                                        <p className="text-xs mt-0.5" style={{ color: 'oklch(0.5 0 0)' }}>
                                            {review.employee.position}
                                        </p>
                                    )}
                                </div>
                                <span className={`badge ${statusBadge(review.status)}`}>{review.status}</span>
                            </div>

                            {/* Overall rating */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="form-label">Overall</span>
                                <div className="flex items-center gap-2">
                                    <Stars rating={Math.round(review.overallRating)} />
                                    <span
                                        className="text-base font-bold"
                                        style={{ color: ratingColor(review.overallRating) }}
                                    >
                                        {review.overallRating?.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Rating bars */}
                            <div className="space-y-1.5">
                                {RATING_FIELDS.map((field, fi) => (
                                    <div key={field} className="flex items-center gap-2">
                                        <span
                                            className="text-xs w-24 capitalize"
                                            style={{ color: 'oklch(0.45 0 0)' }}
                                        >
                                            {field}
                                        </span>
                                        <RatingBar
                                            value={review.ratings?.[field] || 0}
                                            color={RATING_COLORS[fi % RATING_COLORS.length]}
                                        />
                                    </div>
                                ))}
                            </div>

                            {review.comments && (
                                <p
                                    className="mt-3 text-xs line-clamp-2"
                                    style={{ color: 'oklch(0.45 0 0)' }}
                                >
                                    {review.comments}
                                </p>
                            )}

                            <div className="mt-4 flex gap-2">
                                <button onClick={() => handleView(review)} className="btn-secondary flex-1 py-1.5 text-xs">
                                    <EyeIcon className="h-3.5 w-3.5 mr-1" /> View
                                </button>
                                {isHR && (
                                    <button onClick={() => handleEdit(review)} className="btn-secondary flex-1 py-1.5 text-xs">
                                        <PencilIcon className="h-3.5 w-3.5 mr-1" /> Edit
                                    </button>
                                )}
                                {isEmployee && review.status === 'Completed' && (
                                    <button
                                        onClick={() => {
                                            const fb = prompt('Enter your feedback (optional):');
                                            if (fb !== null) handleAcknowledge(review._id, fb);
                                        }}
                                        className="btn-primary flex-1 py-1.5 text-xs"
                                    >
                                        <CheckIcon className="h-3.5 w-3.5 mr-1" /> Acknowledge
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div
                        className="col-span-3 text-center py-16 text-sm"
                        style={{ color: 'oklch(0.5 0 0)' }}
                    >
                        No performance reviews found.
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewModal && selectedReview && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Performance Review</h3>
                            <button onClick={() => setViewModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <div className="modal-body space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="form-label">Employee</p>
                                    <p className="font-semibold text-sm">{selectedReview.employee?.fullName}</p>
                                </div>
                                <div>
                                    <p className="form-label">Reviewer</p>
                                    <p className="font-semibold text-sm">{selectedReview.reviewer?.fullName}</p>
                                </div>
                                <div>
                                    <p className="form-label">Overall Rating</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold" style={{ color: ratingColor(selectedReview.overallRating) }}>
                                            {selectedReview.overallRating?.toFixed(1)}
                                        </span>
                                        <Stars rating={Math.round(selectedReview.overallRating)} />
                                    </div>
                                </div>
                                <div>
                                    <p className="form-label">Status</p>
                                    <span className={`badge ${statusBadge(selectedReview.status)}`}>{selectedReview.status}</span>
                                </div>
                            </div>

                            <div>
                                <p className="form-label mb-2">Detailed Ratings</p>
                                <div className="space-y-2">
                                    {RATING_FIELDS.map((field, fi) => (
                                        <div key={field} className="flex items-center gap-3">
                                            <span className="text-xs capitalize w-24" style={{ color: 'oklch(0.45 0 0)' }}>{field}</span>
                                            <RatingBar value={selectedReview.ratings?.[field] || 0} color={RATING_COLORS[fi % RATING_COLORS.length]} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedReview.strengths?.length > 0 && (
                                <div>
                                    <p className="form-label mb-1">Strengths</p>
                                    <ul className="text-sm space-y-0.5" style={{ color: 'oklch(0.35 0.08 130)' }}>
                                        {selectedReview.strengths.map((s, i) => <li key={i}>+ {s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {selectedReview.improvements?.length > 0 && (
                                <div>
                                    <p className="form-label mb-1">Areas for Improvement</p>
                                    <ul className="text-sm space-y-0.5" style={{ color: 'oklch(0.45 0.12 46)' }}>
                                        {selectedReview.improvements.map((s, i) => <li key={i}>→ {s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {selectedReview.comments && (
                                <div>
                                    <p className="form-label mb-1">Comments</p>
                                    <p className="text-sm" style={{ color: 'oklch(0.4 0 0)' }}>{selectedReview.comments}</p>
                                </div>
                            )}

                            {selectedReview.goals?.length > 0 && (
                                <div>
                                    <p className="form-label mb-2">Goals</p>
                                    <div className="space-y-2">
                                        {selectedReview.goals.map((goal, i) => (
                                            <div key={i} className="p-3" style={{ background: 'oklch(0.82 0 0)', border: '1.5px solid oklch(0.55 0 0)' }}>
                                                <p className="text-sm font-medium">{goal.description}</p>
                                                <div className="flex justify-between text-xs mt-1" style={{ color: 'oklch(0.5 0 0)' }}>
                                                    <span>Target: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '—'}</span>
                                                    <span className="font-bold" style={{
                                                        color: goal.status === 'Completed'
                                                            ? 'oklch(0.4 0.1 130)'
                                                            : goal.status === 'In Progress'
                                                                ? 'oklch(0.4 0.09 245)'
                                                                : 'oklch(0.5 0 0)'
                                                    }}>{goal.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setViewModal(false)} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{selectedReview ? 'Edit Review' : 'New Review'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {isHR && (
                                    <div>
                                        <label className="form-label">Employee *</label>
                                        <select value={formData.employee}
                                                onChange={e => setFormData({ ...formData, employee: e.target.value })}
                                                required className="input-field">
                                            <option value="">Select Employee</option>
                                            {employees.map(e => (
                                                <option key={e._id} value={e._id}>{e.fullName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <p className="form-label mb-2">Ratings (1–5)</p>
                                    <div className="space-y-3">
                                        {RATING_FIELDS.map((field, fi) => (
                                            <div key={field} className="flex items-center gap-4">
                                                <span
                                                    className="text-xs capitalize w-28"
                                                    style={{ color: 'oklch(0.35 0 0)' }}
                                                >
                                                    {field}
                                                </span>
                                                <input
                                                    type="range" min="1" max="5" step="1"
                                                    value={formData[field]}
                                                    onChange={e => setFormData({ ...formData, [field]: parseInt(e.target.value) })}
                                                    className="flex-1"
                                                    style={{ accentColor: RATING_COLORS[fi % RATING_COLORS.length] }}
                                                />
                                                <span className="text-sm font-bold w-4" style={{ color: RATING_COLORS[fi % RATING_COLORS.length] }}>
                                                    {formData[field]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">Comments</label>
                                    <textarea
                                        value={formData.comments}
                                        onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                        rows={3} className="input-field"
                                        placeholder="Overall performance comments…"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Strengths</label>
                                    {formData.strengths.map((s, i) => (
                                        <div key={i} className="flex gap-2 mt-1">
                                            <input
                                                type="text" value={s}
                                                onChange={e => {
                                                    const arr = [...formData.strengths];
                                                    arr[i] = e.target.value;
                                                    setFormData({ ...formData, strengths: arr });
                                                }}
                                                className="input-field mt-0 flex-1"
                                                placeholder={`Strength ${i + 1}`}
                                            />
                                            {i === formData.strengths.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, strengths: [...formData.strengths, ''] })}
                                                    className="btn-accent py-1 px-2 text-xs mt-1"
                                                >+</button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="form-label">Areas for Improvement</label>
                                    {formData.improvements.map((s, i) => (
                                        <div key={i} className="flex gap-2 mt-1">
                                            <input
                                                type="text" value={s}
                                                onChange={e => {
                                                    const arr = [...formData.improvements];
                                                    arr[i] = e.target.value;
                                                    setFormData({ ...formData, improvements: arr });
                                                }}
                                                className="input-field mt-0 flex-1"
                                                placeholder={`Improvement ${i + 1}`}
                                            />
                                            {i === formData.improvements.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, improvements: [...formData.improvements, ''] })}
                                                    className="btn-accent py-1 px-2 text-xs mt-1"
                                                >+</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedReview ? 'Update' : 'Create Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Performance;