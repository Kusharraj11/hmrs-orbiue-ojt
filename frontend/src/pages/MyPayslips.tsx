import { useState, useEffect } from 'react';
import { getMyPayslips, downloadPayslip } from '../api/payrollApi';
import { FileText, Download, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import './MyPayslips.css';

const MyPayslips = () => {
    const [payslips, setPayslips] = useState<any[]>([]);

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            const res = await getMyPayslips();
            setPayslips(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = async (id: string, run: any) => {
        try {
            const filename = `payslip-${run.month}-${run.year}.pdf`;
            await downloadPayslip(id, filename);
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    return (
        <div className="mp-container">
            <div className="mp-header">
                <h1><Wallet size={32} /> My Payslips</h1>
                <p>View and download your monthly salary slips.</p>
            </div>

            <div className="mp-grid">
                {payslips.map((slip, idx) => (
                    <motion.div
                        key={slip.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="mp-card"
                    >
                        <div className="mp-card-header">
                            <div>
                                <div className="mp-month">{new Date(0, slip.payrollRun.month - 1).toLocaleString('default', { month: 'long' })}</div>
                                <div className="mp-year">{slip.payrollRun.year}</div>
                            </div>
                            <FileText size={24} color="#9ca3af" />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="mp-label">Net Pay</div>
                            <div className="mp-amount">${slip.netPay.toLocaleString()}</div>
                        </div>

                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Processed on: {new Date(slip.createdAt).toLocaleDateString()}
                        </div>

                        <button
                            onClick={() => handleDownload(slip.id, slip.payrollRun)}
                            className="mp-btn-download"
                        >
                            <Download size={18} /> Download PDF
                        </button>
                    </motion.div>
                ))}
            </div>

            {payslips.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', border: '2px dashed #e5e7eb', borderRadius: '1rem' }}>
                    <p>No payslips generated for you yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyPayslips;
