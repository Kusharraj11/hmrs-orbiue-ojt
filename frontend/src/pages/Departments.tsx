import { useState, useEffect } from 'react';
import client from '../api/client';
import { Plus, Trash2, Building } from 'lucide-react';
import { motion } from 'framer-motion';

interface Department {
    id: string;
    name: string;
    createdAt: string;
}

export const Departments = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [newDeptName, setNewDeptName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchDepartments = async () => {
        try {
            const res = await client.get('/departments');
            setDepartments(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/departments', { name: newDeptName });
            setNewDeptName('');
            fetchDepartments();
        } catch (error) {
            console.error(error);
            alert('Failed to add department');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await client.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Departments</h2>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        placeholder="New Department Name"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            background: 'rgba(17, 24, 39, 0.6)',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.9rem',
                            minWidth: '250px'
                        }}
                    />
                    <button type="submit" style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                    }}>
                        <Plus size={18} /> Add
                    </button>
                </form>
            </div>

            {loading ? <p style={{ color: 'white' }}>Loading...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {departments.map((dept) => (
                        <motion.div
                            key={dept.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'rgba(31, 41, 55, 0.4)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    padding: '0.75rem',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    borderRadius: '0.75rem',
                                    color: '#818CF8',
                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                }}>
                                    <Building size={24} />
                                </div>
                                <span style={{ fontWeight: '600', color: 'white', fontSize: '1.1rem' }}>{dept.name}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(dept.id)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: 'none',
                                    color: '#F87171',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '0.5rem',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                    {departments.length === 0 && <p style={{ color: '#9CA3AF' }}>No departments found.</p>}
                </div>
            )}
        </div>
    );
};
