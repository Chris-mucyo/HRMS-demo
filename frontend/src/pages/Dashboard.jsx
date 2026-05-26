import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    UsersIcon,
    BuildingOfficeIcon,
    ClockIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = [
    'oklch(0.4955 0.0896 126.1858)',
    'oklch(0.7076 0.1975 46.4558)',
    'oklch(0.5016 0.1887 27.4816)',
];

const ACCENT_COLORS = [
    'oklch(0.5016 0.1887 27.4816)',  // rust
    'oklch(0.4955 0.0896 126.1858)', // green
    'oklch(0.7076 0.1975 46.4558)',  // amber
    'oklch(0.7839 0.1719 68.0943)',  // yellow
    'oklch(0.588 0.0993 245.7394)',  // blue
    'oklch(0.5656 0.0431 40.43)',    // tan
];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        presentToday: 0,
        pendingLeaves: 0,
        monthlyPayroll: 0,
    });
    const [recentEmployees, setRecentEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const [employeesRes, departmentsRes, attendanceRes, leavesRes, payrollRes] =
                await Promise.all([
                    api.get('/api/employees?limit=5'),
                    api.get('/api/departments'),
                    api.get('/api/attendance?status=Present'),
                    api.get('/api/leaves?status=Pending'),
                    api.get('/api/payroll'),
                ]);

            setStats({
                totalEmployees: employeesRes.data.count || employeesRes.data.data.length,
                totalDepartments: departmentsRes.data.count || departmentsRes.data.data.length,
                presentToday: attendanceRes.data.count || attendanceRes.data.data.length,
                pendingLeaves: leavesRes.data.count || leavesRes.data.data.length,
                monthlyPayroll: payrollRes.data.data?.reduce((s, p) => s + p.netSalary, 0) || 0,
            });
            setRecentEmployees(employeesRes.data.data?.slice(0, 5) || []);
            setAttendanceData([
                { name: 'Present', value: attendanceRes.data.count || 0 },
                { name: 'Late', value: Math.floor((attendanceRes.data.count || 0) * 0.1) },
                { name: 'Absent', value: Math.floor((employeesRes.data.count || 0) * 0.05) },
            ]);
            setDepartmentData(
                departmentsRes.data.data?.map(d => ({
                    name: d.name,
                    employees: d.employees?.length || 0,
                })) || []
            );
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { name: 'Total Employees', value: stats.totalEmployees, Icon: UsersIcon, color: ACCENT_COLORS[0] },
        { name: 'Departments', value: stats.totalDepartments, Icon: BuildingOfficeIcon, color: ACCENT_COLORS[1] },
        { name: 'Present Today', value: stats.presentToday, Icon: ClockIcon, color: ACCENT_COLORS[2] },
        { name: 'Pending Leaves', value: stats.pendingLeaves, Icon: CalendarIcon, color: ACCENT_COLORS[3] },
        { name: 'Monthly Payroll', value: `$${stats.monthlyPayroll.toLocaleString()}`, Icon: CurrencyDollarIcon, color: ACCENT_COLORS[4] },
        { name: 'My Performance', value: '4.5 / 5', Icon: ChartBarIcon, color: ACCENT_COLORS[5] },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Page header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                    Welcome back, <strong>{user?.fullName}</strong> — here's what's happening today.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statCards.map(({ name, value, Icon, color }) => (
                    <div key={name} className="stat-card p-5 flex items-start gap-4">
                        <div
                            className="stat-card-accent-bar"
                            style={{ background: color }}
                        />
                        <div
                            className="flex-shrink-0 flex items-center justify-center h-10 w-10"
                            style={{
                                background: color,
                                border: '2px solid oklch(0.2393 0 0)',
                            }}
                        >
                            <Icon className="h-5 w-5" style={{ color: 'oklch(1 0 0)' }} />
                        </div>
                        <div className="flex-1 min-w-0 pl-1">
                            <p
                                className="text-xs font-bold uppercase tracking-widest truncate"
                                style={{ color: 'oklch(0.4091 0 0)' }}
                            >
                                {name}
                            </p>
                            <p
                                className="text-2xl font-bold mt-0.5"
                                style={{ color: 'oklch(0.2393 0 0)' }}
                            >
                                {value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="card p-6">
                    <h3
                        className="text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ color: 'oklch(0.2393 0 0)' }}
                    >
                        Department Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.6 0 0)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontFamily: 'var(--font-sans)', fontSize: 11 }}
                            />
                            <YAxis tick={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 12,
                                    border: '2px solid oklch(0.4313 0 0)',
                                    borderRadius: 0,
                                    background: 'oklch(0.8452 0 0)',
                                }}
                            />
                            <Legend wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
                            <Bar
                                dataKey="employees"
                                name="Employees"
                                fill="oklch(0.5016 0.1887 27.4816)"
                                stroke="oklch(0.2393 0 0)"
                                strokeWidth={1}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-6">
                    <h3
                        className="text-xs font-bold uppercase tracking-widest mb-4"
                        style={{ color: 'oklch(0.2393 0 0)' }}
                    >
                        Today's Attendance
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={attendanceData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {attendanceData.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                                        stroke="oklch(0.2393 0 0)"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: 12,
                                    border: '2px solid oklch(0.4313 0 0)',
                                    borderRadius: 0,
                                    background: 'oklch(0.8452 0 0)',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent employees */}
            <div className="card">
                <div
                    className="px-5 py-3"
                    style={{
                        borderBottom: '2px solid oklch(0.4313 0 0)',
                        background: 'oklch(0.2393 0 0)',
                    }}
                >
                    <h3
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'oklch(0.9067 0 0)' }}
                    >
                        Recent Employees
                    </h3>
                </div>
                <ul className="divide-y" style={{ borderColor: 'oklch(0.6 0 0)' }}>
                    {recentEmployees.map((emp) => (
                        <li
                            key={emp._id}
                            className="px-5 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
                            style={{ background: 'transparent' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-8 w-8 flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{
                                        background: 'oklch(0.5016 0.1887 27.4816)',
                                        color: 'oklch(1 0 0)',
                                        border: '2px solid oklch(0.2393 0 0)',
                                    }}
                                >
                                    {emp.fullName?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{ color: 'oklch(0.2393 0 0)' }}
                                    >
                                        {emp.fullName}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: 'oklch(0.4091 0 0)' }}
                                    >
                                        {emp.position}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-red'}`}
                                >
                                    {emp.status}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{ color: 'oklch(0.4091 0 0)' }}
                                >
                                    {emp.department?.name}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;