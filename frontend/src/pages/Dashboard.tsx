import { useEffect, useState } from 'react';
import client from '../api/client';
import { Users, UserMinus, CalendarCheck } from 'lucide-react';

export const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await client.get('/reports/dashboard');
                setStats(res.data.data);
            } catch (error) {
                console.error("Failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    const cards = [
        { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: '#4F46E5' },
        { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: UserMinus, color: '#F59E0B' },
        { label: 'Present Today', value: stats?.presentToday || 0, icon: CalendarCheck, color: '#10B981' },
        { label: 'On Leave Today', value: stats?.leaveToday || 0, icon: CalendarCheck, color: '#EF4444' }
    ];

    return (
        <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: '#D1D5DB' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {cards.map((c, i) => (
                    <div key={i} className="card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(31, 41, 55, 0.4)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }}>
                        <div style={{
                            padding: '1rem',
                            borderRadius: '1rem',
                            backgroundColor: `${c.color}25`, // 15% opacity
                            marginRight: '1rem',
                            border: `1px solid ${c.color}40`
                        }}>
                            <c.icon color={c.color} size={28} />
                        </div>
                        <div>
                            <div style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{c.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'white' }}>{c.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
