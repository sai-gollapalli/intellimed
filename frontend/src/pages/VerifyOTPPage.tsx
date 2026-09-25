import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../lib/axios';

const getErrorMessage = (err: any): string => {
  const data = err?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item: any) => item?.msg || item?.message || 'Validation failed').join(', ');
  }

  if (data?.detail && typeof data.detail === 'object') {
    return data.detail.msg || 'Invalid or expired OTP code.';
  }

  return 'Invalid or expired OTP code.';
};

export const VerifyOTPPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = searchParams.get('purpose') || 'email_verification';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', {
        email,
        code,
        purpose,
      });

      setMessage('Verification successful! Please sign in to continue.');
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent('/face-enroll')}&verified=true`);
      }, 1500);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    try {
      await api.post('/auth/send-otp', { email, purpose });
      setMessage('A new OTP has been sent to your email.');
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-7 h-7" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelli<span className="text-sky-600">Med</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2">Enter Verification Code</h2>
          <p className="text-xs text-slate-500">We sent a 6-digit OTP code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span></p>
        </div>

        <div className="glass-card p-8 rounded-2xl shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs text-center">
            💡 Testing mode: Use code <strong className="font-mono bg-sky-100 dark:bg-sky-900 px-1.5 py-0.5 rounded text-sky-900 dark:text-sky-100">123456</strong> if you haven't configured an SMTP server.
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="input-field text-center text-2xl font-mono tracking-widest uppercase py-3"
              />
            </div>

            <button type="submit" disabled={loading || code.length !== 6} className="w-full btn-primary py-3">
              {loading ? 'Verifying...' : 'Verify Code'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Didn't receive code?</span>
            <button onClick={handleResend} className="text-sky-600 font-semibold hover:underline">
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
