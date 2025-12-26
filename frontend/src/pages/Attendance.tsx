import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { clockIn, clockOut, getAttendanceHistory } from '../api/attendanceApi';
import { toast } from 'react-hot-toast';
import './Attendance.css';

const Attendance = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [history, setHistory] = useState<any[]>([]);
    const [todayRecord, setTodayRecord] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Live Clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Initial Fetch
        fetchHistory();

        return () => clearInterval(timer);
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await getAttendanceHistory({ limit: 5 }); // Get last 5
            setHistory(res.data);

            // Check if checked in today
            const todayStr = new Date().toISOString().split('T')[0];
            const foundToday = res.data.find((rec: any) => rec.date.startsWith(todayStr));
            setTodayRecord(foundToday || null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClockAction = async () => {
        setLoading(true);
        try {
            if (todayRecord && !todayRecord.clockOut) {
                // Clock Out
                await clockOut();
                toast.success('Clocked Out Successfully!');
            } else {
                // Clock In
                await clockIn();
                toast.success('Clocked In Successfully!');
            }
            fetchHistory();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action Failed');
        } finally {
            setLoading(false);
        }
    };

    // Determine Status
    const isClockedIn = todayRecord && !todayRecord.clockOut;
    const isDayComplete = todayRecord && todayRecord.clockOut;

    return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <div style={{
                background: 'rgba(245, 158, 11, 0.2)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="att-header-content">
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Clock size={32} /> Attendance Portal
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>Track your daily work hours and history.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Clock Action Card */}
                <div style={{
                    background: 'rgba(31, 41, 55, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: 'fit-content'
                }}>
                    <div style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'monospace', color: 'white', marginBottom: '0.5rem' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#D1D5DB', marginBottom: '2rem' }}>
                        {currentTime.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>

                    {!isDayComplete ? (
                        <button
                            onClick={handleClockAction}
                            disabled={loading}
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                border: 'none',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                background: isClockedIn ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                color: 'white',
                                boxShadow: isClockedIn ? '0 10px 25px -5px rgba(239, 68, 68, 0.4)' : '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {loading ? (
                                'Processing...'
                            ) : isClockedIn ? (
                                <><LogOut size={32} /> Clock Out</>
                            ) : (
                                <><LogIn size={32} /> Clock In</>
                            )}
                        </button>
                    ) : (
                        <div style={{
                            width: '200px', height: '200px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.1)', color: '#9CA3AF', border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <CheckCircle size={32} />
                            Done
                        </div>
                    )}

                    {todayRecord && (
                        <div style={{
                            marginTop: '2rem', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: '600', fontSize: '0.9rem',
                            background: isClockedIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: isClockedIn ? '#34D399' : '#D1D5DB'
                        }}>
                            Status: {isClockedIn ? 'Currently Working' : 'Day Completed'}
                        </div>
                    )}
                </div>

                {/* History Card */}
                <div style={{
                    background: 'rgba(31, 41, 55, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Recent Activity</h3>
                        <Calendar size={20} style={{ color: '#9CA3AF' }} />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <tr>
                                <th style={{ padding: '1rem', color: '#D1D5DB' }}>Date</th>
                                <th style={{ padding: '1rem', color: '#D1D5DB' }}>Clock In</th>
                                <th style={{ padding: '1rem', color: '#D1D5DB' }}>Clock Out</th>
                                <th style={{ padding: '1rem', color: '#D1D5DB' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? (
                                history.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{new Date(rec.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem' }}>{rec.clockIn ? new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                        <td style={{ padding: '1rem' }}>{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.8rem',
                                                background: rec.status === 'PRESENT' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                                                color: rec.status === 'PRESENT' ? '#6EE7B7' : '#FCA5A5',
                                                fontWeight: 600
                                            }}>
                                                {rec.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

// Missing icon fix
const CheckCircle = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default Attendance;
