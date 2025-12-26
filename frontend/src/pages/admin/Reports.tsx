
import { useState, useEffect } from 'react';
import { Download, FileText, Filter } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const Reports = () => {
    const [activeTab, setActiveTab] = useState<'liability' | 'anomalies'>('liability');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [department, setDepartment] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [departmentsList, setDepartmentsList] = useState<any[]>([]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [activeTab, department, startDate, endDate]); // Auto-refresh on filter change

    const fetchDepartments = async () => {
        try {
            const res = await client.get('/departments');
            setDepartmentsList(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = '';
            let params = {};

            if (activeTab === 'liability') {
                url = '/reports/leave-liability';
                params = { department };
            } else {
                url = '/reports/attendance-anomalies';
                params = { startDate, endDate };
            }

            const res = await client.get(url, { params });
            setData(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format: 'pdf' | 'csv') => {
        if (activeTab === 'anomalies') {
            toast.error('Export not available for anomalies yet');
            return;
        }

        try {
            const response = await client.get('/reports/leave-liability/download', {
                params: { department, format },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Download failed');
        }
    };

    const glassCard = {
        background: 'rgba(31, 41, 55, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Reports & Analytics</h1>
                    <p style={{ color: '#9CA3AF' }}>Generate insights and compliance reports.</p>
                </div>
                {/* Buttons remain similar but maybe tweaked for dark mode if needed, assuming they look okay or we can style them */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleDownload('csv')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem', cursor: 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        <FileText size={18} /> Export CSV
                    </button>
                    <button
                        onClick={() => handleDownload('pdf')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white',
                            border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        <Download size={18} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('liability')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'liability' ? '2px solid #6366F1' : '2px solid transparent',
                        color: activeTab === 'liability' ? '#818CF8' : '#9CA3AF',
                        fontWeight: 600,
                        background: 'none',
                        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Leave Liability
                </button>
                <button
                    onClick={() => setActiveTab('anomalies')}
                    style={{
                        padding: '1rem',
                        borderBottom: activeTab === 'anomalies' ? '2px solid #6366F1' : '2px solid transparent',
                        color: activeTab === 'anomalies' ? '#818CF8' : '#9CA3AF',
                        fontWeight: 600,
                        background: 'none',
                        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Attendance Anomalies
                </button>
            </div>

            {/* Filters */}
            <div style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center'
            }}>
                <Filter size={20} color="#9CA3AF" />

                {activeTab === 'liability' && (
                    <select
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        style={{
                            padding: '0.75rem', borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(17, 24, 39, 0.6)', color: 'white',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Departments</option>
                        {departmentsList.map((d: any) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                )}

                {activeTab === 'anomalies' && (
                    <>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            style={{
                                padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(17, 24, 39, 0.6)', color: 'white',
                                outline: 'none'
                            }}
                        />
                        <span style={{ color: '#D1D5DB' }}>to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            style={{
                                padding: '0.75rem', borderRadius: '0.5rem',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(17, 24, 39, 0.6)', color: 'white',
                                outline: 'none'
                            }}
                        />
                    </>
                )}
            </div>

            {/* Data Table */}
            <div style={glassCard}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <tr>
                            {activeTab === 'liability' ? (
                                <>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Employee</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Department</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Casual</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Sick</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Earned</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Liability</th>
                                </>
                            ) : (
                                <>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Employee</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Hours</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Check In</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1.25rem', textAlign: 'left', color: '#D1D5DB', fontSize: '0.85rem', textTransform: 'uppercase' }}>Remarks</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading report data...</td></tr>
                        ) : data.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No data found for selected filters.</td></tr>
                        ) : (
                            data.map((row: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {activeTab === 'liability' ? (
                                        <>
                                            <td style={{ padding: '1rem', color: 'white', fontWeight: 500 }}>{row.name}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.department}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.casualLeave}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.sickLeave}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.earnedLeave}</td>
                                            <td style={{ padding: '1rem', fontWeight: 'bold', color: '#EF4444' }}>{row.totalLiabilityDays} Days</td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{new Date(row.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '1rem', color: 'white', fontWeight: 500 }}>{row.name}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.totalHours?.toFixed(1) || '-'}</td>
                                            <td style={{ padding: '1rem', color: '#E5E7EB' }}>{row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: row.status === 'LATE' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: row.status === 'LATE' ? '#FCD34D' : '#FCA5A5'
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: '#9CA3AF' }}>{row.remarks}</td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
