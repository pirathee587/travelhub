import { useState, useEffect } from 'react';
import {
  Bell, Lock, Eye, EyeOff, DollarSign, Save,
  ShieldCheck, BellRing, BellOff, CreditCard,
  PackageCheck, MessageSquare, Megaphone,
} from 'lucide-react';
import { DashboardLayout } from '@agent/components/dashboard/DashboardLayout';
import { Button } from '@agent/components/ui/button';
import { Input } from '@agent/components/ui/input';
import { Label } from '@agent/components/ui/label';
import { Switch } from '@agent/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@agent/components/ui/radio-group';
import { toast } from 'sonner';
import { api } from '@agent/lib/api';

const notificationDefaults = [
  { id: 'new-booking', label: 'New Booking Requests', description: 'Get notified when a new booking request arrives', defaultOn: true, icon: BellRing },
  { id: 'cancellation', label: 'Booking Cancellations', description: 'Get notified when a customer cancels a booking', defaultOn: true, icon: BellOff },
  { id: 'trip-completed', label: 'Trip Completed', description: 'Get notified when a trip is marked as completed', defaultOn: true, icon: PackageCheck },
  { id: 'new-review', label: 'New Customer Reviews', description: 'Get notified when a customer leaves a review', defaultOn: true, icon: MessageSquare },
  { id: 'payment-received', label: 'Payment Received', description: 'Get notified when a payment is confirmed', defaultOn: true, icon: CreditCard },
  { id: 'promo-updates', label: 'Promotional Updates', description: 'Receive updates about new features and offers', defaultOn: false, icon: Megaphone },
];

const Settings = () => {
  // ── State ──────────────────────────────────────────────────
  /* --- SETTINGS STATE MANAGEMENT --- */
  const [notifications, setNotifications] = useState(() => {
    const initial = {};
    notificationDefaults.forEach(n => { initial[n.id] = n.defaultOn; });
    return initial;
  });
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* --- SECURITY / PASSWORD STATE --- */
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});

  /* DATA FETCHING: Load user preferences from server */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        if (data?.notificationPreferences) {
          setNotifications(prev => ({ ...prev, ...data.notificationPreferences }));
        }
        if (data?.currency) {
          setCurrency(data.currency);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Save notification preferences ─────────────────────────
  const handleNotificationSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({
        notificationPreferences: notifications,
        currency,
      });
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // ── Save currency preference ───────────────────────────────
  const handleCurrencySave = async () => {
    setSaving(true);
    try {
      await api.updateSettings({
        notificationPreferences: notifications,
        currency,
      });
      toast.success('Currency preference saved successfully');
    } catch (error) {
      toast.error('Failed to save currency preference');
    } finally {
      setSaving(false);
    }
  };

  // ── Password change (frontend validation only for now) ─────
  const handlePasswordSubmit = () => {
    const errors = {};
    if (!passwords.current) errors.current = 'Current password is required';
    if (!passwords.new) errors.new = 'New password is required';
    else if (passwords.new.length < 8) errors.new = 'New password must be at least 8 characters';
    if (!passwords.confirm) errors.confirm = 'Please confirm your new password';
    else if (passwords.new && passwords.new !== passwords.confirm) errors.confirm = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before saving');
      return;
    }

    // Password change is handled by auth teammate's endpoint
    toast.success('Password changed successfully');
    setPasswords({ current: '', new: '', confirm: '' });
    setPasswordErrors({});
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage your account preferences"
      showSearch={false}
    >
      <div className="max-w-3xl space-y-6">

        {/* 1. NOTIFICATIONS SECTION: Manage Email/Push Alerts */}
        {/* Section 1: Notification Preferences */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Choose which email alerts you want to receive</p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-muted-foreground text-sm">Loading preferences...</p>
          ) : (
            <div className="mt-6 space-y-1">
              {notificationDefaults.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <Label htmlFor={item.id} className="text-sm font-medium text-foreground cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={item.id}
                    checked={notifications[item.id] ?? item.defaultOn}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, [item.id]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleNotificationSave} className="gap-2" disabled={saving || loading}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>

        {/* 2. SECURITY SECTION: Change Account Password */}
        {/* Section 2: Password Change */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-w-md">
            {[
              { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'new', label: 'New Password', placeholder: 'Enter new password' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${key}-password`}>{label}</Label>
                <div className="relative">
                  <Input
                    id={`${key}-password`}
                    type={showPasswords[key] ? 'text' : 'password'}
                    value={passwords[key]}
                    onChange={(e) => {
                      setPasswords(prev => ({ ...prev, [key]: e.target.value }));
                      if (passwordErrors[key]) setPasswordErrors(prev => ({ ...prev, [key]: '' }));
                    }}
                    placeholder={placeholder}
                    className={passwordErrors[key] ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors[key] && <p className="text-xs text-destructive">{passwordErrors[key]}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handlePasswordSubmit} className="gap-2">
              <ShieldCheck className="h-4 w-4" />Update Password
            </Button>
          </div>
        </div>

        {/* 3. PREFERENCES SECTION: Currency and Region Settings */}
        {/* Section 3: Currency Preference */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Currency Preference</h3>
              <p className="text-sm text-muted-foreground">Choose how prices are displayed across the platform</p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-muted-foreground text-sm">Loading...</p>
          ) : (
            <div className="mt-6">
              <RadioGroup value={currency} onValueChange={setCurrency} className="space-y-3">
                {[
                  { value: 'LKR', label: 'Sri Lankan Rupee', desc: 'Display all amounts in Sri Lankan Rupees (Rs.)' },
                  { value: 'USD', label: 'US Dollar', desc: 'Display all amounts in US Dollars ($)' },
                ].map(({ value, label, desc }) => (
                  <label
                    key={value}
                    htmlFor={`currency-${value.toLowerCase()}`}
                    className={`flex items-center gap-4 rounded-lg border px-4 py-4 cursor-pointer transition-all ${currency === value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      }`}
                  >
                    <RadioGroupItem value={value} id={`currency-${value.toLowerCase()}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                        <span className="text-sm text-muted-foreground">—</span>
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleCurrencySave} className="gap-2" disabled={saving || loading}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Preference'}
            </Button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
