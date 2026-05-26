import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    UserGroupIcon,
    ClockIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const reportTypes = [
    {
        id: 'employees',
        name: 'Employee Report',
        description: 'Full employee details, department, status, contacts.',
        Icon: UserGroupIcon,
        color: 'oklch(0.5016 0.1887 27.4816)',
    },
    {
        id: 'attendance',
        name: 'Attendance Report',
        description: 'Daily check-in/out times, late arrivals, overtime.',
        Icon: ClockIcon,
        color: 'oklch(0.4955 0.0896 126.1858)',
    },
    {
        id: 'leaves',
        name: 'Leave Report',
        description: 'Leave applications, approvals, rejections, balances.',
        Icon: CalendarIcon,
        color: 'oklch(0.7076 0.1975 46.4558)',
    },
    {
        id: 'payroll',
        name: 'Payroll Report',
        description: 'Salaries, deductions, allowances, payment status.',
        Icon: CurrencyDollarIcon,
        color: 'oklch(0.588 0.0993 245.7394)',
    },
    {
        id: 'performance',
        name: 'Performance Report',
        description: 'Ratings, reviews, achievements, improvement areas.',
        Icon: ChartBarIcon,
        color: 'oklch(0.5656 0.0431 40.43)',
    },
];

const Reports = () => {
    const { user } = useAuth();
    const [generating, setGenerating] = useState(false);
    const [selectedReport, setSelectedReport] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        department: '',
        status: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const handleGenerateReport = async (reportType) => {
        setGenerating(true);
        setSelectedReport(reportType);
        try {
            const params = {};
            switch (reportType) {
                case 'employees':
                    if (filters.department) params.department = filters.department;
                    if (filters.status) params.status = filters.status;
                    break;
                case 'attendance':
                    if (filters.startDate) params.startDate = filters.startDate;
                    if (filters.endDate) params.endDate = filters.endDate;
                    if (filters.department) params.department = filters.department;
                    break;
                case 'leaves':
                    if (filters.startDate) params.startDate = filters.startDate;
                    if (filters.endDate) params.endDate = filters.endDate;
                    if (filters.status) params.status = filters.status;
                    break;
                case 'payroll':
                    if (filters.month) params.month = filters.month;
                    if (filters.year) params.year = filters.year;
                    if (filters.department) params.department = filters.department;
                    break;
                case 'performance':
                    if (filters.startDate) params.startDate = filters.startDate;
                    if (filters.endDate) params.endDate = filters.endDate;
                    if (filters.department) params.department = filters.department;
                    break;
                default: break;
            }
            const response = await api.get(`/api/reports/${reportType}`, {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_report_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            alert('Error generating report');
        } finally {
            setGenerating(false);
            setSelectedReport('');
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Reports</h1>
                <p className="page-subtitle">Generate and download HR reports in PDF format.</p>
            </div>

            {/* Filters */}
            <div className="card p-5">
                <p className="form-label mb-3">Report Filters</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="form-label">Start Date</label>
                        <input type="date" value={filters.startDate}
                               onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="form-label">End Date</label>
                        <input type="date" value={filters.endDate}
                               onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                               className="input-field" />
                    </div>
                    <div>
                        <label className="form-label">Status</label>
                        <select value={filters.status}
                                onChange={e => setFilters({ ...filters, status: e.target.value })}
                                className="input-field">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Department</label>
                        <select value={filters.department}
                                onChange={e => setFilters({ ...filters, department: e.target.value })}
                                className="input-field">
                            <option value="">All Departments</option>
                            {['IT', 'Finance', 'Human Resource', 'Marketing', 'Sales'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Report cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map(({ id, name, description, Icon, color }) => (
                    <div key={id} className="card relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
                        <div className="p-5 pt-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex-shrink-0 flex items-center justify-center h-10 w-10"
                                    style={{
                                        background: color,
                                        border: '2px solid oklch(0.2393 0 0)',
                                    }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: 'oklch(1 0 0)' }} />
                                </div>
                                <div>
                                    <h3
                                        className="text-sm font-bold uppercase tracking-wider"
                                        style={{ color: 'oklch(0.2393 0 0)' }}
                                    >
                                        {name}
                                    </h3>
                                    <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0 0)' }}>
                                        {description}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGenerateReport(id)}
                                disabled={generating}
                                className="btn-primary w-full mt-5"
                                style={{ background: color, borderColor: color }}
                            >
                                {generating && selectedReport === id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                        Generating…
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <DocumentArrowDownIcon className="h-4 w-4" />
                                        Download PDF
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info strip */}
            <div className="card p-5">
                <p
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: 'oklch(0.2393 0 0)' }}
                >
                    Report Format
                </p>
                <p className="text-sm" style={{ color: 'oklch(0.45 0 0)' }}>
                    All reports are generated as PDF files and can be downloaded immediately. Apply filters above
                    before generating to narrow the data included in each report.
                </p>
            </div>
        </div>
    );
};

export default Reports;