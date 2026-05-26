import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [formData, setFormData] = useState({
        leaveType: 'Annual', startDate: '', endDate: '', reason: '',
    });
    const [leaveStats] = useState({ annual: 20, sick: 10, maternity: 90, emergency: 5 });

    const isHR = user?.role === 'hr_manager' || user?.role === 'admin';

    useEffect(() => { fetchLeaves(); }, [filterStatus, filterType]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterType) params.leaveType = filterType;
            const endpoint = isHR ? '/api/leaves' : '/api/leaves/my-leaves';
            const res = await api.get(endpoint, { params });
            setLeaves(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/leaves', formData);
            setShowApplyModal(false);
            setFormData({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Error applying for leave');
        }
    };

    const handleApproveLeave = async (id) => {
        try {
            await api.put(`/api/leaves/${id}/approve`);
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving leave');
        }
    };

    const handleRejectLeave = async () => {
        try {
            await api.put(`/api/leaves/${selectedLeave._id}/reject`, { rejectionReason });
            setShowRejectModal(false);
            setSelectedLeave(null);
            setRejectionReason('');
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting leave');
        }
    };

    const handleCancelLeave = async (id) => {
        try {
            await api.put(`/api/leaves/${id}/cancel`);
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling leave');
        }
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'Approved': return 'badge-green';
            case 'Pending': return 'badge-yellow';
            case 'Rejected': return 'badge-red';
            case 'Cancelled': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    const typeBadge = (t) => {
        switch (t) {
            case 'Annual': return 'badge-blue';
            case 'Sick': return 'badge-red';
            case 'Maternity': return 'badge-green';
            case 'Emergency': return 'badge-yellow';
            default: return 'badge-gray';
        }
    };

    const statCards = [
        { label: 'Annual Leave', used: 5, total: leaveStats.annual, color: 'oklch(0.588 0.0993 245.7394)' },
        { label: 'Sick Leave', used: 2, total: leaveStats.sick, color: 'oklch(0.5016 0.1887 27.4816)' },
        { label: 'Emergency', used: 1, total: leaveStats.emergency, color: 'oklch(0.7076 0.1975 46.4558)' },
        { label: 'Maternity', used: 0, total: leaveStats.maternity, color: 'oklch(0.4955 0.0896 126.1858)' },
    ];

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Header */}
            <div className="page-header flex items-start justify-between">
                <div>
                    <h1 className="page-title">Leave Management</h1>
                    <p className="page-subtitle">Apply for leave and manage leave requests.</p>
                </div>
                {!isHR && (
                    <button onClick={() => setShowApplyModal(true)} className="btn-primary">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Apply for Leave
                    </button>
                )}
            </div>

            {/* Leave quota cards */}
            {!isHR && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {statCards.map(({ label, used, total, color }) => (
                        <div key={label} className="card p-4">
                            <p className="form-label">{label}</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: 'oklch(0.2393 0 0)' }}>
                                {total - used}
                                <span className="text-sm font-normal ml-1" style={{ color: 'oklch(0.5 0 0)' }}>/ {total} days</span>
                            </p>
                            <div className="mt-2 h-1.5 w-full" style={{ background: 'oklch(0.65 0 0)' }}>
                                <div
                                    className="h-full"
                                    style={{
                                        width: `${(used / total) * 100}%`,
                                        background: color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="card p-5">
                <p className="form-label mb-3">Filters</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="form-label">Status</label>
                        <select value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)} className="input-field">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Leave Type</label>
                        <select value={filterType}
                                onChange={e => setFilterType(e.target.value)} className="input-field">
                            <option value="">All Types</option>
                            <option value="Annual">Annual</option>
                            <option value="Sick">Sick</option>
                            <option value="Maternity">Maternity</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="spinner" /></div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="table-header">
                        <tr>
                            {isHR && <th>Employee</th>}
                            <th>Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Days</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leaves.map(leave => (
                            <tr key={leave._id} className="table-row">
                                {isHR && (
                                    <td className="font-medium" style={{ color: 'oklch(0.2393 0 0)' }}>
                                        {leave.employee?.fullName || '—'}
                                    </td>
                                )}
                                <td><span className={`badge ${typeBadge(leave.leaveType)}`}>{leave.leaveType}</span></td>
                                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                <td className="font-semibold">{leave.totalDays}</td>
                                <td><span className={`badge ${statusBadge(leave.status)}`}>{leave.status}</span></td>
                                <td className="max-w-xs truncate" style={{ color: 'oklch(0.45 0 0)' }}>
                                    {leave.reason}
                                </td>
                                <td>
                                    <div className="flex gap-2 items-center">
                                        {isHR && leave.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApproveLeave(leave._id)}
                                                    className="p-1 transition-opacity hover:opacity-60"
                                                    style={{ color: 'oklch(0.4 0.1 130)' }}
                                                    title="Approve"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedLeave(leave); setShowRejectModal(true); }}
                                                    className="p-1 transition-opacity hover:opacity-60"
                                                    style={{ color: 'oklch(0.55 0.15 30)' }}
                                                    title="Reject"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                        {!isHR && leave.status === 'Pending' && (
                                            <button
                                                onClick={() => handleCancelLeave(leave._id)}
                                                className="text-xs btn-danger py-1 px-2"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {leave.rejectionReason && (
                                            <span className="text-xs" style={{ color: 'oklch(0.5 0.15 30)' }}>
                                                    {leave.rejectionReason}
                                                </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leaves.length === 0 && (
                            <tr>
                                <td colSpan={8} className="text-center py-10 text-sm" style={{ color: 'oklch(0.5 0 0)' }}>
                                    No leave records found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Apply for Leave</h3>
                            <button onClick={() => setShowApplyModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <form onSubmit={handleApplyLeave}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Leave Type *</label>
                                    <select value={formData.leaveType}
                                            onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                                            required className="input-field">
                                        <option value="Annual">Annual Leave</option>
                                        <option value="Sick">Sick Leave</option>
                                        <option value="Maternity">Maternity Leave</option>
                                        <option value="Emergency">Emergency Leave</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Start Date *</label>
                                    <input type="date" required value={formData.startDate}
                                           onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                           min={new Date().toISOString().split('T')[0]}
                                           className="input-field" />
                                </div>
                                <div>
                                    <label className="form-label">End Date *</label>
                                    <input type="date" required value={formData.endDate}
                                           onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                           min={formData.startDate || new Date().toISOString().split('T')[0]}
                                           className="input-field" />
                                </div>
                                <div>
                                    <label className="form-label">Reason *</label>
                                    <textarea value={formData.reason}
                                              onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                              required rows={4} className="input-field"
                                              placeholder="Provide a reason for your leave request…" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">Submit Application</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header" style={{ background: 'oklch(0.6 0.15 30)' }}>
                            <h3 className="modal-title">Reject Leave Request</h3>
                            <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="hover:opacity-60">✕</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="form-label">Reason for Rejection *</label>
                                <textarea value={rejectionReason}
                                          onChange={e => setRejectionReason(e.target.value)}
                                          required rows={4} className="input-field"
                                          placeholder="Explain why this leave request is being rejected…" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleRejectLeave} disabled={!rejectionReason} className="btn-danger">
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;