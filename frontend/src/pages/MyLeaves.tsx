import { useState, useEffect } from 'react';
import { Calendar, Plus, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { applyLeave, getMyLeaves } from '../api/leaveApi';
import { toast } from 'react-hot-toast';
import './MyLeaves.css';

const MyLeaves = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        if (user) fetchLeaves();
    }, [user]);

    const fetchLeaves = async () => {
        if (!user) return;
        try {
            const res = await getMyLeaves(user.id);
            setLeaves(res.data || []); // API returns { data: [] } structure mapped to res.data
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                employeeId: user?.id,
                leaveType: formData.leaveType,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                reason: formData.reason
            };

            await applyLeave(payload);
            toast.success('Leave Application Submitted');
            setFormData({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
            fetchLeaves();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: 'rgba(31, 41, 55, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.5rem',
        padding: '2rem',
        marginBottom: '2rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(17, 24, 39, 0.6)',
        color: 'white',
        outline: 'none',
        fontSize: '0.95rem'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)', padding: '1rem', borderRadius: '1rem' }}>
                    <Calendar size={32} color="white" />
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>My Leaves</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#D1D5DB' }}>Manage your time off and view application status.</p>
                </div>
            </div>

            {/* Mock Balances */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={cardStyle}>
                    <div style={{ fontSize: '0.9rem', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Casual Leave</div>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#F472B6' }}>12</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Days Available</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontSize: '0.9rem', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sick Leave</div>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#F472B6' }}>8</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Days Available</div>
                </div>
                <div style={cardStyle}>
                    <div style={{ fontSize: '0.9rem', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earned Leave</div>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: '#F472B6' }}>15</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Days Available</div>
                </div>
            </div>

            {/* Apply Form */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                    <Plus size={20} /> Apply for Leave
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB' }}>Leave Type</label>
                            <select
                                style={inputStyle}
                                value={formData.leaveType}
                                onChange={e => setFormData({ ...formData, leaveType: e.target.value })}
                            >
                                <option value="CASUAL">Casual Leave</option>
                                <option value="SICK">Sick Leave</option>
                                <option value="EARNED">Earned Leave</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB' }}>Reason</label>
                            <input
                                type="text"
                                style={inputStyle}
                                required
                                placeholder="e.g. Personal work, Not feeling well"
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB' }}>Start Date</label>
                            <input
                                type="date"
                                style={inputStyle}
                                required
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#D1D5DB' }}>End Date</label>
                            <input
                                type="date"
                                style={inputStyle}
                                required
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={loading} style={{
                            padding: '1rem 2rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            background: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(236, 72, 153, 0.3)'
                        }}>
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>

            {/* History List */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                    <History size={20} /> Application History
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Type</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Dates</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Days</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Reason</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? (
                            leaves.map(leave => (
                                <tr key={leave.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{leave.leaveType}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{leave.reason}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '1rem',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            background: leave.status === 'APPROVED' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                            color: leave.status === 'APPROVED' ? '#6EE7B7' : '#FCD34D'
                                        }}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No leave applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyLeaves;
