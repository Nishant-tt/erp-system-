import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ForgetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong');

            setIsSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 font-sans">
                <div className="w-full max-w-[420px] bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Check your email</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. Please check your inbox.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-8 font-sans overflow-hidden bg-slate-900">
            {/* Professional Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"></div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl shadow-black/20 border border-white/20">
                    <div className="mb-10 text-center">
                        <div className="flex justify-center gap-3 mb-8">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 ring-4 ring-blue-50">
                                <ShieldCheck className="text-white" size={32} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Forgot Password?</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">Enter your email and we'll send you a secure link to reset your account.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center text-red-700 text-sm font-medium">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 tracking-wide ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400 font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-3 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={22} className="animate-spin text-white/80" />
                                    <span>Verifying Account...</span>
                                </>
                            ) : (
                                <span>Reset Password</span>
                            )}
                        </button>

                        <div className="pt-4 border-t border-slate-100 flex justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:underline transition-all"
                            >
                                <ArrowLeft size={16} />
                                <span>Back to login</span>
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400/80 text-sm font-medium">
                        Need help? <button className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4">Contact Support</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgetPasswordPage;
