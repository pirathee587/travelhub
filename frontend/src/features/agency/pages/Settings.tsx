import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Bell, Lock, Eye, EyeOff, DollarSign, Save,
  ShieldCheck, BellRing, BellOff, CreditCard,
  PackageCheck, MessageSquare, Megaphone,
  Camera, IdCard, Phone, Trash2, Wallet,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common/ui/dialog';
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
  const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const response = await fetch(`${apiBase}/upload/identity`, {
    method: 'POST',
    headers,
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
  { id: 'payout-updates', label: 'Payout & Wallet Alerts', description: 'Get notified when a payout is requested, approved, or credited to your wallet', defaultOn: true, icon: Wallet },
  { id: 'verification-updates', label: 'Verification & Audit Alerts', description: 'Get notified when admin verifies or requests updates on your agency, driver, or vehicle documents', defaultOn: true, icon: ShieldCheck },
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
  const [freeCancellationDays, setFreeCancellationDays] = useState(2);
  const [cancellationFeePercent, setCancellationFeePercent] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);

  /* --- SECURITY / PASSWORD STATE --- */
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* --- CONTACT DETAILS STATE (personal agent info) --- */
  const [contactDetails, setContactDetails] = useState({ phone: '', secondaryPhone: '' });
  const [savingContact, setSavingContact] = useState(false);

  /* --- IDENTITY VERIFICATION STATE --- */
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [uploadingNicFront, setUploadingNicFront] = useState(false);
  const [uploadingNicRear, setUploadingNicRear] = useState(false);
  const [tempNicFront, setTempNicFront] = useState<string | null>(null);
  const [tempNicRear, setTempNicRear] = useState<string | null>(null);
  const [savingNic, setSavingNic] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const nicInputFrontRef = useRef<HTMLInputElement>(null);
  const nicInputRearRef = useRef<HTMLInputElement>(null);

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
        if (settingsData?.freeCancellationDays !== undefined) {
          setFreeCancellationDays(settingsData.freeCancellationDays);
        }
        if (settingsData?.cancellationFeePercent !== undefined) {
          setCancellationFeePercent(settingsData.cancellationFeePercent);
        }
        if (profileData) {
          setFullProfile(profileData);
          setTempNicFront(profileData.nicFrontImage || profileData.nicImage || null);
          setTempNicRear(profileData.nicRearImage || null);
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

  const handlePolicySave = async () => {
    setSavingPolicy(true);
    try {
      await api.updateSettings({
        freeCancellationDays: Number(freeCancellationDays),
        cancellationFeePercent: Number(cancellationFeePercent),
      });
      toast.success('Cancellation policy saved successfully');
    } catch (error) {
      toast.error('Failed to save cancellation policy');
    } finally {
      setSavingPolicy(false);
    }
  };

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
    setPasswordStatusMsg(null);
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

    setSubmittingPassword(true);
    try {
      const res = await userApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      const msg = res?.message || 'Password changed successfully!';
      toast.success(msg);
      setPasswordStatusMsg({ type: 'success', text: msg });
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({});
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to change password. Please check your current password.';
      toast.error(errMsg);
      setPasswordStatusMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmittingPassword(false);
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

  const handleNicUploadFront = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !fullProfile) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 10MB limit. Please upload a smaller image.');
      if (nicInputFrontRef.current) nicInputFrontRef.current.value = '';
      return;
    }

    setUploadingNicFront(true);
    try {
      const url = await uploadImage(file);
      setTempNicFront(url);
      toast.info('NIC Front image uploaded. Click "Submit Verification" below to save.');
    } catch (error: any) {
      console.error('Failed to upload NIC Front Image:', error);
      toast.error(`Failed to upload NIC Front Image: ${error.message || error}`);
    } finally {
      setUploadingNicFront(false);
      if (nicInputFrontRef.current) nicInputFrontRef.current.value = '';
    }
  };

  const handleNicUploadRear = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !fullProfile) return;

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the 10MB limit. Please upload a smaller image.');
      if (nicInputRearRef.current) nicInputRearRef.current.value = '';
      return;
    }

    setUploadingNicRear(true);
    try {
      const url = await uploadImage(file);
      setTempNicRear(url);
      toast.info('NIC Rear image uploaded. Click "Submit Verification" below to save.');
    } catch (error: any) {
      console.error('Failed to upload NIC Rear Image:', error);
      toast.error(`Failed to upload NIC Rear Image: ${error.message || error}`);
    } finally {
      setUploadingNicRear(false);
      if (nicInputRearRef.current) nicInputRearRef.current.value = '';
    }
  };

  const handleNicSubmit = async () => {
    if (!fullProfile) return;
    setSavingNic(true);
    try {
      const payload = {
        ...fullProfile,
        nicImage: tempNicFront || tempNicRear || '',
        nicFrontImage: tempNicFront,
        nicRearImage: tempNicRear,
        nicStatus: 'PENDING',
        nicVerificationStatus: 'PENDING',
      };
      const res = await api.updateProfile(payload);
      const merged = { ...payload, ...res };
      setFullProfile(merged);
      setTempNicFront(merged.nicFrontImage || merged.nicImage || tempNicFront);
      setTempNicRear(merged.nicRearImage || tempNicRear);
      toast.success('Identity verification submitted successfully! Awaiting admin review.');
    } catch (error) {
      toast.error('Failed to save identity verification');
    } finally {
      setSavingNic(false);
    }
  };

  const removeNicImage = async () => {
    if (!fullProfile) return;
    setSavingNic(true);
    try {
      const updatedProfile = {
        ...fullProfile,
        nicImage: '',
        nicFrontImage: null,
        nicRearImage: null,
        nicStatus: 'NOT_SUBMITTED',
      };
      await api.updateProfile(updatedProfile);
      setFullProfile(updatedProfile);
      setTempNicFront(null);
      setTempNicRear(null);
      toast.success('NIC Documents removed successfully');
    } catch (error) {
      toast.error('Failed to remove NIC Documents');
    } finally {
      setSavingNic(false);
    }
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

        {/* 1.5. CANCELLATION & REFUND POLICY SECTION */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Cancellation & Refund Policy</h3>
              <p className="text-sm text-muted-foreground">Configure agency default cancellation deadline and fee percentage</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="free-cancellation-days">Free Cancellation Window (Days)</Label>
              <Input
                id="free-cancellation-days"
                type="number"
                min="0"
                max="30"
                value={freeCancellationDays}
                onChange={e => setFreeCancellationDays(Number(e.target.value))}
                placeholder="e.g. 2"
              />
              <p className="text-xs text-muted-foreground">Number of days before trip start date that cancellations are free</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation-fee-percent">Late Cancellation Fee (%)</Label>
              <Input
                id="cancellation-fee-percent"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={cancellationFeePercent}
                onChange={e => setCancellationFeePercent(Number(e.target.value))}
                placeholder="e.g. 10"
              />
              <p className="text-xs text-muted-foreground">Percentage deducted from refund if cancelled after the free window</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handlePolicySave} className="gap-2" disabled={savingPolicy || loading}>
              <Save className="h-4 w-4" />
              {savingPolicy ? 'Saving...' : 'Save Policy Settings'}
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
                        if (passwordStatusMsg) setPasswordStatusMsg(null);
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

          {passwordStatusMsg && (
            <div className={`mt-4 max-w-md p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2 animate-scale-in ${
              passwordStatusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
            }`}>
              <span>{passwordStatusMsg.type === 'success' ? '✅' : '❌'}</span>
              <span>{passwordStatusMsg.text}</span>
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              onClick={handlePasswordSubmit}
              className="gap-2 font-semibold"
              disabled={
                submittingPassword ||
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm ||
                passwords.new.length < 8 ||
                passwords.new !== passwords.confirm
              }
            >
              {submittingPassword ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating Password...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Update Password
                </>
              )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IdCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Identity Verification</h3>
                <p className="text-sm text-muted-foreground">Upload National Identity Card (NIC Front & Rear) for admin verification</p>
              </div>
            </div>

            {/* 4-State Verification Badge */}
            <div>
              {fullProfile?.nicVerificationStatus === 'APPROVED' || fullProfile?.nicStatus === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/95 text-emerald-700 border border-emerald-300/90 backdrop-blur-md shadow-sm">
                  Verified & Approved
                </span>
              ) : fullProfile?.nicVerificationStatus === 'REJECTED' || fullProfile?.nicStatus === 'REJECTED' || fullProfile?.nicVerificationStatus === 'rejected' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50/95 text-rose-700 border border-rose-300/90 backdrop-blur-md shadow-sm">
                  Action Required
                </span>
              ) : (fullProfile?.nicVerificationStatus === 'PENDING' || fullProfile?.nicStatus === 'PENDING' || tempNicFront || tempNicRear || fullProfile?.nicImage) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/95 text-amber-800 border border-amber-300/90 backdrop-blur-md shadow-sm">
                  Pending Verification
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                  Not Submitted
                </span>
              )}
            </div>
          </div>

          {/* Inline Rejection Reason Notice Box */}
          {(fullProfile?.nicStatus === 'REJECTED' || fullProfile?.nicVerificationStatus === 'rejected') && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-destructive space-y-1">
              <div className="font-semibold flex items-center gap-2">
                ⚠️ Verification Rejected
              </div>
              <p className="text-xs text-red-700 dark:text-red-300">
                {fullProfile?.nicRejectionReason || fullProfile?.rejectionReason || 'Your submitted NIC document was rejected. Please re-upload clear photos of both sides.'}
              </p>
            </div>
          )}

          {/* Dual-Side Upload Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot 1: NIC Front Side */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>1. NIC Front Side <span className="text-destructive">*</span></span>
                {tempNicFront && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(tempNicFront)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-normal"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Full
                  </button>
                )}
              </div>
              <div
                className="relative h-36 w-full rounded-xl border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group bg-muted/20"
                onClick={() => !uploadingNicFront && nicInputFrontRef.current?.click()}
              >
                {uploadingNicFront ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground">Uploading Front...</span>
                  </div>
                ) : tempNicFront ? (
                  <>
                    <img src={tempNicFront} alt="NIC Front" className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <Camera className="h-6 w-6 text-white" />
                      <span className="text-xs text-white font-medium">Replace Front</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-7 w-7 mx-auto text-muted-foreground mb-1.5" />
                    <span className="text-xs font-medium text-foreground block">Upload NIC Front</span>
                    <span className="text-[11px] text-muted-foreground">PNG, JPG up to 10MB</span>
                  </div>
                )}
                <input type="file" ref={nicInputFrontRef} className="hidden" accept="image/*" onChange={handleNicUploadFront} />
              </div>
            </div>

            {/* Slot 2: NIC Rear Side */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>2. NIC Rear Side (Optional)</span>
                {tempNicRear && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(tempNicRear)}
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-normal"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Full
                  </button>
                )}
              </div>
              <div
                className="relative h-36 w-full rounded-xl border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group bg-muted/20"
                onClick={() => !uploadingNicRear && nicInputRearRef.current?.click()}
              >
                {uploadingNicRear ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground">Uploading Rear...</span>
                  </div>
                ) : tempNicRear ? (
                  <>
                    <img src={tempNicRear} alt="NIC Rear" className="h-full w-full object-cover group-hover:opacity-75 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <Camera className="h-6 w-6 text-white" />
                      <span className="text-xs text-white font-medium">Replace Rear</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-7 w-7 mx-auto text-muted-foreground mb-1.5" />
                    <span className="text-xs font-medium text-foreground block">Upload NIC Rear</span>
                    <span className="text-[11px] text-muted-foreground">PNG, JPG up to 10MB</span>
                  </div>
                )}
                <input type="file" ref={nicInputRearRef} className="hidden" accept="image/*" onChange={handleNicUploadRear} />
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            {(tempNicFront !== (fullProfile?.nicFrontImage || fullProfile?.nicImage) || tempNicRear !== fullProfile?.nicRearImage) && (tempNicFront || tempNicRear) && (
              <Button onClick={handleNicSubmit} disabled={savingNic} className="gap-2">
                <Save className="h-4 w-4" />
                {savingNic ? 'Submitting...' : 'Submit Verification'}
              </Button>
            )}
            {(tempNicFront || tempNicRear) && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeNicImage}
                disabled={savingNic}
                className="text-destructive hover:text-destructive gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                Remove Document
              </Button>
            )}
          </div>
        </div>

        {/* Full Image Preview Lightbox Modal */}
        {previewImage && (
          <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
            <DialogContent className="sm:max-w-[700px] p-2 bg-black/90 border-none overflow-hidden">
              <DialogHeader className="p-2 flex flex-row items-center justify-between text-white border-b border-white/10">
                <DialogTitle className="text-sm font-medium text-white">NIC Document Lightbox Preview</DialogTitle>
              </DialogHeader>
              <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-auto p-2">
                <img src={previewImage} alt="Full NIC Document" className="max-h-[70vh] w-auto object-contain rounded" />
              </div>
            </DialogContent>
          </Dialog>
        )}
          </div>
        ) : (
          <Refunds embedded={true} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
