import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080/api" : "");

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSent(true);
        return;
      }

      const message = data.message || '';
      if (message.toLowerCase().includes('verify your email')) {
        setError('Please verify your email before resetting your password.');
        setNeedsVerification(true);
        return;
      }

      toast.error(message || 'Failed to send reset link. Please try again.');
    } catch {
      toast.error('Could not connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-display bg-white overflow-x-hidden relative">

      {/* Left Column: Fixed Viewport Full-Height Hero Image & Motivation Panel */}
      <div className="w-full lg:w-1/2 h-[350px] sm:h-[420px] lg:h-full lg:fixed lg:top-0 lg:bottom-0 lg:left-0 relative flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white overflow-hidden bg-slate-900 z-10">
        {/* Background Image */}
        <img
          src="/images/auth-hero.jpeg"
          alt="TravelHub Journey Flight"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-900/50" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">TravelHub</span>
          </div>
        </div>

        {/* Bottom Tagline Quote Card */}
        <div className="relative z-10 bg-slate-900/60 backdrop-blur-md text-white rounded-2xl p-6 sm:p-8 border border-white/15 shadow-2xl max-w-xl my-6">
          <p className="font-extrabold tracking-wide text-xs sm:text-sm lg:text-base text-slate-100 uppercase leading-relaxed font-display">
            WHETHER YOU'RE DREAMING OF SUN-SOAKED BEACHES, BUSTLING CITYSCAPES, OR SERENE MOUNTAIN RETREATS, YOUR ADVENTURE STARTS HERE.
          </p>
        </div>
      </div>

      {/* Right Column: Full Screen Authentication Form */}
      <div className="w-full lg:w-1/2 lg:ml-auto min-h-screen bg-white p-6 sm:p-10 lg:p-16 flex flex-col justify-center overflow-y-auto font-display">
        <div className="max-w-2xl w-full mx-auto py-8">

          {/* Navigation Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wider mb-4 font-display"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight font-display">
              RESET YOUR{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                PASSWORD
              </span>
            </h1>
            <p className="text-slate-500 text-base mt-3 leading-relaxed font-normal">
              Enter your registered email address below and we'll send you a secure link to reset your password.
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6 font-display">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input email"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                />
              </div>

              {error && (
                <div className="flex flex-col gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-4 font-display">
                  <span>{error}</span>
                  {needsVerification && email && (
                    <Link
                      to={`/verify?email=${encodeURIComponent(email)}`}
                      className="text-teal-700 font-bold hover:text-teal-800 hover:underline transition-colors"
                    >
                      Go to email verification →
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 active:scale-[0.99] text-white font-bold text-base transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-6 font-display"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 text-center mt-6 font-display">
              <div className="flex justify-center mb-5">
                <CheckCircle className="w-16 h-16 text-teal-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3 font-display">Check your inbox</h2>
              <p className="text-base text-slate-600 mb-8 leading-relaxed font-display">
                If an account exists for <span className="font-bold text-slate-800">{email}</span>, a password reset link has been sent. Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                className="block w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 text-white font-bold text-base shadow-lg shadow-teal-500/20 transition text-center font-display"
              >
                Back to Login
              </Link>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-5 text-xs font-extrabold text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wider font-display"
              >
                Try a different email
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );

}

