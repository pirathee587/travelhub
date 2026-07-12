import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-10 text-center">
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
            <p className="text-slate-600 text-sm mb-8">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/signup"
                className="block w-full py-3 rounded-xl bg-slate-600 text-white font-semibold text-sm shadow-md hover:opacity-90 transition"
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
