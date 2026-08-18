import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plane, ShieldCheck, Building2, Users, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const ROLE_CONFIG = {
  general: {
    label: 'TravelHub',
    icon: Plane,
    dashboardPath: '/',
    apiRole: 'TOURIST',
    color: 'from-teal-600 to-cyan-500',
    ring: 'focus:ring-teal-500/20 focus:border-teal-600',
  },
  tourist: {
    label: 'Tourist',
    icon: Plane,
    dashboardPath: '/tourist',
    apiRole: 'TOURIST',
    color: 'from-sky-500 to-cyan-400',
    ring: 'focus:ring-sky-500/20 focus:border-sky-500',
  },
  agency: {
    label: 'Travel Agency',
    icon: Users,
    dashboardPath: '/agency',
    apiRole: 'AGENT',
    color: 'from-violet-500 to-purple-400',
    ring: 'focus:ring-violet-500/20 focus:border-violet-500',
  },
  hotelowner: {
    label: 'Hotel Owner',
    icon: Building2,
    dashboardPath: '/hotelowner',
    apiRole: 'HOTEL_OWNER',
    color: 'from-emerald-500 to-teal-400',
    ring: 'focus:ring-emerald-500/20 focus:border-emerald-500',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    dashboardPath: '/admin',
    apiRole: 'ADMIN',
    color: 'from-rose-500 to-pink-400',
    ring: 'focus:ring-rose-500/20 focus:border-rose-500',
  },
};

const DASHBOARD_PATHS: Record<string, string> = {
  TOURIST: '/tourist/overview',
  AGENT: '/agency',
  HOTEL_OWNER: '/hotelowner',
  ADMIN: '/admin',
};

interface AuthPageProps {
  role?: 'tourist' | 'agency' | 'hotelowner' | 'admin';
  mode?: 'login' | 'signup';
}

