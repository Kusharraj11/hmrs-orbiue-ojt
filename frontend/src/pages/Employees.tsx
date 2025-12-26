import { useEffect, useState } from 'react';
import client from '../api/client';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Employees = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await client.get('/employees');
            setEmployees(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure?')) {
            await client.delete(`/employees/${id}`);
            fetchEmployees();
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Employees</h2>
                <button
                    onClick={() => navigate('/employees/new')}
                    style={{
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            <div style={{
                background: 'rgba(31, 41, 55, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <tr>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Name</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Email</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Designation</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Department</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D1D5DB', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1rem 1.25rem', color: 'white', fontWeight: '500' }}>{emp.firstName} {emp.lastName}</td>
                                <td style={{ padding: '1rem 1.25rem', color: '#E5E7EB' }}>{emp.email}</td>
                                <td style={{ padding: '1rem 1.25rem', color: '#E5E7EB' }}>{emp.designation}</td>
                                <td style={{ padding: '1rem 1.25rem', color: '#E5E7EB' }}>{emp.department}</td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        backgroundColor: emp.status === 'ACTIVE' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                                        color: emp.status === 'ACTIVE' ? '#6EE7B7' : '#FCA5A5',
                                        border: emp.status === 'ACTIVE' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(248, 113, 113, 0.3)'
                                    }}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => navigate(`/employees/${emp.id}`)} style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#818CF8', transition: 'color 0.2s' }}>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(emp.id)} style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#F87171', transition: 'color 0.2s' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
