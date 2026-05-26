import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';

const DEPT_COLORS = [
    'oklch(0.5016 0.1887 27.4816)',
    'oklch(0.4955 0.0896 126.1858)',
    'oklch(0.588 0.0993 245.7394)',
    'oklch(0.7076 0.1975 46.4558)',
    'oklch(0.5656 0.0431 40.43)',
    'oklch(0.7839 0.1719 68.0943)',
];

const DepartmentList = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [formData, setFormData] = useState({ name: '', description: '', budget: '' });

    const canManage = user?.role === 'admin' || user?.role === 'hr_manager';

    useEffect(() => {
        fetchDepartments();
        if (canManage) fetchEmployees();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/departments');
            setDepartments(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/api/employees');
            setEmployees(res.data.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedDepartment) {
                await api.put(`/api/departments/${selectedDepartment._id}`, {
                    ...formData, budget: parseFloat(formData.budget),
                });
            } else {
                await api.post('/api/departments', {
                    ...formData, budget: parseFloat(formData.budget),
                });
            }
            setShowModal(false);
            resetForm();
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving department');
        }
    };

    const handleEdit = (dept) => {
        setSelectedDepartment(dept);
        setFormData({ name: dept.name, description: dept.description, budget: dept.budget?.toString() || '0' });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await api.delete(`/api/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting department');
        }
    };

    const handleAssignEmployee = async () => {
        if (!selectedEmployee || !selectedDepartment) return;
        try {
            await api.put(`/api/departments/${selectedDepartment._id}/assign-employee`, {
                employeeId: selectedEmployee,
            });
            setShowAssignModal(false);
            setSelectedEmployee('');
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error assigning employee');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', budget: '' });
        setSelectedDepartment(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6" style={{ fontFamily: 'var(--font-sans)' }}>

            {/* Header */}
            <div className="page-header flex items-start justify-between">
                <div>
                    <h1 className="page-title">Departments</h1>
                    <p className="page-subtitle">Manage all departments in the organization.</p>
                </div>
                {canManage && (
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Department
                    </button>
                )}
            </div>

            {/* Department grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept, i) => (
                    <div
                        key={dept._id}
                        className="card relative overflow-hidden"
                    >
                        {/* Color strip */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }}
                        />
                        <div className="p-5 pt-6">
                            <div className="flex items-start justify-between">
                                <h3
                                    className="text-base font-bold uppercase tracking-wider"
                                    style={{ color: 'oklch(0.2393 0 0)' }}
                                >
                                    {dept.name}
                                </h3>
                                {canManage && (
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="p-1 transition-opacity hover:opacity-60"
                                            style={{ color: 'oklch(0.5016 0.1887 27.4816)' }}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => handleDelete(dept._id)}
                                                className="p-1 transition-opacity hover:opacity-60"
                                                style={{ color: 'oklch(0.6 0.15 30)' }}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <p className="mt-2 text-sm" style={{ color: 'oklch(0.45 0 0)' }}>
                                {dept.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-sm" style={{ color: 'oklch(0.4 0 0)' }}>
                                    <UsersIcon className="h-4 w-4" />
                                    <span className="font-semibold">{dept.employees?.length || 0}</span>
                                    <span>employees</span>
                                </div>
                                <span
                                    className="text-sm font-bold"
                                    style={{ color: DEPT_COLORS[i % DEPT_COLORS.length] }}
                                >
                                    ${dept.budget?.toLocaleString() || '0'}
                                </span>
                            </div>
                        </div>

                        <div
                            className="px-5 py-3 flex items-center justify-between"
                            style={{ borderTop: '2px solid oklch(0.6 0 0)' }}
                        >
                            <span className={`badge ${dept.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                                {dept.status}
                            </span>
                            {canManage && (
                                <button
                                    onClick={() => { setSelectedDepartment(dept); setShowAssignModal(true); }}
                                    className="text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-60"
                                    style={{ color: 'oklch(0.588 0.0993 245.7394)' }}
                                >
                                    + Assign Employee
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dept Form Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {selectedDepartment ? 'Edit Department' : 'New Department'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div>
                                    <label className="form-label">Department Name *</label>
                                    <select
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required className="input-field"
                                    >
                                        <option value="">Select Department</option>
                                        {['IT', 'Finance', 'Human Resource', 'Marketing', 'Sales', 'Operations'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required rows={3} className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedDepartment ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Employee Modal */}
            {showAssignModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">Assign to {selectedDepartment?.name}</h3>
                            <button onClick={() => setShowAssignModal(false)} className="hover:opacity-60">✕</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="form-label">Select Employee</label>
                                <select
                                    value={selectedEmployee}
                                    onChange={e => setSelectedEmployee(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Choose an employee</option>
                                    {employees
                                        .filter(e => e.department?._id !== selectedDepartment?._id)
                                        .map(e => (
                                            <option key={e._id} value={e._id}>
                                                {e.fullName} — {e.position}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowAssignModal(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignEmployee}
                                disabled={!selectedEmployee}
                                className="btn-primary"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;