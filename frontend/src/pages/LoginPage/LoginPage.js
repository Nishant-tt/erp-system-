import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff, Loader2, ShieldCheck, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import { loginAPI } from '../../api/auth';
import { getFinancialYearsAPI } from '../../api/financialYear';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFY, setSelectedFY] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
    fetchFYs();
  }, [navigate]);

  const fetchFYs = async () => {
    try {
      setIsPageLoading(true);
      const data = await getFinancialYearsAPI();
      setFinancialYears(data);

      // Auto-select the active financial year
      const activeFY = data.find(fy => fy.isActive);
      if (activeFY) {
        setSelectedFY(activeFY._id);
      } else if (data.length > 0) {
        // Fallback to first one if none are marked active
        setSelectedFY(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load financial years:', err);
      // We don't block the page, but let users know
      setError('System settings could not be loaded. Please refresh.');
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFY) {
      setError('Please select a financial year.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await loginAPI(email, password, selectedFY);

      // Store auth data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('role', data.user.role.name);
      localStorage.setItem('departmentId', data.user.department?._id || data.user.department || '');

      // Store the active financial year context
      if (data.financialYear) {
        localStorage.setItem('activeFY', JSON.stringify(data.financialYear));
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* Left Side - Visual/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600 blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center lg:text-left">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight underline tracking-widest leading-none">
              PO <span className="text-blue-500">MANAGER</span>
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Streamlined Purchase <br />
            <span className="text-blue-500">& Inventory System</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Experience efficiency with PO Manager. A specialized ecosystem for requisitions, approvals, and procurement.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-800">
            <div>
              <p className="text-3xl font-bold text-white mb-1">99.9%</p>
              <p className="text-slate-500 text-sm">System Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white mb-1">24/7</p>
              <p className="text-slate-500 text-sm">Active Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-[#F8FAFC] overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">PO Manager</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500">Please enter your details to sign in to your dashboard.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 items-center text-red-700 text-sm leading-snug">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 tracking-wide">Work Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || isPageLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 tracking-wide">Financial Year</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                  <Calendar size={18} />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 appearance-none font-bold text-slate-700"
                  value={selectedFY}
                  onChange={(e) => setSelectedFY(e.target.value)}
                  required
                  disabled={isLoading || isPageLoading}
                >
                  {isPageLoading ? (
                    <option>Loading years...</option>
                  ) : (
                    financialYears.map((fy) => (
                      <option key={fy._id} value={fy._id}>
                        {fy.name} {fy.isActive ? '(Current)' : ''}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {isPageLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 tracking-wide">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || isPageLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading || isPageLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" size="sm" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-3 group"
              disabled={isLoading || isPageLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to PO Manager
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Secured Connection • <span className="font-semibold text-slate-700">AES-256 Encryption</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
