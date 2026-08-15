import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Bell, Lock, Eye, EyeOff, DollarSign, Save,
  ShieldCheck, BellRing, BellOff, CreditCard,
  PackageCheck, MessageSquare, Megaphone,
  Camera, IdCard, Phone
} from 'lucide-react';
import { DashboardLayout } from '@/features/agency/components/dashboard/DashboardLayout';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Switch } from '@/components/common/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group';
import { toast } from 'sonner';
import { api } from '@/features/agency/services/api';
import { userApi } from '@/services/userApi';
import { useRef } from 'react';
import { Skeleton } from '@/components/common/ui/skeleton';
import { useCurrency } from '@/features/agency/hooks/CurrencyContext';
import Refunds from './Refunds';
import authApi from '@/services/authApi';

// ── Upload helper ──────────────────────────────────────────────
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const response = await fetch(`${apiBase}/api/upload/identity`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (result.success && result.data?.imageUrl) return result.data.imageUrl;
  throw new Error(result.message || 'Upload failed');
};

const notificationDefaults = [
  { id: 'new-booking', label: 'New Booking Requests', description: 'Get notified when a new booking request arrives', defaultOn: true, icon: BellRing },
  { id: 'cancellation', label: 'Booking Cancellations', description: 'Get notified when a customer cancels a booking', defaultOn: true, icon: BellOff },
  { id: 'trip-completed', label: 'Trip Completed', description: 'Get notified when a trip is marked as completed', defaultOn: true, icon: PackageCheck },
  { id: 'new-review', label: 'New Customer Reviews', description: 'Get notified when a customer leaves a review', defaultOn: true, icon: MessageSquare },
  { id: 'payment-received', label: 'Payment Received', description: 'Get notified when a payment is confirmed', defaultOn: true, icon: CreditCard },
  { id: 'promo-updates', label: 'Promotional Updates', description: 'Receive updates about new features and offers', defaultOn: false, icon: Megaphone },
];

