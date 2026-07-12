// removed unused useState
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Package,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  Plane,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/utils/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/common/ui/alert-dialog';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/agency' },
  { icon: Car, label: 'Vehicles & Drivers', path: '/agency/vehicles' },
  { icon: CalendarCheck, label: 'Bookings', path: '/agency/bookings' },
  { icon: Package, label: 'Packages', path: '/agency/packages' },
  { icon: BarChart3, label: 'Analytics', path: '/agency/analytics' },
  { icon: User, label: 'Profile', path: '/agency/profile' },
  { icon: Settings, label: 'Settings', path: '/agency/settings' },
];

export function Sidebar({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary">
          <Plane className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground animate-fade-in">
            TravelAgent
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('sidebar-link', isActive && 'active')}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="border-t border-sidebar-border p-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'text-red-400 hover:bg-red-500/10 hover:text-red-300',
                collapsed && 'justify-center px-0'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="animate-fade-in">Sign Out</span>
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of your account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleLogout}
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