export default function AuthPage({ role: propRole, mode }: AuthPageProps = {}) {
  const { role: paramRole } = useParams<{ role: string }>();
  const role = propRole || (paramRole as any);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState(() => {
    const r = role || 'general';
    return ROLE_CONFIG[r] ? r : 'general';
  });

  const config = ROLE_CONFIG[selectedRole] || ROLE_CONFIG.general;
  const [isLogin, setIsLogin] = useState(() => mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    telephone: '',
    preferredLanguage: 'en',
    nationality: '',
    agencyName: '',
    hotelName: '',
    businessRegistrationId: '',
    businessAddress: '',
    district: '',
  });

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      telephone: '',
      preferredLanguage: 'en',
      nationality: '',
      agencyName: '',
      hotelName: '',
      businessRegistrationId: '',
      businessAddress: '',
      district: '',
    });
    setError('');
  };

  const handleToggleMode = (loginState: boolean) => {
    setIsLogin(loginState);
    resetForm();
  };

  if (!config) {
    navigate('/');
    return null;
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
      if (!passwordRegex.test(form.password)) {
        setError('Password must be at least 8 characters long, contain at least one digit, one uppercase letter, one lowercase letter, and one special character');
        return;
      }
      if (!form.telephone) {
        setError('Telephone number is required');
        return;
      }
      if (!form.preferredLanguage) {
        setError('Preferred language is required');
        return;
      }
      if (config.apiRole === 'AGENT') {
        if (!form.agencyName) {
          setError('Agency name is required');
          return;
        }
      }
      if (config.apiRole === 'HOTEL_OWNER') {
        if (!form.hotelName) {
          setError('Hotel name is required');
          return;
        }
        if (!form.businessRegistrationId) {
          setError('Business Registration ID is required');
          return;
        }
        if (!form.businessAddress) {
          setError('Business Address is required');
          return;
        }
        if (!form.district) {
          setError('District is required');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const endpoint = isLogin
        ? `${BASE_URL}/auth/login`
        : `${BASE_URL}/auth/register`;

      let body: any = {};
      if (isLogin) {
        body = { email: form.email, password: form.password };
      } else {
        body = {
          name: form.name,
          email: form.email,
          password: form.password,
          telephone: form.telephone,
          role: config.apiRole,
          preferredLanguage: form.preferredLanguage,
        };

        if (config.apiRole === 'TOURIST') {
          body.nationality = form.nationality;
        } else if (config.apiRole === 'AGENT') {
          body.agencyName = form.agencyName;
        } else if (config.apiRole === 'HOTEL_OWNER') {
          body.hotelName = form.hotelName;
          body.businessRegistrationId = form.businessRegistrationId;
          body.businessAddress = form.businessAddress;
          body.district = form.district;
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || 'Something went wrong';
        let friendly = raw;
        const lower = raw.toLowerCase();
        if (lower.includes('invalid email or password') || lower.includes('bad credentials')) {
          friendly = 'Incorrect email or password. Please try again.';
        } else if (lower.includes('verify your email')) {
          friendly = 'Your email is not verified yet. Please check your inbox and click the verification link.';
        } else if (lower.includes('pending approval') || lower.includes('agent account is pending')) {
          friendly = 'Your account is pending admin approval. You will be notified by email once approved.';
        } else if (lower.includes('deactivated')) {
          friendly = 'Your account has been deactivated. Please contact support.';
        } else if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('already registered')) {
          friendly = 'An account with this email already exists. Try logging in instead.';
        } else if (lower.includes('no user found') || lower.includes('user not found')) {
          friendly = 'No account found with this email address.';
        }
        setError(friendly);
        return;
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user || {
        id: data.id,
        name: data.name,
        email: data.email || form.email,
        role: data.role || config.apiRole,
        agentId: data.agentId,
        hotelId: data.hotelId,
        profileImage: data.profileImage
      };

      login(user, token);
      
      const targetPath = DASHBOARD_PATHS[user.role] || config.dashboardPath || '/';
      navigate(targetPath);
    } catch (err) {
      setError('Could not connect to the server. Please check your connection and try again.');
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
        {/* Gradient Overlay for visual richness and contrast */}
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
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors uppercase tracking-wider mb-4 font-display"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight font-display">
              YOUR GATEWAY TO{' '}
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                UNFORGETTABLE JOURNEYS
              </span>
            </h1>
            <p className="text-slate-500 text-base mt-3 leading-relaxed font-normal">
              {isLogin
                ? 'Ready to embark on your next adventure? Log in now and let Traveler take you there. Your dream destination is just a click away!'
                : 'Ready to embark on your next adventure? Sign up now and let TravelHub take you there. Join thousands of travelers today!'}
            </p>
          </div>

          {/* Account Type Selector for Signup */}
          {!isLogin && (
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wide font-display">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3 bg-slate-100/80 p-2 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('tourist'); setError(''); }}
                  className={`py-3 px-4 text-sm font-bold rounded-xl transition-all font-display ${
                    selectedRole === 'tourist' || selectedRole === 'general'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Tourist
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('agency'); setError(''); }}
                  className={`py-3 px-4 text-sm font-bold rounded-xl transition-all font-display ${
                    selectedRole === 'agency'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Agent
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('hotelowner'); setError(''); }}
                  className={`py-3 px-4 text-sm font-bold rounded-xl transition-all font-display ${
                    selectedRole === 'hotelowner'
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  Hotel Owner
                </button>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-5 font-display">
            
            {/* Full Name (Signup Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Input email"
                className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 px-5 pr-12 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                />
              </div>
            )}

            {/* Additional Role Fields for Signup */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      required
                      placeholder="+94771234567"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Language
                    </label>
                    <select
                      name="preferredLanguage"
                      value={form.preferredLanguage}
                      onChange={handleChange}
                      required
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                    >
                      <option value="en">English</option>
                      <option value="sin">Sinhala</option>
                      <option value="tam">Tamil</option>
                    </select>
                  </div>
                </div>

                {config.apiRole === 'TOURIST' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={form.nationality}
                      onChange={handleChange}
                      placeholder="e.g. Sri Lankan"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                    />
                  </div>
                )}

                {config.apiRole === 'AGENT' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      name="agencyName"
                      value={form.agencyName}
                      onChange={handleChange}
                      required
                      placeholder="Agency Name"
                      className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                    />
                  </div>
                )}

                {config.apiRole === 'HOTEL_OWNER' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Hotel Name
                      </label>
                      <input
                        type="text"
                        name="hotelName"
                        value={form.hotelName}
                        onChange={handleChange}
                        required
                        placeholder="Hotel Name"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                          Registration ID
                        </label>
                        <input
                          type="text"
                          name="businessRegistrationId"
                          value={form.businessRegistrationId}
                          onChange={handleChange}
                          required
                          placeholder="BR-12345"
                          className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                          District
                        </label>
                        <select
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                          required
                          className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                        >
                          <option value="">Select District</option>
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                        Business Address
                      </label>
                      <input
                        type="text"
                        name="businessAddress"
                        value={form.businessAddress}
                        onChange={handleChange}
                        required
                        placeholder="Address"
                        className="w-full h-14 px-5 rounded-2xl border border-slate-200 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all font-display"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Options Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
              <span className="text-sm text-slate-600 font-medium font-display">
                {isLogin ? (
                  <>
                    New to Traveler?{' '}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(false)}
                      className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors font-display"
                    >
                      Create an Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(true)}
                      className="font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors font-display"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </span>

              {isLogin && (
                <Link
                  to="/forgot-password"
                  className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors font-display"
                >
                  Forgot your password?
                </Link>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl p-4 font-display">
                <span className="mt-0.5 shrink-0 text-red-500 font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Main Action Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 active:scale-[0.99] text-white font-bold text-base transition-all duration-200 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-6 font-display"
            >
              {loading
                ? (isLogin ? 'Logging in...' : 'Creating Account...')
                : (isLogin ? 'Login - Continue Exploring and Planning' : 'Sign Up - Start Your Journey')}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}




