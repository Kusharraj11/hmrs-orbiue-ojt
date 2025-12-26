import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle, XCircle } from 'lucide-react';

export const EmployeeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    // Loading State
    const [isLoading, setIsLoading] = useState(false);

    // Notification State
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        joiningDate: '',
        salary: 0
    });

    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        client.get('/departments').then(res => setDepartments(res.data.data)).catch(console.error);

        if (isEdit) {
            client.get(`/employees/${id}`).then(res => {
                const emp = res.data.data;
                setFormData({
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    email: emp.email,
                    phone: emp.phone,
                    designation: emp.designation,
                    department: emp.department,
                    joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
                    salary: emp.salary
                });
            }).catch(err => {
                console.error("Failed to fetch employee", err);
                setNotification({ type: 'error', message: 'Failed to fetch employee details.' });
            });
        }
    }, [id, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        try {
            const payload = {
                ...formData,
                salary: Number(formData.salary),
                joiningDate: new Date(formData.joiningDate).toISOString()
            };

            if (isEdit) {
                await client.put(`/employees/${id}`, payload);
                setNotification({ type: 'success', message: 'Employee updated successfully!' });
            } else {
                await client.post('/employees', payload);
                setNotification({ type: 'success', message: 'Employee registered successfully!' });
            }

            // Delay navigation to show success message
            setTimeout(() => {
                navigate('/employees');
            }, 1500);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Operation failed';

            if (error.response?.data?.errors) {
                const details = error.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
                setNotification({ type: 'error', message: `${msg}: ${details}` });
            } else {
                setNotification({ type: 'error', message: msg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Animation Variants
    const inputVariants = {
        focus: { scale: 1.02, borderColor: '#4F46E5', transition: { duration: 0.2 } },
        blur: { scale: 1, borderColor: '#E5E7EB', transition: { duration: 0.2 } }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
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
                            background: notification.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                            color: notification.type === 'success' ? '#065F46' : '#991B1B',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: `1px solid ${notification.type === 'success' ? '#34D399' : '#F87171'}`
                        }}
                    >
                        {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span style={{ fontWeight: 600 }}>{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => navigate('/employees')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer', color: '#6B7280', fontWeight: 500 }}>
                <ArrowLeft size={20} /> Back to List
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="card"
                style={{ padding: '3rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            >
                <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
                    <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.875rem', color: '#111827', fontWeight: 700 }}>
                        {isEdit ? 'Edit Employee Profile' : 'Register New Employee'}
                    </h2>
                    <p style={{ margin: 0, color: '#6B7280', fontSize: '1rem' }}>
                        {isEdit ? 'Update the employee information below.' : 'Fill in the details to onboard a new team member.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    {/* Inputs */}
                    {[
                        { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'e.g. John' },
                        { label: 'Last Name', name: 'lastName', type: 'text', placeholder: 'e.g. Doe' },
                        { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john.doe@company.com' },
                        { label: 'Phone Number', name: 'phone', type: 'text', placeholder: '+1 (555) 000-0000' },
                        { label: 'Designation', name: 'designation', type: 'text', placeholder: 'e.g. Senior Developer' }
                    ].map((field) => (
                        <div className="form-group" key={field.name}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>{field.label}</label>
                            <motion.input
                                variants={inputVariants}
                                whileFocus="focus"
                                initial="blur"
                                name={field.name}
                                type={field.type}
                                // @ts-ignore
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                                placeholder={field.placeholder}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    borderRadius: '0.75rem',
                                    border: '2px solid #E5E7EB',
                                    outline: 'none',
                                    backgroundColor: '#F9FAFB'
                                }}
                            />
                        </div>
                    ))}

                    {/* Department Select */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>Department</label>
                        <motion.select
                            variants={inputVariants}
                            whileFocus="focus"
                            initial="blur"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #E5E7EB',
                                outline: 'none',
                                backgroundColor: '#F9FAFB'
                            }}
                        >
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                            {!departments.find(d => d.name === formData.department) && formData.department && <option value={formData.department}>{formData.department}</option>}
                        </motion.select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>Joining Date</label>
                        <motion.input
                            variants={inputVariants}
                            whileFocus="focus"
                            initial="blur"
                            type="date"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #E5E7EB',
                                outline: 'none',
                                backgroundColor: '#F9FAFB'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151', fontSize: '1.1rem' }}>Salary</label>
                        <motion.input
                            variants={inputVariants}
                            whileFocus="focus"
                            initial="blur"
                            type="number"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                borderRadius: '0.75rem',
                                border: '2px solid #E5E7EB',
                                outline: 'none',
                                backgroundColor: '#F9FAFB'
                            }}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem 2rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                borderRadius: '0.75rem',
                                background: isLoading ? '#9CA3AF' : '#4F46E5',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        style={{ width: '20px', height: '20px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                    />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} /> {isEdit ? 'Update Profile' : 'Register Employee'}
                                </>
                            )}
                        </motion.button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};
