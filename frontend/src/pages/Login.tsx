import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Briefcase, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import bgImage from '../assets/login-bg.png';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        try {
            const success = await login(email, password);
            if (success) {
                setNotification({ type: 'success', message: 'Login successful! Redirecting...' });
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setNotification({ type: 'error', message: 'Login failed: Invalid credentials. Please try again.' });
            }
        } catch (error) {
            console.error('Login error', error);
            setNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-detect role based on email - Visual only
    useEffect(() => {
        if (email.toLowerCase().startsWith('admin')) {
            setRole('ADMIN');
        } else if (email.toLowerCase().startsWith('hr')) {
            setRole('HR');
        } else if (email.toLowerCase().startsWith('emp')) {
            setRole('EMPLOYEE');
        }
    }, [email]);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `url(${bgImage}) no-repeat center center/cover`,
            position: 'relative',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Overlay for better readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.4)', // Dark overlay
                backdropFilter: 'blur(3px)', // Slight blur to background
                zIndex: 0
            }} />

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: '50%',
                            zIndex: 1000,
                            background: notification.type === 'success' ? 'rgba(236, 253, 245, 0.9)' : 'rgba(254, 242, 242, 0.9)',
                            color: notification.type === 'success' ? '#065F46' : '#991B1B',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: `1px solid ${notification.type === 'success' ? '#34D399' : '#F87171'}`,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span style={{ fontWeight: 600 }}>{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    background: 'rgba(31, 41, 55, 0.75)', // Glass effect
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    padding: '3rem',
                    borderRadius: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    maxWidth: '420px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 10px 20px -3px rgba(79, 70, 229, 0.4)'
                    }}>
                        <Briefcase size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#F9FAFB', letterSpacing: '-0.025em' }}>Welcome Back</h1>
                    <p style={{ color: '#D1D5DB', fontSize: '0.95rem', margin: 0 }}>Sign in to access your HR workspace</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#E5E7EB' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    background: 'rgba(17, 24, 39, 0.6)',
                                    border: '1px solid rgba(75, 85, 99, 0.6)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366F1';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#E5E7EB' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    background: 'rgba(17, 24, 39, 0.6)',
                                    border: '1px solid rgba(75, 85, 99, 0.6)',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366F1';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(75, 85, 99, 0.6)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    {/* Role Selector */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#E5E7EB' }}>Select Role</label>
                        <div style={{
                            display: 'flex',
                            background: 'rgba(17, 24, 39, 0.6)',
                            padding: '0.375rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(75, 85, 99, 0.6)',
                            position: 'relative'
                        }}>
                            {['EMPLOYEE', 'HR', 'ADMIN'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    style={{
                                        flex: 1,
                                        position: 'relative',
                                        padding: '0.625rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        background: 'transparent',
                                        color: role === r ? 'white' : '#9CA3AF',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        zIndex: 1,
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    {role === r && (
                                        <motion.div
                                            layoutId="activeRole"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                //                               bottom: 0,
                                                height: '100%',
                                                width: '100%',
                                                background: '#4F46E5',
                                                borderRadius: '0.5rem',
                                                zIndex: -1,
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    {r.charAt(0) + r.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 20px -10px rgba(79, 70, 229, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: isLoading ? '#6366F1' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                            opacity: isLoading ? 0.8 : 1
                        }}
                    >
                        {isLoading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    style={{ width: '20px', height: '20px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};
