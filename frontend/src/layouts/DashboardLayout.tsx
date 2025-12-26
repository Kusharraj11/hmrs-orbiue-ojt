import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ClipboardCheck, Calendar, DollarSign, FileText, Briefcase, Clock, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bgImage from '../assets/login-bg.png';

export const DashboardLayout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        // Admin/HR Items
        { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { icon: Users, label: 'Employees', path: '/employees', roles: ['ADMIN', 'HR'] },
        { icon: Briefcase, label: 'Departments', path: '/departments', roles: ['ADMIN'] },
        { icon: ClipboardCheck, label: 'Leave Policies', path: '/admin/policies', roles: ['ADMIN', 'HR'] },
        { icon: Calendar, label: 'Holidays', path: '/admin/holidays', roles: ['ADMIN', 'HR'] },
        { icon: DollarSign, label: 'Salary Structure', path: '/admin/salary-structure', roles: ['ADMIN', 'HR'] },
        { icon: FileText, label: 'Payroll', path: '/admin/payroll', roles: ['ADMIN', 'HR'] },
        { icon: Clock, label: 'Attendance', path: '/attendance', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { icon: BarChart, label: 'Reports', path: '/reports', roles: ['ADMIN', 'HR'] },

        // Employee Specific Items (some overlap with Admin/HR for visibility)
        { icon: Calendar, label: 'My Leaves', path: '/leaves', roles: ['EMPLOYEE'] },
        { icon: FileText, label: 'My Payslips', path: '/my-payslips', roles: ['EMPLOYEE'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-container" style={{
            display: 'flex',
            minHeight: '100vh',
            background: `url(${bgImage}) no-repeat center center/cover`,
            position: 'relative',
            fontFamily: 'Inter, sans-serif',
            color: 'white'
        }}>
            {/* Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(5px)',
                zIndex: 0
            }} />

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'rgba(17, 24, 39, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1,
                boxShadow: '4px 0 24px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    padding: '2rem 1.5rem',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    letterSpacing: '-0.025em',
                    background: 'linear-gradient(to right, #fff, #9CA3AF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    HRMS Admin
                </div>
                <nav style={{ flex: 1, padding: '1rem' }}>
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.875rem 1rem',
                                    color: isActive ? 'white' : '#9CA3AF',
                                    textDecoration: 'none',
                                    backgroundColor: isActive ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                    borderRadius: '0.75rem',
                                    marginBottom: '0.5rem',
                                    border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                    transition: 'all 0.2s',
                                    fontWeight: isActive ? 600 : 500
                                }}
                            >
                                <item.icon size={20} style={{ marginRight: '0.75rem', color: isActive ? '#818CF8' : 'currentColor' }} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '0.25rem', fontWeight: '600', fontSize: '0.95rem' }}>{user?.name || 'Admin User'}</div>
                    <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#9CA3AF' }}>{user?.email}</div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            color: '#F87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
                <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.025em' }}>HR Management System</h1>
                        <p style={{ margin: '0.5rem 0 0', color: '#9CA3AF' }}>Welcome back to your dashboard</p>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};
