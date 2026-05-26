import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkedInToday, setCheckedInToday] = useState(false);
    const [checkedOutToday, setCheckedOutToday] = useState(false);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [employees, setEmployees] = useState([]);
    const [viewMode, setViewMode] = useState('my');
    const [todayAttendance, setTodayAttendance] = useState(null);

    const isHR = user?.role === 'hr_manager' || user?.role === 'admin';

    useEffect(() => {
        fetchTodayAttendance();
        if (isHR) { fetchEmployees(); fetchAllAttendance(); }
        else { fetchMyAttendance(); }
    }, [filterStartDate, filterEndDate, filterEmployee, filterStatus]);

    const fetchTodayAttendance = async () => {
        try {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
            const res = await api.get('/api/attendance/my-attendance', {
                params: { startDate: today, endDate: endOfDay },
            });
            const todayRecord = res.data.data.find(r =>
                new Date(r.date).toDateString() === today.toDateString()
            );
            if (todayRecord) {
                setTodayAttendance(todayRecord);
                setCheckedInToday(!!todayRecord.checkIn?.time);
                setCheckedOutToday(!!todayRecord.checkOut?.time);
            } else {
                setTodayAttendance(null);
                setCheckedInToday(false);
                setCheckedOutToday(false);
            }
        } catch (err) { console.error(err); }
    };

    const fetchMyAttendance = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;
            if (filterStatus) params.status = filterStatus;
            const res = await api.get('/api/attendance/my-attendance', { params });
            setMyAttendance(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchAllAttendance = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;
            if (filterEmployee) params.employee = filterEmployee;
            if (filterStatus) params.status = filterStatus;
            const res = await api.get('/api/attendance', { params });
            setAttendanceRecords(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleCheckIn = async () => {
        setCheckingIn(true);
        try {
            await api.post('/api/attendance/checkin', { location: 'Office', method: 'Manual' });
            fetchTodayAttendance();
            if (isHR) fetchAllAttendance(); else fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Error checking in');
        } finally { setCheckingIn(false); }
    };

    const handleCheckOut = async () => {
        setCheckingOut(true);
        try {
            await api.post('/api/attendance/checkout', { location: 'Office' });
            fetchTodayAttendance();
            if (isHR) fetchAllAttendance(); else fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Error checking out');
        } finally { setCheckingOut(false); }
    };

    const statusBadgeClass = (status) => {
        switch (status) {
            case 'Present': return 'badge-green';
            case 'Late': return 'badge-yellow';
            case 'Absent': return 'badge-red';
            case 'Half Day': return 'badge-yellow';
            default: return 'badge-gray';
        }
    };

    const calcHours = (record) => {
        if (record.checkIn?.time && record.checkOut?.time) {
            const h = (new Date(record.checkOut.time) - new Date(record.checkIn.time)) / 3600000;
            return h.toFixed(2) + 'h';
        }
        return '—';
    };

    const records = viewMode === 'my' ? myAttendance : attendanceRecords;

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Page header */}
            <div className="page-header">
                <h1 className="page-title">Attendance</h1>
                <p className="page-subtitle">Track check-ins, check-outs, and attendance history.</p>
            </div>

            {/* Today's punch card */}
            <div className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="form-label mb-1">Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <div className="flex gap-6 mt-2">
                            <div>
                                <p className="form-label">Check In</p>
                                <p className="text-lg font-bold" style={{ color: 'oklch(0.2393 0 0)' }}>
                                    {todayAttendance?.checkIn?.time
                                        ? new Date(todayAttendance.checkIn.time).toLocaleTimeString()
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="form-label">Check Out</p>
                                <p className="text-lg font-bold" style={{ color: 'oklch(0.2393 0 0)' }}>
                                    {todayAttendance?.checkOut?.time
                                        ? new Date(todayAttendance.checkOut.time).toLocaleTimeString()
                                        : '—'}
                                </p>
                            </div>
                            {todayAttendance && (
                                <div>
                                    <p className="form-label">Hours</p>
                                    <p className="text-lg font-bold" style={{ color: 'oklch(0.2393 0 0)' }}>
                                        {calcHours(todayAttendance)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={checkedInToday || checkingIn}
                            className="btn-primary"
                            style={checkedInToday ? { opacity: 0.45, cursor: 'not-allowed', transform: 'none', boxShadow: '3px 3px 0 oklch(0.2393 0 0)' } : {}}
                        >
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {checkingIn ? 'Checking In…' : checkedInToday ? 'Checked In ✓' : 'Check In'}
                        </button>
                        <button
                            onClick={handleCheckOut}
                            disabled={!checkedInToday || checkedOutToday || checkingOut}
                            className="btn-secondary"
                            style={(!checkedInToday || checkedOutToday) ? { opacity: 0.45, cursor: 'not-allowed', transform: 'none' } : {}}
                        >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            {checkingOut ? 'Checking Out…' : checkedOutToday ? 'Checked Out ✓' : 'Check Out'}
                        </button>
                    </div>
                </div>
            </div>

            {/* HR tabs */}
            {isHR && (
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('my')}
                        className={`tab-btn ${viewMode === 'my' ? 'tab-btn-active' : ''}`}
                    >
                        My Attendance
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        className={`tab-btn ${viewMode === 'all' ? 'tab-btn-active' : ''}`}
                    >
                        All Employees
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="card p-5">
                <p className="form-label mb-3">Filters</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="form-label">Start Date</label>
                        <input type="date" value={filterStartDate}
                               onChange={e => setFilterStartDate(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="form-label">End Date</label>
                        <input type="date" value={filterEndDate}
                               onChange={e => setFilterEndDate(e.target.value)} className="input-field" />
                    </div>
                    {isHR && viewMode === 'all' && (
                        <div>
                            <label className="form-label">Employee</label>
                            <select value={filterEmployee}
                                    onChange={e => setFilterEmployee(e.target.value)} className="input-field">
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="form-label">Status</label>
                        <select value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)} className="input-field">
                            <option value="">All</option>
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Absent">Absent</option>
                            <option value="Half Day">Half Day</option>
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
                            {isHR && viewMode === 'all' && <th>Employee</th>}
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Hours</th>
                            <th>Overtime</th>
                            <th>Punctuality</th>
                        </tr>
                        </thead>
                        <tbody>
                        {records.map(record => (
                            <tr key={record._id} className="table-row">
                                {isHR && viewMode === 'all' && (
                                    <td className="font-medium" style={{ color: 'oklch(0.2393 0 0)' }}>
                                        {record.employee?.fullName || '—'}
                                    </td>
                                )}
                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                <td>{record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '—'}</td>
                                <td>{record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '—'}</td>
                                <td>
                                        <span className={`badge ${statusBadgeClass(record.status)}`}>
                                            {record.status}
                                        </span>
                                </td>
                                <td>{calcHours(record)}</td>
                                <td>
                                    {record.overtime?.hours > 0
                                        ? <span className="badge badge-blue">+{record.overtime.hours}h</span>
                                        : <span style={{ color: 'oklch(0.6 0 0)' }}>—</span>}
                                </td>
                                <td>
                                    {record.isLate ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'oklch(0.5 0.15 46)' }}>
                                                <ExclamationTriangleIcon className="h-4 w-4" />
                                            {record.lateMinutes}m late
                                            </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'oklch(0.4 0.1 130)' }}>
                                                <CheckCircleIcon className="h-4 w-4" />
                                                On Time
                                            </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {records.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center py-10 text-sm"
                                    style={{ color: 'oklch(0.5 0 0)' }}
                                >
                                    No records found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Attendance;