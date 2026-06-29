import { useNavigate } from 'react-router-dom';
import { Plane, ShieldCheck, Building2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const roles = [
  {
    id: 'tourist',
    label: 'Tourist',
    description: 'Explore packages, book hotels & manage your trips',
    icon: Plane,
    color: 'from-sky-500 to-cyan-400',
    border: 'border-sky-200 hover:border-sky-400',
    bg: 'hover:bg-sky-50',
    path: '/tourist',
  },
  {
    id: 'agency',
    label: 'Travel Agency',
    description: 'Manage packages, bookings, vehicles & analytics',
    icon: Users,
    color: 'from-violet-500 to-purple-400',
    border: 'border-violet-200 hover:border-violet-400',
    bg: 'hover:bg-violet-50',
    path: '/agency',
  },
  {
    id: 'hotelowner',
    label: 'Hotel Owner',
    description: 'List your hotel, manage rooms & view reviews',
    icon: Building2,
    color: 'from-emerald-500 to-teal-400',
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'hover:bg-emerald-50',
    path: '/hotelowner',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Approve listings, manage users & platform analytics',
    icon: ShieldCheck,
    color: 'from-rose-500 to-pink-400',
    border: 'border-rose-200 hover:border-rose-400',
    bg: 'hover:bg-rose-50',
    path: '/admin',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role: typeof roles[number]) => {
    const dummyUser = {
      id: `dummy-${role.id}`,
      name: `Guest ${role.label}`,
      email: `${role.id}@travelhub.com`,
      role: role.id === 'tourist' ? 'TOURIST' : role.id === 'agency' ? 'AGENT' : role.id === 'hotelowner' ? 'HOTEL_OWNER' : 'ADMIN',
    };
    login(dummyUser, 'dummy-token');
    navigate(role.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/60 bg-white/50 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">TravelHub</span>
        </div>
        <p className="text-sm text-slate-500 hidden sm:block">Sri Lanka Tourism Platform</p>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
              TravelHub
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Select your role to continue to your portal
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`group relative flex flex-col items-start gap-3 p-6 rounded-2xl bg-white border-2 ${role.border} ${role.bg} transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 text-left`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">{role.label}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{role.description}</p>
                </div>

                {/* Arrow */}
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-200 text-xl">
                  →
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © 2025 TravelHub · Sri Lanka Tourism
      </footer>
    </div>
  );
}
