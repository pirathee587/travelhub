import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Lock, Eye, EyeOff, DollarSign, Save,
  ShieldCheck, CreditCard, PackageCheck,
  Phone, Users, Building2, ShieldAlert,
  User as UserIcon, Camera, Trash2, Loader2, ImagePlus, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { Input } from '@/components/common/ui/input';
import { Label } from '@/components/common/ui/label';
import { Switch } from '@/components/common/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio-group';
import { Skeleton } from '@/components/common/ui/skeleton';
import { toast } from 'sonner';
import adminProfileApi from '../services/adminProfileApi';
import adminNotificationApi from '../services/adminNotificationApi';
import { useAdminCurrency } from '../hooks/AdminCurrencyContext';

function getInitials(name?: string) {
  if (!name) return 'SA';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

// ── Notification Items for Admin ──────────────────────────────
const notificationDefaults = [
  {
    id: 'agent-registrations',
    label: 'New Agent Registrations',
    description: 'Get notified when a new agency registers or requests approval',
    defaultOn: true,
    icon: Users
  },
  {
    id: 'hotel-registrations',
    label: 'New Hotel Registrations',
    description: 'Get notified when a new hotel registers for approval',
    defaultOn: true,
    icon: Building2
  },
  {
    id: 'package-approvals',
    label: 'Package Approvals',
    description: 'Get notified when a new travel package is submitted for review',
    defaultOn: true,
    icon: PackageCheck
  },
  {
    id: 'payment-received',
    label: 'Payment Received',
    description: 'Get notified when customer transactions and payments are confirmed',
    defaultOn: true,
    icon: CreditCard
  },
  {
    id: 'tourist-reports',
    label: 'Tourist Report Notifications',
    description: 'Get notified when tourists submit new reports, complaints, or issues',
    defaultOn: true,
    icon: AlertTriangle
  },
  {
    id: 'system-alerts',
    label: 'System & Security Alerts',
    description: 'Receive important system status and security notifications',
    defaultOn: true,
    icon: ShieldAlert
  },
];

// ── Password Strength Calculator ──────────────────────────────
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

export default function AdminSettings() {
  const [activeTab] = useState<'account'>('account');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── States ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // 0. Profile details state (Name, Email, Avatar)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    profileImage: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // 1. Mobile numbers state
  const [contactDetails, setContactDetails] = useState({
    phone: '',
    secondaryPhone: '',
  });
  const [savingContact, setSavingContact] = useState(false);

  // 2. Notifications state
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    notificationDefaults.forEach(n => { initial[n.id] = n.defaultOn; });
    return initial;
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  // 3. Password state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  // 4. Currency state from Admin Currency Context
  const { currency: contextCurrency, setCurrency: setContextCurrency } = useAdminCurrency();
  const [currency, setCurrency] = useState(contextCurrency || 'USD');
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    if (contextCurrency) {
      setCurrency(contextCurrency);
    }
  }, [contextCurrency]);

  // ── Load Data ───────────────────────────────────────────────
  useEffect(() => {
    // 1. Instantly populate from localStorage if available
    try {
      const storedUser = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setProfile(parsed);
        setProfileForm({
          name: parsed.name || '',
          email: parsed.email || '',
          profileImage: parsed.profileImage || '',
        });
        setContactDetails({
          phone: parsed.telephone || parsed.phone || '',
          secondaryPhone: localStorage.getItem('travelhub_admin_secondary_phone') || '',
        });
        if (parsed.currencyPreference) {
          setCurrency(parsed.currencyPreference);
        }
      }
      const savedNotifs = localStorage.getItem('travelhub_admin_notifications');
      if (savedNotifs) {
        setNotifications(prev => ({ ...prev, ...JSON.parse(savedNotifs) }));
      }
    } catch (e) {
      console.warn('Error reading local user profile:', e);
    }

    // 2. Fetch fresh profile and preferences from API
    const fetchAdminSettings = async () => {
      try {
        setLoading(true);
        const [data, notifPrefs] = await Promise.allSettled([
          adminProfileApi.getProfile(),
          adminNotificationApi.getPreferences()
        ]);

        if (data.status === 'fulfilled' && data.value) {
          const profileData = data.value;
          setProfile(profileData);
          setProfileForm({
            name: profileData.name || '',
            email: profileData.email || '',
            profileImage: profileData.profileImage || '',
          });
          const savedSecondaryPhone = localStorage.getItem('travelhub_admin_secondary_phone') || '';
          setContactDetails({
            phone: profileData.telephone || '',
            secondaryPhone: savedSecondaryPhone,
          });
          if (profileData.currencyPreference) {
            setCurrency(profileData.currencyPreference);
          }
        }

        if (notifPrefs.status === 'fulfilled' && notifPrefs.value) {
          setNotifications(prev => ({ ...prev, ...notifPrefs.value }));
          localStorage.setItem('travelhub_admin_notifications', JSON.stringify(notifPrefs.value));
        }
      } catch (err) {
        console.warn('API getProfile/preferences failed, fallback to local data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminSettings();
  }, []);

  // ── 0. Handle Profile Photo Upload & Save ────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('File size must be less than 3MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhoto(true);
    try {
      const res = await adminProfileApi.uploadProfilePhoto(file);
      const imageUrl = res?.data?.imageUrl || res?.imageUrl;
      if (imageUrl) {
        setProfileForm(prev => ({ ...prev, profileImage: imageUrl }));
        
        // Auto-save the profile with new image
        await adminProfileApi.updateProfile({
          name: profileForm.name || profile?.name,
          email: profileForm.email || profile?.email,
          profileImage: imageUrl,
          telephone: contactDetails.phone,
          currencyPreference: currency,
        });

        // Update localStorage
        const stored = localStorage.getItem('travelhub_user');
        if (stored) {
          try {
            const user = JSON.parse(stored);
            user.profileImage = imageUrl;
            localStorage.setItem('travelhub_user', JSON.stringify(user));
          } catch (err) {}
        }

        window.dispatchEvent(new Event('user-profile-updated'));
        toast.success('Profile photo updated successfully');
      } else {
        toast.error('Failed to parse uploaded image URL');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setSavingProfile(true);
    try {
      setProfileForm(prev => ({ ...prev, profileImage: '' }));
      await adminProfileApi.updateProfile({
        name: profileForm.name || profile?.name,
        email: profileForm.email || profile?.email,
        profileImage: '',
        telephone: contactDetails.phone,
        currencyPreference: currency,
      });

      const stored = localStorage.getItem('travelhub_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          user.profileImage = '';
          localStorage.setItem('travelhub_user', JSON.stringify(user));
        } catch (err) {}
      }

      window.dispatchEvent(new Event('user-profile-updated'));
      toast.success('Profile photo removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove photo');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) {
      toast.error('User name is required');
      return;
    }
    if (!profileForm.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSavingProfile(true);
    try {
      await adminProfileApi.updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        profileImage: profileForm.profileImage,
        telephone: contactDetails.phone,
        currencyPreference: currency,
      });

      const stored = localStorage.getItem('travelhub_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          user.name = profileForm.name.trim();
          user.email = profileForm.email.trim();
          user.profileImage = profileForm.profileImage;
          localStorage.setItem('travelhub_user', JSON.stringify(user));
        } catch (err) {}
      }

      window.dispatchEvent(new Event('user-profile-updated'));
      toast.success('Profile details saved successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save profile details');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── 1. Save Mobile Numbers ──────────────────────────────────
  const handleContactSave = async () => {
    setSavingContact(true);
    try {
      await adminProfileApi.updateProfile({
        name: profileForm.name || profile?.name,
        email: profileForm.email || profile?.email,
        profileImage: profileForm.profileImage,
        telephone: contactDetails.phone,
        currencyPreference: currency,
      });

      // Save secondary phone to localStorage
      localStorage.setItem('travelhub_admin_secondary_phone', contactDetails.secondaryPhone);

      // Update user in localStorage
      const stored = localStorage.getItem('travelhub_user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          user.telephone = contactDetails.phone;
          localStorage.setItem('travelhub_user', JSON.stringify(user));
        } catch (e) {}
      }

      window.dispatchEvent(new Event('user-profile-updated'));
      toast.success('Mobile numbers saved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save mobile numbers');
    } finally {
      setSavingContact(false);
    }
  };

  // ── 2. Save Notification Preferences ────────────────────────
  const handleNotificationSave = async () => {
    setSavingNotifications(true);
    try {
      // 1. Persist to backend database
      const savedData = await adminNotificationApi.savePreferences(notifications);
      if (savedData) {
        setNotifications(prev => ({ ...prev, ...savedData }));
      }
      // 2. Persist to browser storage as cache
      localStorage.setItem('travelhub_admin_notifications', JSON.stringify(notifications));
      // 3. Notify header bell listener to refetch live feed
      window.dispatchEvent(new Event('admin-notifications-updated'));
      toast.success('Notification preferences saved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  // ── 3. Save Password Change ─────────────────────────────────
  const handlePasswordSubmit = async () => {
    const errors: Record<string, string> = {};
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

    setSavingPassword(true);
    try {
      await adminProfileApi.changePassword(passwords.current, passwords.new);
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({});
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ── 4. Save Currency Preference ─────────────────────────────
  const handleCurrencySave = async () => {
    setSavingCurrency(true);
    try {
      await setContextCurrency(currency as 'USD' | 'LKR');
      await adminProfileApi.updateProfile({
        name: profileForm.name || profile?.name,
        email: profileForm.email || profile?.email,
        profileImage: profileForm.profileImage,
        telephone: contactDetails.phone,
        currencyPreference: currency,
      });

      toast.success('Currency preference saved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save currency preference');
    } finally {
      setSavingCurrency(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Tab Headers (Account Settings only) ── */}
      <div className="flex border-b border-border/40 gap-4 mb-6">
        <button
          className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
            activeTab === 'account'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Account Settings
        </button>
      </div>

      <div className="max-w-3xl space-y-6">

        {/* ── 0. ADMIN PROFILE DETAILS (Photo, User Name, Email) ── */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your photo, display name, and login email address</p>
            </div>
          </div>

          {/* Photo upload block */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="relative shrink-0">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center border-2 border-dashed border-primary/40 shadow-inner">
                {profileForm.profileImage ? (
                  <img src={profileForm.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{getInitials(profileForm.name || 'Admin')}</span>
                )}
              </div>
              <button
                type="button"
                disabled={uploadingPhoto || loading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card hover:scale-110 transition-transform shadow-sm disabled:opacity-50"
                title="Change Photo"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto || loading}
              />
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground">Profile Photo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 3MB</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingPhoto || loading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploadingPhoto ? 'Uploading...' : profileForm.profileImage ? 'Change Photo' : 'Upload Photo'}
                </Button>
                {profileForm.profileImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingPhoto || savingProfile || loading}
                    onClick={handleRemovePhoto}
                    className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* User Name and Email inputs */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="admin-name">User Name / Full Name</Label>
              <Input
                id="admin-name"
                value={profileForm.name}
                onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Super Admin"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. admin@travelhub.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              onClick={handleProfileSave}
              className="gap-2 font-medium"
              disabled={savingProfile || loading || !profileForm.name.trim() || !profileForm.email.trim()}
            >
              <Save className="h-4 w-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Information'}
            </Button>
          </div>
        </div>

        {/* ── 1. ADMIN'S MOBILE NUMBERS SECTION ── */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Admin's Mobile Numbers</h3>
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
                placeholder="e.g. +94761698966"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-phone">Secondary Mobile Number</Label>
              <Input
                id="secondary-phone"
                value={contactDetails.secondaryPhone}
                onChange={e => setContactDetails(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                placeholder="e.g. +94777361693"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button onClick={handleContactSave} className="gap-2 font-medium" disabled={savingContact || loading}>
              <Save className="h-4 w-4" />
              {savingContact ? 'Saving...' : 'Save Mobile Numbers'}
            </Button>
          </div>
        </div>

        {/* ── 2. NOTIFICATION PREFERENCES SECTION ── */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3.5 transition-colors hover:bg-muted/50"
                >
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
            <Button onClick={handleNotificationSave} className="gap-2 font-medium" disabled={savingNotifications || loading}>
              <Save className="h-4 w-4" />
              {savingNotifications ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>

        {/* ── 3. CHANGE PASSWORD SECTION ── */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
              { key: 'current' as const, label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'new' as const, label: 'New Password', placeholder: 'Enter new password' },
              { key: 'confirm' as const, label: 'Confirm New Password', placeholder: 'Confirm new password' },
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

                  {key === 'new' && passwords.new && strength && (
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
                savingPassword ||
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm ||
                passwords.new.length < 8 ||
                passwords.new !== passwords.confirm
              }
            >
              <ShieldCheck className="h-4 w-4" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>

        {/* ── 4. CURRENCY PREFERENCE SECTION ── */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
            <Button onClick={handleCurrencySave} className="gap-2 font-medium" disabled={savingCurrency || loading}>
              <Save className="h-4 w-4" />
              {savingCurrency ? 'Saving...' : 'Save Preference'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
