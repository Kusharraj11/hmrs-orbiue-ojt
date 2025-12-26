import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, DollarSign, Target, User, ChevronRight } from 'lucide-react';
import { getSalaryComponents, createSalaryComponent, getEmployeeStructure, updateEmployeeStructure } from '../../api/payrollApi';
import { getEmployees } from '../../api/employeeApi';
import { toast } from 'react-hot-toast';
import './SalaryStructure.css';

const SalaryStructure = () => {
    const [activeTab, setActiveTab] = useState<'components' | 'assignment'>('components');
    const [components, setComponents] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [structure, setStructure] = useState<{ componentId: string, amount: number }[]>([]);

    // New Component Form
    const [newComp, setNewComp] = useState({ name: '', type: 'EARNING', isFixed: true, percentage: 0 });

    useEffect(() => {
        fetchComponents();
        fetchEmployees();
    }, []);

    const fetchComponents = async () => {
        try {
            const res = await getSalaryComponents();
            setComponents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data);
        } catch (err) { console.error(err); }
    }

    const handleCreateComponent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSalaryComponent(newComp);
            toast.success('Component Created');
            setNewComp({ name: '', type: 'EARNING', isFixed: true, percentage: 0 });
            fetchComponents();
        } catch (err) { toast.error('Failed to create component'); }
    };

    const loadEmployeeStructure = async (empId: string) => {
        setSelectedEmployee(empId);
        if (!empId) return;
        try {
            const res = await getEmployeeStructure(empId);
            const mapped = res.data.map((item: any) => ({
                componentId: item.componentId,
                amount: item.amount
            }));
            setStructure(mapped);
        } catch (err) { toast.error('Failed to load structure'); }
    };

    const handleUpdateStructure = async () => {
        if (!selectedEmployee) return;
        try {
            await updateEmployeeStructure(selectedEmployee, structure);
            toast.success('Structure Updated');
        } catch (err) { toast.error('Failed to update'); }
    }

    const handleAmountChange = (compId: string, val: number) => {
        setStructure(prev => {
            const existing = prev.find(p => p.componentId === compId);
            if (existing) {
                return prev.map(p => p.componentId === compId ? { ...p, amount: val } : p);
            } else {
                return [...prev, { componentId: compId, amount: val }];
            }
        });
    };

    return (
        <div className="ss-container">
            <div className="ss-header">
                <h1><DollarSign size={32} /> Salary Configuration</h1>
                <p>Manage your organization's salary components and assign personalized structures to employees.</p>
            </div>

            <div className="ss-tabs">
                <button
                    className={`ss-tab ${activeTab === 'components' ? 'active' : ''}`}
                    onClick={() => setActiveTab('components')}
                >
                    <Target size={18} /> Salary Components
                </button>
                <button
                    className={`ss-tab ${activeTab === 'assignment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignment')}
                >
                    <User size={18} /> Employee Assignment
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'components' ? (
                    <motion.div
                        key="components"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="ss-content"
                    >
                        {/* Create Form */}
                        <div className="ss-card">
                            <h3 className="ss-card-header">
                                <Plus size={20} color="#4f46e5" /> New Component
                            </h3>
                            <form onSubmit={handleCreateComponent}>
                                <div className="ss-form-group">
                                    <label className="ss-label">Component Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newComp.name}
                                        onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                                        className="ss-input"
                                        placeholder="e.g. Travel Allowance"
                                    />
                                </div>

                                <div className="ss-form-group">
                                    <label className="ss-label">Type</label>
                                    <select
                                        value={newComp.type}
                                        onChange={e => setNewComp({ ...newComp, type: e.target.value })}
                                        className="ss-select"
                                    >
                                        <option value="EARNING">Earning</option>
                                        <option value="DEDUCTION">Deduction</option>
                                    </select>
                                </div>

                                <div className="ss-form-group">
                                    <label className="ss-label">Method</label>
                                    <select
                                        value={newComp.isFixed ? 'FIXED' : 'PERCENT'}
                                        onChange={e => setNewComp({ ...newComp, isFixed: e.target.value === 'FIXED' })}
                                        className="ss-select"
                                    >
                                        <option value="FIXED">Fixed Amount</option>
                                        <option value="PERCENT">% of Basic</option>
                                    </select>
                                </div>

                                {!newComp.isFixed && (
                                    <div className="ss-form-group">
                                        <label className="ss-label">Percentage Value (%)</label>
                                        <input
                                            type="number"
                                            value={newComp.percentage}
                                            onChange={e => setNewComp({ ...newComp, percentage: Number(e.target.value) })}
                                            className="ss-input"
                                        />
                                    </div>
                                )}

                                <button type="submit" className="ss-btn ss-btn-primary">
                                    <Plus size={18} /> Create Component
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div>
                            <div className="ss-comp-grid">
                                {components.map(comp => (
                                    <div key={comp.id} className="ss-comp-item">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>{comp.name}</h4>
                                                <div>
                                                    <span className={`ss-comp-badge badge-${comp.type}`}>{comp.type}</span>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                        {comp.isFixed ? 'Fixed Amount' : `${comp.percentage}% of Basic`}
                                                    </span>
                                                </div>
                                            </div>
                                            {comp.type === 'EARNING' ? <DollarSign size={20} color="#16a34a" /> : <DollarSign size={20} color="#dc2626" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {components.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#f9fafb', borderRadius: '1rem', border: '2px dashed #e5e7eb' }}>
                                    No specific components loaded.
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="assignment"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="ss-card"
                        style={{ maxWidth: '800px', margin: '0 auto' }}
                    >
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 className="ss-card-header">Select Employee to Assign Structure</h3>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedEmployee}
                                    onChange={e => loadEmployeeStructure(e.target.value)}
                                    className="ss-select"
                                    style={{ paddingRight: '2.5rem', cursor: 'pointer' }}
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                                    ))}
                                </select>
                                <ChevronRight size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: '#9ca3af' }} />
                            </div>
                        </div>

                        {selectedEmployee && (
                            <div>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Define Amounts</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {components.map(comp => {
                                        const userVal = structure.find(s => s.componentId === comp.id)?.amount || 0;
                                        return (
                                            <div key={comp.id} className="ss-assignment-row">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: comp.type === 'EARNING' ? '#dcfce7' : '#fee2e2' }}>
                                                        <DollarSign size={18} color={comp.type === 'EARNING' ? '#166534' : '#991b1b'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{comp.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{comp.type}</div>
                                                    </div>
                                                </div>

                                                <div className="ss-input-money">
                                                    {comp.isFixed ? (
                                                        <input
                                                            type="number"
                                                            value={userVal}
                                                            onChange={e => handleAmountChange(comp.id, Number(e.target.value))}
                                                            className="ss-input"
                                                            placeholder="0.00"
                                                            style={{ textAlign: 'right' }}
                                                        />
                                                    ) : (
                                                        <div style={{ padding: '0.75rem', background: '#e5e7eb', borderRadius: '0.5rem', textAlign: 'right', fontSize: '0.9rem', fontFamily: 'monospace', color: '#6b7280' }}>
                                                            Calculated ({comp.percentage}%)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handleUpdateStructure}
                                        className="ss-btn ss-btn-primary"
                                        style={{ width: 'auto', padding: '0.75rem 2rem' }}
                                    >
                                        <Save size={18} /> Save Configuration
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalaryStructure;
