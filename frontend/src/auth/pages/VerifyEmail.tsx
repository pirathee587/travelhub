import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, Send } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(searchParams.get('email') || '');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token found.');
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully. You can now login.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may have expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Could not connect to the server. Please try again later.');
      }
    };

    verify();
  }, [searchParams]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendStatus({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setResending(true);
    setResendStatus(null);

    try {
      const res = await fetch(`${BASE_URL}/auth/resend-verification?email=${encodeURIComponent(resendEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setResendStatus({ type: 'success', text: data.message || 'Verification email resent! Please check your inbox.' });
      } else {
        setResendStatus({ type: 'error', text: data.message || 'Failed to resend verification email.' });
      }
    } catch {
      setResendStatus({ type: 'error', text: 'Server connection error. Please try again later.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/TravelHUB.png"
            alt="TravelHub"
            className="h-12 w-auto"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {/* Verifying */}
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-16 h-16 text-teal-500 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Verifying your email...</h1>
            <p className="text-slate-500 text-sm">Please wait a moment while we verify your account.</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-teal-500" />
            </div>
            <h1 className="text-xl font-bold text-teal-700 mb-2">Email Verified!</h1>
            <p className="text-slate-600 text-sm mb-8">{message}</p>
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-slate-600 text-sm mb-6">{message}</p>

            {/* Resend Verification Form */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200/80 text-left">
              <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600" /> Need a new link?
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                Enter your email address to receive a fresh verification email:
              </p>
              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  required
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Resend Verification Email
                    </>
                  )}
                </button>
              </form>

              {resendStatus && (
                <div
                  className={`mt-3 p-3 rounded-lg text-xs font-medium ${resendStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                  {resendStatus.text}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                className="block w-full py-3 rounded-xl bg-slate-700 text-white font-semibold text-sm shadow-md hover:bg-slate-800 transition"
              >
                Back to Sign Up
              </Link>
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

