import { useState } from 'react';
import {
  Bell,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  Save,
  ShieldCheck,
  BellRing,
  BellOff,
  CreditCard,
  Star,
  PackageCheck,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const notificationDefaults = [
  {
    id: 'new-booking',
    label: 'New Booking Requests',
    description: 'Get notified when a new booking request arrives',
    defaultOn: true,
    icon: BellRing,
  },
  {
    id: 'cancellation',
    label: 'Booking Cancellations',
    description: 'Get notified when a customer cancels a booking',
    defaultOn: true,
    icon: BellOff,
  },
  {
    id: 'trip-completed',
    label: 'Trip Completed',
    description: 'Get notified when a trip is marked as completed',
    defaultOn: true,
    icon: PackageCheck,
  },
  {
    id: 'new-review',
    label: 'New Customer Reviews',
    description: 'Get notified when a customer leaves a review',
    defaultOn: true,
    icon: MessageSquare,
  },
  {
    id: 'payment-received',
    label: 'Payment Received',
    description: 'Get notified when a payment is confirmed',
    defaultOn: true,
    icon: CreditCard,
  },
  {
    id: 'promo-updates',
    label: 'Promotional Updates',
    description: 'Receive updates about new features and offers',
    defaultOn: false,
    icon: Megaphone,
  },
];

const Settings = () => {
  // Notification Preferences State
  const [notifications, setNotifications] = useState(() => {
    const initial = {};
    notificationDefaults.forEach((n) => {
      initial[n.id] = n.defaultOn;
    });
    return initial;
  });

  // Password Change State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Currency Preference State
  const [currency, setCurrency] = useState('USD');

  const handleNotificationSave = () => {
    toast.success('Notification preferences saved successfully');
  };

  const handlePasswordSubmit = () => {
    const errors = {};

    if (!passwords.current) {
      errors.current = 'Current password is required';
    }
    if (!passwords.new) {
      errors.new = 'New password is required';
    } else if (passwords.new.length < 8) {
      errors.new = 'New password must be at least 8 characters';
    }
    if (!passwords.confirm) {
      errors.confirm = 'Please confirm your new password';
    } else if (passwords.new && passwords.new !== passwords.confirm) {
      errors.confirm = 'Passwords do not match';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before saving');
      return;
    }

    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
    setPasswordErrors({});
  };

  const handleCurrencySave = () => {
    toast.success('Currency preference saved successfully');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account preferences"
      showSearch={false}
    >
      <div className="max-w-3xl space-y-6">
        {/* Section 1: Notification Preferences */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Notification Preferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose which email alerts you want to receive
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {notificationDefaults.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <Label
                      htmlFor={item.id}
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {item.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={item.id}
                  checked={notifications[item.id]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [item.id]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleNotificationSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </div>

        {/* Section 2: Password Change */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Change Password
              </h3>
              <p className="text-sm text-muted-foreground">
                Update your account password
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-w-md">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => {
                    setPasswords((prev) => ({ ...prev, current: e.target.value }));
                    if (passwordErrors.current) {
                      setPasswordErrors((prev) => ({ ...prev, current: '' }));
                    }
                  }}
                  placeholder="Enter current password"
                  className={passwordErrors.current ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.current && (
                <p className="text-xs text-destructive">{passwordErrors.current}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => {
                    setPasswords((prev) => ({ ...prev, new: e.target.value }));
                    if (passwordErrors.new) {
                      setPasswordErrors((prev) => ({ ...prev, new: '' }));
                    }
                  }}
                  placeholder="Enter new password"
                  className={passwordErrors.new ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.new && (
                <p className="text-xs text-destructive">{passwordErrors.new}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => {
                    setPasswords((prev) => ({ ...prev, confirm: e.target.value }));
                    if (passwordErrors.confirm) {
                      setPasswordErrors((prev) => ({ ...prev, confirm: '' }));
                    }
                  }}
                  placeholder="Confirm new password"
                  className={passwordErrors.confirm ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirm && (
                <p className="text-xs text-destructive">{passwordErrors.confirm}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handlePasswordSubmit} className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Update Password
            </Button>
          </div>
        </div>

        {/* Section 3: Currency Preference */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Currency Preference
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose how prices are displayed across the platform
              </p>
            </div>
          </div>

          <div className="mt-6">
            <RadioGroup
              value={currency}
              onValueChange={setCurrency}
              className="space-y-3"
            >
              <label
                htmlFor="currency-lkr"
                className={`flex items-center gap-4 rounded-lg border px-4 py-4 cursor-pointer transition-all ${
                  currency === 'LKR'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value="LKR" id="currency-lkr" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      LKR
                    </span>
                    <span className="text-sm text-muted-foreground">—</span>
                    <span className="text-sm text-foreground">
                      Sri Lankan Rupee
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display all amounts in Sri Lankan Rupees (Rs.)
                  </p>
                </div>
              </label>

              <label
                htmlFor="currency-usd"
                className={`flex items-center gap-4 rounded-lg border px-4 py-4 cursor-pointer transition-all ${
                  currency === 'USD'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <RadioGroupItem value="USD" id="currency-usd" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      USD
                    </span>
                    <span className="text-sm text-muted-foreground">—</span>
                    <span className="text-sm text-foreground">US Dollar</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display all amounts in US Dollars ($)
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleCurrencySave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Preference
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
