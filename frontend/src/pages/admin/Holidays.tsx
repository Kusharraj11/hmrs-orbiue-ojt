import { useState, useEffect } from 'react';
import client from '../../api/client';
import { motion } from 'framer-motion';
import { Trash2, Plus, X } from 'lucide-react';

interface Holiday {
    id: string;
    name: string;
    date: string;
    isRecurring: boolean;
}

export const Holidays = () => {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', date: '', isRecurring: true });

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = () => {
        client.get('/holidays').then(res => setHolidays(res.data.data)).catch(console.error);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await client.delete(`/holidays/${id}`);
            fetchHolidays();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/holidays', {
                ...formData,
                date: new Date(formData.date).toISOString() // Zod expects ISO
            });
            setIsModalOpen(false);
            fetchHolidays();
            setFormData({ name: '', date: '', isRecurring: true });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add holiday');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Company Holidays</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white',
                        border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                    }}
                >
                    <Plus size={18} /> Add Holiday
                </button>
            </div>

            <div style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0, 0, 0, 0.2)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Holiday Name</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Date</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Recurring?</th>
                            <th style={{ padding: '1rem', color: '#D1D5DB' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holidays.map(h => (
                            <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: 600, color: 'white' }}>{h.name}</td>
                                <td style={{ padding: '1rem', color: '#E5E7EB' }}>{new Date(h.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem', color: '#E5E7EB' }}>{h.isRecurring ? 'Yes' : 'No'}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button onClick={() => handleDelete(h.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {holidays.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No holidays added yet.</p>}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: '#1F2937',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '2rem', borderRadius: '1rem', width: '400px', maxWidth: '90%',
                            color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Add Holiday</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#D1D5DB' }}>Holiday Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. New Year"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#D1D5DB' }}>Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isRecurring}
                                    onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                                    id="recurring"
                                />
                                <label htmlFor="recurring" style={{ fontSize: '0.9rem', color: '#D1D5DB' }}>Repeats every year?</label>
                            </div>
                            <button type="submit" style={{ marginTop: '1rem', padding: '0.75rem', background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                                Add Holiday
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
