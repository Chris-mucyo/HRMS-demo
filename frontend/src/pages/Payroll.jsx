import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    CurrencyDollarIcon,
    DocumentArrowDownIcon,
    CalculatorIcon,
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

const Payroll = () => {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generatingPayroll, setGeneratingPayroll] = useState(false);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState({
        employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        overtimeHours: 0, bonus: 0, otherAllowance: 0, otherDeduction: 0, loanDeduction: 0,
    });
    const [stats, setStats] = useState({
        totalPayroll: 0, averageSalary: 0, pendingPayments: 0, paidPayments: 0,
    });

    const isHR = user?.role === 'hr_manager' || user?.role === 'admin';
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    useEffect(() => { fetchPayrolls(); if (isHR) fetchEmployees(); }, [filterMonth, filterYear]);

    const fetchPayrolls = async () => {
        try {
            setLoading(true);
            const params = { month: filterMonth, year: filterYear };
            const endpoint = isHR ? '/api/payroll' : '/api/payroll/my-payroll';
            const res = await api.get(endpoint, { params });
            const data = res.data.data;
            setPayrolls(data);
            if (data.length > 0) {
                const total = data.reduce((s, p) => s + p.netSalary, 0);
                setStats({
                    totalPayroll: total,
                    averageSalary: total / data.length,
                    pendingPayments: data.filter(p => p.paymentStatus === 'Pending').length,
                    paidPayments: data.filter(p => p.paymentStatus === 'Paid').length,
                });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleGeneratePayroll = async (e) => {
        e.preventDefault();
        setGeneratingPayroll(true);
        try {
            await api.post('/api/payroll', formData);
            setShowGenerateModal(false);
            resetForm();
            fetchPayrolls();
            alert('Payroll generated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating payroll');
        } finally { setGeneratingPayroll(false); }
    };

    const handleDownloadPayslip = async (payrollId) => {
        try {
            const res = await api.get(`/api/payroll/payslip/${payrollId}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { alert('Error downloading payslip'); }
    };

    const handleUpdateStatus = async (payrollId, status) => {
        try {
            await api.put(`/api/payroll/${payrollId}/status`, { status });
            fetchPayrolls();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const resetForm = () => {
        setFormData({
            employeeId: '', month: new Date().getMonth() + 1, year: currentYear,
            overtimeHours: 0, bonus: 0, otherAllowance: 0, otherDeduction: 0, loanDeduction: 0,
        });
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'Paid': return 'badge-green';
            case 'Processed': return 'badge-blue';
            case 'Pending': return 'badge-yellow';
            case 'Cancelled': return 'badge-red';
            default: return 'badge-gray';
        }
    };

    const statCards = [
        { label: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, Icon: CurrencyDollarIcon, color: 'oklch(0.5016 0.1887 27.4816)' },
        { label: 'Avg Salary', value: `$${stats.averageSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, Icon: BanknotesIcon, color: 'oklch(0.4955 0.0896 126.1858)' },
        { label: 'Pending', value: stats.pendingPayments, Icon: ClockIcon, color: 'oklch(0.7076 0.1975 46.4558)' },
        { label: 'Paid', value: stats.paidPayments, Icon: CheckCircleIcon, color: 'oklch(0.588 0.0993 245.7394)' },
    ];

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Header */}
            <div className="page-header flex items-start justify-between">
                <div>
                    <h1 className="page-title">Payroll</h1>
                    <p className="page-subtitle">Manage salaries, generate payslips, and track payments.</p>
                </div>
                {isHR && (
                    <button onClick={() => { resetForm(); setShowGenerateModal(true); }} className="btn-primary">
                        <CalculatorIcon className="h-4 w-4 mr-2" />
                        Generate Payroll
                    </button>
                )}
            </div>

            {/* Stat cards */}
            {isHR && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {statCards.map(({ label, value, Icon, color }) => (
                        <div key={label} className="stat-card p-4 flex items-center gap-3">
                            <div
                                className="stat-card-accent-bar"
                                style={{ background: color }}
                            />
                            <div
                                className="flex-shrink-0 flex items-center justify-center h-9 w-9"
                                style={{ background: color, border: '2px solid oklch(0.2393 0 0)' }}
                            >
                                <Icon className="h-4 w-4" style={{ color: 'oklch(1 0 0)' }} />
                            </div>
                            <div>
                                <p className="form-label">{label}</p>
                                <p className="text-xl font-bold" style={{ color: 'oklch(0.2393 0 0)' }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="card p-5">
                <p className="form-label mb-3">Period</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="form-label">Month</label>
                        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="input-field">
                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Year</label>
                        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="input-field">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
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
                            <th>Period</th>
                            <th>Basic Salary</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Overtime</th>
                            <th>Bonus</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {payrolls.map(p => (
                            <tr key={p._id} className="table-row">
                                {isHR && (
                                    <td className="font-medium" style={{ color: 'oklch(0.2393 0 0)' }}>
                                        {p.employee?.fullName || '—'}
                                    </td>
                                )}
                                <td>{MONTHS[(p.month || 1) - 1]} {p.year}</td>
                                <td>${p.basicSalary?.toLocaleString() || '—'}</td>
                                <td className="text-green-700">${p.totalAllowances?.toLocaleString() || '0'}</td>
                                <td className="text-red-700">-${p.totalDeductions?.toLocaleString() || '0'}</td>
                                <td>${p.overtimePay?.toLocaleString() || '0'}</td>
                                <td>${p.bonus?.toLocaleString() || '0'}</td>
                                <td className="font-bold" style={{ color: 'oklch(0.2393 0 0)' }}>
                                    ${p.netSalary?.toLocaleString()}
                                </td>
                                <td>
                                        <span className={`badge ${statusBadge(p.paymentStatus)}`}>
                                            {p.paymentStatus}
                                        </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownloadPayslip(p._id)}
                                            className="btn-accent py-1 px-2 text-xs"
                                            title="Download Payslip"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4" />
                                        </button>
                                        {isHR && p.paymentStatus === 'Pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(p._id, 'Paid')}
                                                className="btn-primary py-1 px-2 text-xs"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {payrolls.length === 0 && (
                            <tr>
                                <td colSpan={10} className="text-center py-10 text-sm" style={{ color: 'oklch(0.5 0 0)' }}>
                                    No payroll records for this period.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Generate Payroll Modal */}
            {showGenerateModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Generate Payroll</h3>
                            <button onClick={() => setShowGenerateModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <form onSubmit={handleGeneratePayroll}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Employee *</label>
                                    <select value={formData.employeeId}
                                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                            required className="input-field">
                                        <option value="">Select Employee</option>
                                        {employees.map(e => (
                                            <option key={e._id} value={e._id}>{e.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label">Month *</label>
                                        <select value={formData.month}
                                                onChange={e => setFormData({ ...formData, month: e.target.value })}
                                                className="input-field">
                                            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Year *</label>
                                        <select value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                                className="input-field">
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {[
                                    ['Overtime Hours', 'overtimeHours'],
                                    ['Bonus ($)', 'bonus'],
                                    ['Other Allowance ($)', 'otherAllowance'],
                                    ['Other Deduction ($)', 'otherDeduction'],
                                    ['Loan Deduction ($)', 'loanDeduction'],
                                ].map(([label, key]) => (
                                    <div key={key}>
                                        <label className="form-label">{label}</label>
                                        <input type="number" min="0" value={formData[key]}
                                               onChange={e => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                                               className="input-field" />
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={generatingPayroll} className="btn-primary">
                                    {generatingPayroll ? 'Generating…' : 'Generate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;