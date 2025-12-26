import { useState } from 'react';
import { Play, CheckCircle, FileText } from 'lucide-react';
import { runPayroll } from '../../api/payrollApi';
import { toast } from 'react-hot-toast';
import './PayrollDashboard.css';

const PayrollDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Defaults to current month
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const handleRunPayroll = async () => {
        setLoading(true);
        try {
            const res = await runPayroll(month, year);
            setResult(res.data);
            toast.success('Payroll Processed Successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payroll Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pd-container">
            <div className="pd-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <FileText size={32} />
                    <h1>Payroll Dashboard</h1>
                </div>
                <p>Select a period below to process salaries for all active employees.</p>
            </div>

            <div className="pd-dashboard-grid">
                {/* Run Panel */}
                <div className="pd-card">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Run Payroll</h2>

                    <div className="pd-select-group">
                        <label className="pd-select-label">Select Month</label>
                        <select
                            value={month}
                            onChange={e => setMonth(Number(e.target.value))}
                            className="pd-select"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pd-select-group">
                        <label className="pd-select-label">Select Year</label>
                        <input
                            type="number"
                            value={year}
                            onChange={e => setYear(Number(e.target.value))}
                            className="pd-select"
                        />
                    </div>

                    <button
                        onClick={handleRunPayroll}
                        disabled={loading}
                        className="pd-btn-run"
                    >
                        {loading ? 'Processing...' : <><Play size={20} /> Execute Payroll Run</>}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="pd-card" style={{ borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    {!result ? (
                        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                            <FileText size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>Ready to Process</h3>
                            <p>Payroll results and summary will appear here after execution.</p>
                        </div>
                    ) : (
                        <div className="pd-success-message">
                            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem auto' }} />
                            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>Success!</h2>
                            <p style={{ fontSize: '1.25rem', color: '#D1D5DB' }}>
                                Successfully processed payslips for <span style={{ fontWeight: 'bold', color: '#818CF8' }}>{result.processedCount}</span> employees.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollDashboard;
