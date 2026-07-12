import { useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plane, ShieldCheck, Building2, Users, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { validateNIC } from '@/utils/nicValidation';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const ROLE_CONFIG = {
  tourist: {
    label: 'Tourist',
    icon: Plane,
    color: 'from-sky-500 to-cyan-400',
    dashboardPath: '/tourist',
    apiRole: 'TOURIST',
  },
  agency: {
    label: 'Travel Agency',
    icon: Users,
    color: 'from-violet-500 to-purple-400',
    dashboardPath: '/agency',
    apiRole: 'AGENT',
  },
  hotelowner: {
    label: 'Hotel Owner',
    icon: Building2,
    color: 'from-emerald-500 to-teal-400',
    dashboardPath: '/hotelowner',
    apiRole: 'HOTEL_OWNER',
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    color: 'from-rose-500 to-pink-400',
    dashboardPath: '/admin',
    apiRole: 'ADMIN',
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRole, setSelectedRole] = useState(() => {
    const r = role || 'tourist';
    return ROLE_CONFIG[r] ? r : 'tourist';
  });

  const config = ROLE_CONFIG[selectedRole] || ROLE_CONFIG.tourist;
  const [isLogin, setIsLogin] = useState(() => mode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

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
    nicNumber: '',
  });

  if (!config) {
    navigate('/');
    return null;
  }

  const Icon = config.icon;

  const handleScanNIC = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const toastId = toast.loading('Scanning NIC...');

    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      const oldNicMatch = text.match(/[0-9]{9}[vVxX]/);
      const newNicMatch = text.match(/[0-9]{12}/);
      const extractedNic = (newNicMatch ? newNicMatch[0] : (oldNicMatch ? oldNicMatch[0] : '')).toUpperCase();

      if (extractedNic) {
        const validation = validateNIC(extractedNic);
        if (validation.isValid) {
          setForm(prev => ({ ...prev, nicNumber: extractedNic }));
          toast.success('NIC scanned and validated successfully!', { id: toastId });
        } else {
          toast.error('NIC detected but format is invalid.', { id: toastId });
        }
      } else {
        toast.error('Could not detect NIC number. Please try a clearer photo or enter manually.', { id: toastId });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Error scanning image. Please enter NIC manually.', { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
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
        if (!form.nicNumber) {
          setError('NIC is required');
          return;
        }
        const nicVal = validateNIC(form.nicNumber);
        if (!nicVal.isValid) {
          setError(nicVal.message || 'Invalid NIC format.');
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
        if (!form.nicNumber) {
          setError('NIC is required');
          return;
        }
        const nicVal = validateNIC(form.nicNumber);
        if (!nicVal.isValid) {
          setError(nicVal.message || 'Invalid NIC format.');
          return;
        }
      }
    }

    setLoading(true);
    try {
      const endpoint = isLogin
        ? 'http://localhost:8080/api/auth/login'
        : 'http://localhost:8080/api/auth/register';

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
          body.nicNumber = form.nicNumber;
        } else if (config.apiRole === 'HOTEL_OWNER') {
          body.hotelName = form.hotelName;
          body.businessRegistrationId = form.businessRegistrationId;
          body.businessAddress = form.businessAddress;
          body.district = form.district;
          body.nicNumber = form.nicNumber;
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
        // Map server messages → user-friendly text
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

      // data.token and data.user expected from backend
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to portal selection
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Top banner */}
          <div className={`bg-gradient-to-r ${config.color} p-6 flex items-center gap-3`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                {config.label} Portal
              </p>
              <h1 className="text-white text-xl font-bold">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h1>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {/* Tab toggle */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  isLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  !isLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection dropdown (Signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    User Type
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  >
                    <option value="tourist">Tourist</option>
                    <option value="agency">Agent</option>
                    <option value="hotelowner">Hotel Owner</option>
                  </select>
                </div>
              )}

              {/* Name field (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  {isLogin && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                    className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password (signup only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter password"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  />
                </div>
              )}

              {/* Additional Signup Fields */}
              {!isLogin && (
                <>
                  {/* Telephone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Telephone Number
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      required
                      placeholder="e.g. +94771234567"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    />
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      name="preferredLanguage"
                      value={form.preferredLanguage}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    >
                      <option value="en">English</option>
                      <option value="sin">Sinhala</option>
                      <option value="tam">Tamil</option>
                    </select>
                  </div>

                  {/* Tourist specific: Nationality */}
                  {config.apiRole === 'TOURIST' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nationality
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        placeholder="e.g. Sri Lankan"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                      />
                    </div>
                  )}

                  {/* Agent specific: Agency Name & NIC */}
                  {config.apiRole === 'AGENT' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Agency Name
                        </label>
                        <input
                          type="text"
                          name="agencyName"
                          value={form.agencyName}
                          onChange={handleChange}
                          required
                          placeholder="Your travel agency name"
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          NIC Number
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="nicNumber"
                            value={form.nicNumber}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 199912345678 or 991234567V"
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                          />
                          <button
                            type="button"
                            className="px-4 h-10 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium text-sm transition disabled:opacity-50"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                          >
                            {isScanning ? 'Scanning...' : 'Scan'}
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleScanNIC}
                        />
                        <span className="text-xs text-slate-500">Format: 9 digits + V/X or 12 digits</span>
                      </div>
                    </>
                  )}

                  {/* Hotel Owner specific: Hotel Name, Business Reg ID, Address, District, NIC */}
                  {config.apiRole === 'HOTEL_OWNER' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Hotel Name
                        </label>
                        <input
                          type="text"
                          name="hotelName"
                          value={form.hotelName}
                          onChange={handleChange}
                          required
                          placeholder="Name of your hotel property"
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Business Registration ID
                        </label>
                        <input
                          type="text"
                          name="businessRegistrationId"
                          value={form.businessRegistrationId}
                          onChange={handleChange}
                          required
                          placeholder="e.g. BR-12345"
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Business Address
                        </label>
                        <input
                          type="text"
                          name="businessAddress"
                          value={form.businessAddress}
                          onChange={handleChange}
                          required
                          placeholder="Hotel address"
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          District
                        </label>
                        <select
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                          required
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                        >
                          <option value="">Select District</option>
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          NIC Number
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="nicNumber"
                            value={form.nicNumber}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 199912345678 or 991234567V"
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                          />
                          <button
                            type="button"
                            className="px-4 h-10 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium text-sm transition disabled:opacity-50"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isScanning}
                          >
                            {isScanning ? 'Scanning...' : 'Scan'}
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleScanNIC}
                        />
                        <span className="text-xs text-slate-500">Format: 9 digits + V/X or 12 digits</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <span className="mt-0.5 shrink-0 text-red-500" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-11 rounded-xl bg-gradient-to-r ${config.color} text-white font-semibold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
              >
                {loading
                  ? (isLogin ? 'Signing in...' : 'Creating account...')
                  : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-5">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
