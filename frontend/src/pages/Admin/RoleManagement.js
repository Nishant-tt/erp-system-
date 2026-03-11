import React, { useState, useEffect } from 'react';
import { getRolesAPI, createRoleAPI, updateRoleAPI, deleteRoleAPI } from '../../api/role';
import {
    Shield,
    ShieldCheck,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Lock,
    Key,
    Edit2,
    Trash2
} from 'lucide-react';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        permissions: []
    });

    const permissionScopes = [
        {
            key: 'sales',
            label: 'Sales',
            actions: ['view', 'create', 'update', 'approve', '_delete', '_adjust', '_post']
        },
        {
            key: 'crm',
            label: 'CRM',
            actions: ['view', 'create', 'update', '_delete', '_adjust', '_post']
        },
        {
            key: 'procurement',
            label: 'Procurement',
            actions: ['view', 'create', 'update', 'approve', '_delete', '_adjust', '_post']
        },
        {
            key: 'reports',
            label: 'Reports',
            actions: ['view', '_delete', '_adjust', '_post']
        },
        {
            key: 'finance',
            label: 'Financial',
            actions: ['view', 'create', 'update', 'approve', '_delete', '_adjust', '_post']
        },
        {
            key: 'admin',
            label: 'Admin',
            actions: ['view', 'create', 'update', 'delete', '_delete', '_adjust', '_post']
        },
    ];

    const knownPermissions = new Set(
        permissionScopes.flatMap((s) => s.actions.map((a) => `${s.key}.${a}`))
    );

    const [customPermission, setCustomPermission] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const data = await getRolesAPI();
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setMessage({ type: 'error', text: 'Failed to load roles.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                permissions: role.permissions || []
            });
        } else {
            setEditingRole(null);
            setFormData({ name: '', permissions: [] });
        }
        setShowModal(true);
    };

    const handleTogglePermission = (perm) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const handleAddCustomPermission = () => {
        const raw = customPermission.trim();
        if (!raw) return;
        const normalized = raw;
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(normalized)
                ? prev.permissions
                : [...prev.permissions, normalized],
        }));
        setCustomPermission('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Role Name is required";
        if (formData.permissions.length === 0) return "Please select at least one permission";
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
            if (editingRole) {
                await updateRoleAPI(editingRole._id, formData);
                setMessage({ type: 'success', text: 'Role updated successfully!' });
            } else {
                await createRoleAPI(formData);
                setMessage({ type: 'success', text: 'Role created successfully!' });
            }
            setShowModal(false);
            fetchRoles();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to process role.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await deleteRoleAPI(id);
            setMessage({ type: 'success', text: 'Role deleted successfully!' });
            fetchRoles();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete role.' });
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Role & Permissions</h1>
                    <p className="text-slate-500 text-sm font-medium">Define access levels and system capabilities per role.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={18} />
                    New Role
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-bold">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {roles.map((role) => (
                    <div key={role._id} className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(role)} className="p-1.5 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(role._id)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-2 truncate">{role.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {role.permissions?.slice(0, 3).map((perm, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-md border border-slate-100 uppercase">
                                    {perm.replace('_', ' ')}
                                </span>
                            ))}
                            {role.permissions?.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400 mt-0.5">+{role.permissions.length - 3} more</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create/Edit Role Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-white to-slate-50 rounded-t-3xl sm:rounded-[32px] shadow-[0_24px_80px_rgba(15,23,42,0.35)] border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 sm:px-8 py-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/60">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                        {editingRole ? 'Edit Role' : 'Create New Role'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Define a new access group and fine-tune module permissions.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-medium text-sm"
                                        placeholder="e.g. Procurement Manager"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Key size={14} className="text-primary" />
                                    Select Permissions
                                </label>
                                <div className="space-y-4">
                                    {permissionScopes.map((scope) => (
                                        <div key={scope.key} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                    {scope.label}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {scope.key}.*
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {scope.actions.map((action) => {
                                                    const perm = `${scope.key}.${action}`;
                                                    const isSelected = formData.permissions.includes(perm);
                                                    return (
                                                        <button
                                                            key={perm}
                                                            type="button"
                                                            onClick={() => handleTogglePermission(perm)}
                                                            className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${isSelected
                                                                ? 'border-primary bg-primary/5 text-primary'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {action}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Unknown/custom permissions already on the role */}
                                    {formData.permissions.filter((p) => !knownPermissions.has(p)).length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                                                Custom / Legacy permissions
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.permissions
                                                    .filter((p) => !knownPermissions.has(p))
                                                    .map((perm) => (
                                                        <button
                                                            key={perm}
                                                            type="button"
                                                            onClick={() => handleTogglePermission(perm)}
                                                            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                                                            title="Click to remove"
                                                        >
                                                            {perm}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add custom permission */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                                            Add custom permission
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="text"
                                                value={customPermission}
                                                onChange={(e) => setCustomPermission(e.target.value)}
                                                placeholder="e.g. sales.view"
                                                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:bg-white focus:border-primary/20 transition-all text-sm font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomPermission}
                                                className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[11px] text-slate-400">
                                            Tip: Use dot-notation like <span className="font-semibold text-slate-600">sales.approve</span>.
                                        </p>
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
                                            <Shield size={18} />
                                            {editingRole ? 'Update Role' : 'Save Role & Permissions'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
