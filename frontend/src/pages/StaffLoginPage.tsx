import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Stethoscope, HeartPulse, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPathForUser } from '../lib/navigation';

export const StaffLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const { login } = useAuth();
  const navigate = useNavigate();
  const redirectTo = searchParams.get('redirect');

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Verify it's a staff account
      const staffRoles = ['super_admin', 'hospital_admin', 'receptionist', 'doctor', 'lab_technician', 'pharmacist'];
      if (!staffRoles.includes(user.role.name)) {
        setError('This login is for hospital staff only. Please use the patient login.');
        return;
      }
      
      const destination = redirectTo || getDashboardPathForUser(user);
      navigate(destination);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to authenticate. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 dark:from-slate-900/80 dark:via-slate-900 dark:to-teal-950/40 medical-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-teal-600/30">
              <Activity className="w-8 h-8" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelli<span className="text-teal-600">Med</span>
            </span>
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hospital Staff Portal</h2>
            <p className="text-sm text-slate-500">Access administrative and clinical tools</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-3xl shadow-2xl space-y-6">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-teal-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@intellimed.local"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-teal-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 text-base">
              {loading ? 'Authenticating...' : 'Staff Sign In'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="pt-4 border-t border-teal-100 dark:border-teal-800">
            <div className="text-center space-y-3 text-sm text-slate-500">
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-500" />
                <span>Are you a patient?</span>
                <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                  Go to Patient Login
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-500" />
                <span>Face recognition?</span>
                <Link to="/face-login" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
                  Continue with Face
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>HIPAA-Compliant Security</span>
        </div>
      </div>
    </div>
  );
};
