import React, { useState, useEffect } from 'react';
import { getProfileAPI, updateProfileAPI } from '../../api/user';
import { getModulesAPI } from '../../api/modules';
import { User, Shield, Key, Image as ImageIcon, CheckCircle, ChevronRight, LayoutDashboard } from 'lucide-react';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [modules, setModules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, modulesData] = await Promise.all([
                    getProfileAPI(),
                    getModulesAPI()
                ]);
                setProfile(profileData);
                setModules(modulesData);
            } catch (error) {
                console.error('Full Error Object:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Failed to load profile data.';
                setMessage({ type: 'error', text: `Error: ${errorMessage}` });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setIsUpdating(true);
        try {
            const updatedProfile = await updateProfileAPI(formData);
            setProfile(updatedProfile);
            setMessage({ type: 'success', text: 'Profile picture updated!' });
            // Update session storage for immediate UI update in sidebar/header if needed
            sessionStorage.setItem('userName', updatedProfile.name);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar Upload */}
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-500/20 overflow-hidden ring-4 ring-white">
                            {profile?.profileImage ? (
                                <img
                                    src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.profileImage}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                profile?.name?.charAt(0)
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:scale-110 active:scale-95 group-hover/avatar:ring-4 ring-blue-500/10">
                            <ImageIcon size={18} className="text-blue-600" />
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                        {isUpdating && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{profile?.name}</h1>
                        <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                            {profile?.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Shield size={14} />
                                {profile?.role?.name}
                            </span>
                            <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
                                Active Account
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    <CheckCircle size={18} />
                    <span className="text-sm font-bold">{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-current opacity-50 hover:opacity-100 font-black">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Information */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <User size={20} />
                            </div>
                            <h2 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Profile Details</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Full Name</p>
                                <p className="text-sm font-bold text-slate-700">{profile?.name}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">User ID</p>
                                <p className="text-sm font-bold text-slate-700 font-mono">{profile?._id}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Account Status</p>
                                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Verified
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module & Menu Rights */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Key size={20} />
                            </div>
                            <h2 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Module & Menu Rights</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((mod, idx) => (
                                <div key={idx} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden group hover:border-indigo-200 transition-all">
                                    <div className="p-4 flex items-center gap-3 bg-white border-b border-slate-100">
                                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <LayoutDashboard size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Module</p>
                                            <p className="text-sm font-bold text-slate-900 leading-none">{mod.name}</p>
                                        </div>
                                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <CheckCircle size={12} />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Menus Enabled</p>
                                        <div className="flex flex-wrap gap-2">
                                            {mod.menus?.map((menu, mIdx) => (
                                                <div key={mIdx} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] font-bold text-slate-600 group-hover:border-indigo-100">
                                                    <ChevronRight size={10} className="text-indigo-400" />
                                                    {menu.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