const getPasswordStrength = (pwd: string) => {
  if (!pwd) return { score: 0, label: '', color: 'bg-muted-foreground/20' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  switch (score) {
    case 1:
      return { score: 25, label: 'Weak', color: 'bg-red-500' };
    case 2:
      return { score: 50, label: 'Fair', color: 'bg-orange-500' };
    case 3:
      return { score: 75, label: 'Good', color: 'bg-yellow-500' };
    case 4:
      return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
    default:
      return { score: 0, label: '', color: 'bg-muted-foreground/20' };
  }
};

const Settings = () => {
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') === 'refunds' ? 'refunds' : 'account';

  const handleTabChange = (tab: 'account' | 'refunds') => {
    setSearchParams({ tab });
  };

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

  /* --- CONTACT DETAILS STATE (personal agent info) --- */
  const [contactDetails, setContactDetails] = useState({ phone: '', secondaryPhone: '' });
  const [savingContact, setSavingContact] = useState(false);

  /* --- IDENTITY VERIFICATION STATE --- */
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [uploadingNic, setUploadingNic] = useState(false);
  const [tempNicImage, setTempNicImage] = useState<string | null>(null);
  const [savingNic, setSavingNic] = useState(false);
  const nicInputRef = useRef<HTMLInputElement>(null);

  /* DATA FETCHING: Load user preferences from server */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsData, profileData] = await Promise.all([
          api.getSettings(),
          api.getProfile()
        ]);
        
        if (settingsData?.notificationPreferences) {
          setNotifications(prev => ({ ...prev, ...settingsData.notificationPreferences }));
        }
        if (settingsData?.currency) {
          setCurrency(settingsData.currency);
        }
        if (profileData) {
          setFullProfile(profileData);
          setTempNicImage(profileData.nicImage || null);
          setContactDetails({
            phone: profileData.phone || '',
            secondaryPhone: profileData.secondaryPhone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load settings data:', error);
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
      setGlobalCurrency(currency);
      toast.success('Currency preference saved successfully');
    } catch (error) {
      toast.error('Failed to save currency preference');
    } finally {
      setSaving(false);
    }
  };

  // ── Password change connected to backend ─────
  const handlePasswordSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!passwords.current) errors.current = 'Current password is required';
    if (!passwords.new) errors.new = 'New password is required';
    else if (passwords.new.length < 6) errors.new = 'New password must be at least 6 characters';
    if (!passwords.confirm) errors.confirm = 'Please confirm your new password';
    else if (passwords.new && passwords.new !== passwords.confirm) errors.confirm = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      const res = await userApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast.success(res.message || 'Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({});
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password. Please check your current password.');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Save contact details ────────────────────────────────────────
  const handleContactSave = async () => {
    if (!fullProfile) return;
    setSavingContact(true);
    try {
      const updatedProfile = { ...fullProfile, ...contactDetails };
      await api.updateProfile(updatedProfile);
      setFullProfile(updatedProfile);
      toast.success('Contact details saved successfully');
    } catch (error) {
      toast.error('Failed to save contact details');
    } finally {
      setSavingContact(false);
    }
  };

  const handleNicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !fullProfile) return;

    // Validate file size limit (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 10MB limit. Please upload a smaller image.');
      if (nicInputRef.current) nicInputRef.current.value = '';
      return;
    }

    setUploadingNic(true);
    try {
      const url = await uploadImage(file);
      setTempNicImage(url);
      toast.info('NIC Image uploaded. Click "Submit Verification" below to save.');
    } catch (error: any) {
      console.error('Failed to upload NIC Image:', error);
      toast.error(`Failed to upload NIC Image: ${error.message || error}`);
    } finally {
      setUploadingNic(false);
      if (nicInputRef.current) nicInputRef.current.value = '';
    }
  };

  const handleNicSubmit = async () => {
    if (!fullProfile || !tempNicImage) return;
    setSavingNic(true);
    try {
      const updatedProfile = { ...fullProfile, nicImage: tempNicImage };
      await api.updateProfile(updatedProfile);
      setFullProfile(updatedProfile);
      toast.success('Identity verification submitted successfully!');
    } catch (error) {
      toast.error('Failed to save identity verification');
    } finally {
      setSavingNic(false);
    }
  };

  const removeNicImage = async () => {
    if (!fullProfile) return;
    
    if (fullProfile.nicImage) {
      setSavingNic(true);
      try {
        const updatedProfile = { ...fullProfile, nicImage: '' };
        await api.updateProfile(updatedProfile);
        setFullProfile(updatedProfile);
        setTempNicImage(null);
        toast.success('NIC Image removed successfully');
      } catch (error) {
        toast.error('Failed to remove NIC Image');
      } finally {
        setSavingNic(false);
      }
    } else {
      setTempNicImage(null);
      toast.success('Upload cancelled');
    }
    if (nicInputRef.current) nicInputRef.current.value = '';
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <DashboardLayout
      title={activeTabParam === 'refunds' ? 'Refund Requests' : 'Settings'}
      subtitle={activeTabParam === 'refunds' ? 'Manage and process manual bank deposit refunds requested by tourists.' : 'Manage your account preferences'}
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-border/40 gap-4 mb-6">
          <button
            onClick={() => handleTabChange('account')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTabParam === 'account'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Account Settings
          </button>
          <button
            onClick={() => handleTabChange('refunds')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTabParam === 'refunds'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Refund Requests
          </button>
        </div>

        {activeTabParam === 'account' ? (
          <div className="max-w-3xl space-y-6">

        {/* 1. CONTACT DETAILS SECTION */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Agent's Mobile Numbers</h3>
              <p className="text-sm text-muted-foreground">Your personal mobile numbers (not shown publicly)</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="primary-phone">Primary Mobile Number</Label>
              <Input
                id="primary-phone"
                value={contactDetails.phone}
                onChange={e => setContactDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +94771234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-phone">Secondary Mobile Number</Label>
              <Input
                id="secondary-phone"
                value={contactDetails.secondaryPhone}
                onChange={e => setContactDetails(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                placeholder="e.g. +94777654321"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleContactSave} className="gap-2" disabled={savingContact || loading}>
              <Save className="h-4 w-4" />
              {savingContact ? 'Saving...' : 'Save Mobile Numbers'}
            </Button>
          </div>
        </div>

        {/* 2. NOTIFICATIONS SECTION: Manage Email/Push Alerts */}
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
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-5 w-9 rounded-full" />
                </div>
              ))}
            </div>
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
            ].map(({ key, label, placeholder }) => {
              const strength = key === 'new' ? getPasswordStrength(passwords.new) : null;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${key}-password`}>{label}</Label>
                    {key === 'current' && (
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-primary hover:underline hover:text-primary/90"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
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
                  
                  {key === 'new' && passwords.new && (
                    <div className="mt-2 space-y-1.5 bg-sidebar-accent/15 p-3 rounded-lg border border-sidebar-border/30">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Password Strength:</span>
                        <span className={`font-semibold ${
                          strength.label === 'Weak' ? 'text-red-400' :
                          strength.label === 'Fair' ? 'text-orange-400' :
                          strength.label === 'Good' ? 'text-yellow-400' : 'text-emerald-400'
                        }`}>{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted-foreground/15 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 mt-1 list-none">
                        <li className="flex items-center gap-1.5">
                          <span className={passwords.new.length >= 8 ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}>
                            {passwords.new.length >= 8 ? '✓' : '•'}
                          </span>
                          <span className={passwords.new.length >= 8 ? 'text-emerald-400/90' : ''}>Minimum 8 characters</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className={/[0-9]/.test(passwords.new) ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}>
                            {/[0-9]/.test(passwords.new) ? '✓' : '•'}
                          </span>
                          <span className={/[0-9]/.test(passwords.new) ? 'text-emerald-400/90' : ''}>At least one number</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className={/[A-Z]/.test(passwords.new) ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}>
                            {/[A-Z]/.test(passwords.new) ? '✓' : '•'}
                          </span>
                          <span className={/[A-Z]/.test(passwords.new) ? 'text-emerald-400/90' : ''}>At least one uppercase letter</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {key === 'confirm' && passwords.confirm && (
                    <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                      passwords.new === passwords.confirm ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <span>{passwords.new === passwords.confirm ? '✓' : '✗'}</span>
                      <span>{passwords.new === passwords.confirm ? 'Passwords match' : 'Passwords do not match'}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              onClick={handlePasswordSubmit}
              className="gap-2 font-semibold"
              disabled={
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm ||
                passwords.new.length < 8 ||
                passwords.new !== passwords.confirm
              }
            >
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
            <div className="mt-6 space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-3 px-4 border border-border rounded-lg bg-card">
                  <Skeleton className="h-4 w-4 rounded-full mt-1 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
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

        {/* 4. IDENTITY VERIFICATION SECTION: Upload NIC */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IdCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">Upload your National Identity Card (NIC) for verification</p>
              </div>
            </div>
            {fullProfile?.nicImage && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                ✓ Submitted
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col items-start gap-4 max-w-md">
            <div
              className="relative h-32 w-full rounded-lg border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => !uploadingNic && nicInputRef.current?.click()}
            >
              {uploadingNic ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : tempNicImage ? (
                <>
                  <img src={tempNicImage} alt="NIC Preview" className="h-full w-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload NIC Document</span>
                </div>
              )}
              <input type="file" ref={nicInputRef} className="hidden" accept="image/*" onChange={handleNicUpload} />
            </div>
            {tempNicImage && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                {tempNicImage !== fullProfile?.nicImage && (
                  <Button
                    onClick={handleNicSubmit}
                    disabled={savingNic}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {savingNic ? 'Submitting...' : 'Submit Verification'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeNicImage}
                  disabled={savingNic}
                  className={`text-destructive hover:text-destructive shrink-0 ${tempNicImage === fullProfile?.nicImage ? 'w-full' : 'flex-1'}`}
                >
                  Remove NIC Document
                </Button>
              </div>
            )}
          </div>
        </div>
          </div>
        ) : (
          <Refunds embedded={true} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
