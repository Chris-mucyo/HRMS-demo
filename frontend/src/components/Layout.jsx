import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    BuildingOfficeIcon,
    ClockIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    DocumentTextIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Employees', href: '/employees', icon: UsersIcon },
        { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
        { name: 'Attendance', href: '/attendance', icon: ClockIcon },
        { name: 'Leaves', href: '/leaves', icon: CalendarIcon },
        { name: 'Payroll', href: '/payroll', icon: CurrencyDollarIcon },
        { name: 'Performance', href: '/performance', icon: ChartBarIcon },
        { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen text-[oklch(var(--foreground))]" style={{ backgroundColor: 'oklch(var(--background))' }}>

            {/* Mobile Drawer Overlay */}
            <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                {/* Backdrop mimicking .modal-overlay styling */}
                <div
                    className="fixed inset-0"
                    style={{ backgroundColor: 'oklch(0 0 0 / 0.55)' }}
                    onClick={() => setSidebarOpen(false)}
                ></div>

                {/* Drawer Box mimicking .modal-box structure */}
                <div
                    className="relative flex-1 flex flex-col max-w-xs w-full h-full border-r-3"
                    style={{
                        backgroundColor: 'oklch(var(--sidebar))',
                        color: 'oklch(var(--sidebar-foreground))',
                        borderColor: 'oklch(var(--sidebar-border))'
                    }}
                >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 border-2 bg-[oklch(var(--primary))] text-[oklch(var(--primary-foreground))] focus:outline-none"
                            style={{ borderColor: 'oklch(var(--foreground))', boxShadow: '2px 2px 0 oklch(var(--foreground))' }}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4 mb-4 pb-2 border-b-2" style={{ borderColor: 'oklch(var(--sidebar-border))' }}>
                            <h1 className="text-xl font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)' }}>ShopHub HR</h1>
                        </div>
                        <nav className="mt-5 px-2 space-y-2">
                            {navigation.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="group flex items-center px-3 py-2 text-base font-semibold uppercase tracking-wider transition-all duration-150 border-2"
                                        style={{
                                            backgroundColor: active ? 'oklch(var(--sidebar-primary))' : 'transparent',
                                            color: active ? 'oklch(var(--sidebar-primary-foreground))' : 'oklch(var(--sidebar-foreground))',
                                            borderColor: active ? 'oklch(var(--foreground))' : 'transparent',
                                            boxShadow: active ? '3px 3px 0 oklch(var(--foreground))' : 'none',
                                            fontFamily: 'var(--font-sans)'
                                        }}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Static Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
                <div
                    className="flex-1 flex flex-col min-h-0 border-r-2"
                    style={{
                        backgroundColor: 'oklch(var(--sidebar))',
                        color: 'oklch(var(--sidebar-foreground))',
                        borderColor: 'oklch(var(--sidebar-border))'
                    }}
                >
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4 pb-4 border-b-2" style={{ borderColor: 'oklch(var(--sidebar-border))' }}>
                            <h1 className="text-2xl font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)' }}>HRMS</h1>
                        </div>
                        <nav className="mt-6 flex-1 px-3 space-y-2">
                            {navigation.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="group flex items-center px-3 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-150 border-2"
                                        style={{
                                            backgroundColor: active ? 'oklch(var(--sidebar-primary))' : 'transparent',
                                            color: active ? 'oklch(var(--sidebar-primary-foreground))' : 'oklch(var(--sidebar-foreground))',
                                            borderColor: active ? 'oklch(var(--foreground))' : 'transparent',
                                            boxShadow: active ? '3px 3px 0 oklch(var(--foreground))' : 'none',
                                            transform: active ? 'translate(-1px, -1px)' : 'none',
                                            fontFamily: 'var(--font-sans)'
                                        }}
                                    >
                                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Desktop Sidebar Profile Footer Section */}
                    <div className="flex-shrink-0 flex flex-col border-t-2 p-4" style={{ borderColor: 'oklch(var(--sidebar-border))' }}>
                        <div className="flex items-center p-2 border-2 bg-[oklch(var(--card))]" style={{ borderColor: 'oklch(var(--border))' }}>
                            <div
                                className="h-9 w-9 border-2 flex items-center justify-center font-bold text-sm"
                                style={{
                                    backgroundColor: 'oklch(var(--accent))',
                                    color: 'oklch(var(--accent-foreground))',
                                    borderColor: 'oklch(var(--foreground))'
                                }}
                            >
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-xs font-bold uppercase tracking-wider truncate" style={{ color: 'oklch(var(--card-foreground))' }}>
                                    {user?.fullName || 'User Profile'}
                                </p>
                                <p className="text-[10px] font-semibold tracking-widest uppercase opacity-75 truncate">
                                    {user?.role?.replace('_', ' ') || 'Access Level'}
                                </p>
                            </div>
                        </div>

                        {/* Styled to mirror your .btn-danger architecture */}
                        <button
                            onClick={handleLogout}
                            className="btn-danger mt-3 w-full flex items-center justify-center gap-2"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Application Shell Content Wrapper */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Mobile Top Navigation Header Block */}
                <div
                    className="sticky top-0 z-10 md:hidden p-3 flex items-center border-b-2"
                    style={{
                        backgroundColor: 'oklch(var(--sidebar))',
                        borderColor: 'oklch(var(--sidebar-border))'
                    }}
                >
                    <button
                        className="h-10 w-10 inline-flex items-center justify-center border-2"
                        style={{
                            backgroundColor: 'oklch(var(--card))',
                            borderColor: 'oklch(var(--border))',
                            boxShadow: '2px 2px 0 oklch(var(--border))'
                        }}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" style={{ color: 'oklch(var(--sidebar-foreground))' }} />
                    </button>
                    <h1 className="ml-4 text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-sans)', color: 'oklch(var(--sidebar-foreground))' }}>
                        HR
                    </h1>
                </div>

                {/* Central Viewport Router Target Injection */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;