import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const EmployeeList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        email: '',
        phoneNumber: '',
        position: '',
        department: '',
        salary: '',
        joiningDate: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, [search, departmentFilter, statusFilter, page]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (departmentFilter) params.department = departmentFilter;
            if (statusFilter) params.status = statusFilter;

            const response = await api.get('/api/employees', { params });
            setEmployees(response.data.data);
            setTotalPages(Math.ceil(response.data.count / 10) || 1);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments');
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedEmployee) {
                await api.put(`/api/employees/${selectedEmployee._id}`, formData);
            } else {
                await api.post('/api/employees', formData);
            }
            setShowModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Error saving employee:', error);
            alert(error.response?.data?.message || 'Error saving employee');
        }
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            fullName: employee.fullName,
            gender: employee.gender,
            dateOfBirth: employee.dateOfBirth?.split('T')[0],
            email: employee.email,
            phoneNumber: employee.phoneNumber,
            position: employee.position,
            department: employee.department?._id || employee.department,
            salary: employee.salary,
            joiningDate: employee.joiningDate?.split('T')[0],
            address: {
                street: employee.address?.street || '',
                city: employee.address?.city || '',
                state: employee.address?.state || '',
                zipCode: employee.address?.zipCode || '',
                country: employee.address?.country || ''
            }
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/api/employees/${id}`);
                fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
                alert(error.response?.data?.message || 'Error deleting employee');
            }
        }
    };

    const handleFileUpload = async (e, employeeId) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('profilePicture', file);

        try {
            await api.put(`/api/employees/${employeeId}/profile-picture`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchEmployees();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading profile picture');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setSelectedEmployee(null);
        setFormData({
            fullName: '',
            gender: 'Male',
            dateOfBirth: '',
            email: '',
            phoneNumber: '',
            position: '',
            department: '',
            salary: '',
            joiningDate: '',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'badge-green';
            case 'Inactive': return 'badge-yellow';
            case 'Terminated': return 'badge-red';
            default: return 'badge-gray';
        }
    };

    const canManageEmployees = user?.role === 'admin' || user?.role === 'hr_manager';

    return (
        <div className="w-full">
            {/* Page Title Header Block */}
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Employees</h1>
                    <p className="page-subtitle">A real-time list of active organization personnel records.</p>
                </div>
                {canManageEmployees && (
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-primary"
                    >
                        <PlusIcon className="h-4 w-4 mr-2 stroke-[3]" />
                        Add Employee
                    </button>
                )}
            </div>

            {/* Filters Area inside a stylized block box */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8 p-4 border-2" style={{ backgroundColor: 'oklch(var(--card))', borderColor: 'oklch(var(--border))', boxShadow: '4px 4px 0 oklch(var(--border))' }}>
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'oklch(var(--muted-foreground))' }} />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-9"
                    />
                </div>
                <div>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="input-field cursor-pointer"
                    >
                        <option value="">All Departments</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field cursor-pointer"
                    >
                        <option value="">All Operational Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Terminated">Terminated</option>
                    </select>
                </div>
            </div>

            {/* Structural Table Core wrapper */}
            <div className="table-wrapper">
                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-[oklch(var(--card))]">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full m-0 border-none">
                            <thead className="table-header">
                            <tr>
                                <th>Profile</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Salary</th>
                                <th>Status</th>
                                {canManageEmployees && <th className="text-right">Actions</th>}
                            </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'oklch(var(--border))' }}>
                            {employees.length === 0 ? (
                                <tr className="table-row">
                                    <td colSpan={canManageEmployees ? 8 : 7} className="text-center py-12 font-semibold uppercase tracking-wider" style={{ color: 'oklch(var(--muted-foreground))' }}>
                                        No personnel records found matching search queries.
                                    </td>
                                </tr>
                            ) : (
                                employees.map((employee) => (
                                    <tr key={employee._id} className="table-row">
                                        <td>
                                            <div className="flex items-center">
                                                {canManageEmployees ? (
                                                    <label className="cursor-pointer relative group">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileUpload(e, employee._id)}
                                                            className="hidden"
                                                            disabled={uploading}
                                                        />
                                                        {employee.profilePicture && employee.profilePicture !== 'default-profile.jpg' ? (
                                                            <img
                                                                src={`http://localhost:5000/uploads/profiles/${employee.profilePicture}`}
                                                                alt={employee.fullName}
                                                                className="h-9 w-9 border-2 object-cover"
                                                                style={{ borderColor: 'oklch(var(--foreground))' }}
                                                            />
                                                        ) : (
                                                            <div className="h-9 w-9 border-2 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'oklch(var(--accent))', color: 'oklch(var(--accent-foreground))', borderColor: 'oklch(var(--foreground))' }}>
                                                                {employee.fullName?.charAt(0)?.toUpperCase()}
                                                            </div>
                                                        )}
                                                    </label>
                                                ) : (
                                                    <div className="h-9 w-9 border-2 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'oklch(var(--muted))', color: 'oklch(var(--foreground))', borderColor: 'oklch(var(--border))' }}>
                                                        {employee.fullName?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-bold uppercase tracking-wide">{employee.fullName}</td>
                                        <td className="font-mono text-xs">{employee.email}</td>
                                        <td>{employee.department?.name || 'N/A'}</td>
                                        <td>{employee.position}</td>
                                        <td className="font-mono font-semibold">${employee.salary?.toLocaleString()}</td>
                                        <td>
                                                <span className={`badge ${getStatusClass(employee.status)}`}>
                                                    {employee.status}
                                                </span>
                                        </td>
                                        {canManageEmployees && (
                                            <td className="text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="inline-flex items-center justify-center p-1.5 border-2 transition-all bg-[oklch(var(--card))] hover:bg-[oklch(var(--muted))]"
                                                    style={{ borderColor: 'oklch(var(--foreground))' }}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                {user?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(employee._id)}
                                                        className="inline-flex items-center justify-center p-1.5 border-2 transition-all bg-[oklch(var(--destructive))] text-[oklch(var(--destructive-foreground))] hover:opacity-90"
                                                        style={{ borderColor: 'oklch(var(--foreground))' }}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination System */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(var(--muted-foreground))' }}>
                    Showing page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="btn-secondary text-xs font-bold"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="btn-secondary text-xs font-bold"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Add / Edit Record Modal Framework */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {selectedEmployee ? 'Edit Profile Record' : 'Create Personnel Record'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-2 py-1 text-xs font-bold uppercase border-2 border-transparent bg-[oklch(var(--destructive))] text-[oklch(var(--destructive-foreground))]"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Gender *</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="input-field cursor-pointer"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Date of Birth *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Email Handle *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Phone Connection *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Corporate Position *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Assigned Department *</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            required
                                            className="input-field cursor-pointer"
                                        >
                                            <option value="">Select Domain</option>
                                            {departments.map((dept) => (
                                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Salary Allocation *</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="form-label">Official Joining Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <hr className="section-divider" />
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-[oklch(var(--primary))]">Residential Address Fields</h4>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="form-label">Street Registry</label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, street: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, city: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">State / Province</label>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, state: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Zip Code</label>
                                        <input
                                            type="text"
                                            value={formData.address.zipCode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, zipCode: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Country</label>
                                        <input
                                            type="text"
                                            value={formData.address.country}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                address: { ...formData.address, country: e.target.value }
                                            })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Save Operational Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;