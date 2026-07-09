import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch {
      toast.error('Could not connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Back button */}
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-sky-500 to-teal-500 p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">Account Recovery</p>
              <h1 className="text-white text-xl font-bold">Forgot Password</h1>
            </div>
          </div>

          <div className="p-6">
            {!sent ? (
              <>
                <p className="text-sm text-slate-500 mb-6">
                  Enter your registered email address and we'll send you a secure link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-14 h-14 text-teal-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Check your inbox</h2>
                <p className="text-sm text-slate-500 mb-6">
                  If an account exists for <span className="font-semibold text-slate-700">{email}</span>, a password reset link has been sent. Check your spam folder if you don't see it.
                </p>
                <Link
                  to="/login"
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-3 text-sm text-slate-500 hover:text-slate-700 transition"
                >
                  Try a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
