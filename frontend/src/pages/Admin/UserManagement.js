import React, { useState, useEffect } from 'react';
import { getUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI } from '../../api/user';
import { getRolesAPI } from '../../api/role';
import { getDepartmentsAPI } from '../../api/org';
import {
    Users,
    UserPlus,
    Mail,
    Lock,
    Shield,
    Building2,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Edit2,
    Trash2
} from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        department: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersData, rolesData, deptsData] = await Promise.all([
                getUsersAPI(),
                getRolesAPI(),
                getDepartmentsAPI()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
            setDepartments(deptsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Failed to load user data.' });
        } finally {
            setIsLoading(false);
        }
    };

    const userRole = localStorage.getItem('role') || '';
    const userDeptId = localStorage.getItem('departmentId') || '';

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Don't show password
                role: user.role?._id || '',
                department: user.department?._id || '',
                status: user.status || 'ACTIVE'
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: '',
                department: userRole === 'Admin' ? userDeptId : '',
                status: 'ACTIVE'
            });
        }
        setShowModal(true);
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Full Name is required";
        if (!formData.email.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
        if (!editingUser && !formData.password) return "Password is required";
        if (!editingUser && formData.password.length < 6) return "Password must be at least 6 characters";
        if (!formData.role) return "Please select a Role";
        if (!formData.department) return "Please select a Department";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setMessage({ type: 'error', text: validationError });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingUser) {
                await updateUserAPI(editingUser._id, formData);
                setMessage({ type: 'success', text: 'User updated successfully!' });
            } else {
                await createUserAPI(formData);
                setMessage({ type: 'success', text: 'User created successfully!' });
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process request.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await deleteUserAPI(id);
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-2 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-sm font-medium">Control platform access and organizational assignments.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <UserPlus size={18} />
                    Add Member
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="table-responsive custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role & Dept</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase">
                                                {user.role?.name || 'No Role'}
                                            </span>
                                            <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                                                <Building2 size={12} className="text-slate-400" />
                                                {user.department?.name || 'No Dept'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(user)}
                                                className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-[32px] shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 gap-3">
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                                    {editingUser ? 'Edit Member' : 'New Member'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium truncate">
                                    {editingUser ? 'Update user details and access.' : 'Add user and assign organizational roles.'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shrink-0" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Users size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Password {editingUser && '(Leave blank to keep current)'}
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Role</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Shield size={16} />
                                        </div>
                                        <select
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm appearance-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            {roles
                                                .filter(r => {
                                                    // Admin cannot create another Admin
                                                    if (userRole === 'Admin') {
                                                        return r.name !== 'Admin';
                                                    }
                                                    return true;
                                                })
                                                .map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Building2 size={16} />
                                        </div>
                                        <select
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm appearance-none"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Dept</option>
                                            {departments
                                                .filter(d => {
                                                    // Admins can only select their own department
                                                    if (userRole === 'Admin') {
                                                        return d._id === userDeptId;
                                                    }
                                                    return true;
                                                })
                                                .map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-4 py-4 bg-primary text-white rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        {editingUser ? 'Update Member' : 'Create User Account'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
