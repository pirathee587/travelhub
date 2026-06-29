import { useState, useEffect } from "react";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/common/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/common/ui/avatar";
import { toast } from "@/components/common/ui/use-toast";
import { User, Mail, Camera, Save, X, Edit2, Phone, Globe } from "lucide-react";
import { MyReviewsSection } from "@/features/tourist/components/dashboard/MyReviewsSection";
import { ChevronRight } from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { api } from "@/features/tourist/services/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/common/ui/select";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];
import { defaultUserId } from "@/features/tourist/services/userHelpers";
import { mutate } from "swr";


const SettingsPage = () => {
    const userId = defaultUserId();

    const [isEditing, setIsEditing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile state populated from the backend
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        telephone: "",
        nationality: "",
        preferredLanguage: "",
        profileImage: "",
    });

    const [editForm, setEditForm] = useState({ ...profile });

    // ── Load the real user profile from the backend on mount ──────────────────
    useEffect(() => {
        setLoadingProfile(true);
        api.getUserProfile(userId)
            .then((data) => {
                if (data) {
                    const loaded = {
                        name: data.name || "",
                        email: data.email || "",
                        telephone: data.telephone || "",
                        nationality: data.nationality || "",
                        preferredLanguage: data.preferredLanguage || "",
                        profileImage: data.profileImage || "",
                    };
                    setProfile(loaded);
                    setEditForm(loaded);
                    // Update the cached display name
                    if (data.name) localStorage.setItem("userName", data.name);
                }
            })
            .catch((err) => {
                console.error("[Settings] Failed to load profile:", err);
                toast({
                    title: "Error",
                    description: "Could not load profile data. Please refresh the page.",
                    variant: "destructive",
                });
            })
            .finally(() => setLoadingProfile(false));
    }, [userId]);

    // ── Save changes to the backend ───────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await api.updateUserProfile(userId, {
                name: editForm.name,
                telephone: editForm.telephone,
                nationality: editForm.nationality,
                preferredLanguage: editForm.preferredLanguage,
                profileImage: editForm.profileImage,
            });

            if (updated) {
                const saved = {
                    name: updated.name || editForm.name,
                    email: updated.email || profile.email,
                    telephone: updated.telephone || "",
                    nationality: updated.nationality || "",
                    preferredLanguage: updated.preferredLanguage || "",
                    profileImage: updated.profileImage || "",
                };
                setProfile(saved);
                setEditForm(saved);

                // Update cached name so the header reflects the change immediately
                if (updated.name) localStorage.setItem("userName", updated.name);

                // Revalidate the SWR user-profile cache so DashboardHeader updates
                mutate(`user-profile-${userId}`);
            }

            setIsEditing(false);
            toast({
                title: "Profile updated",
                description: "Your profile changes have been saved successfully.",
            });
        } catch (err) {
            console.error("[Settings] Save failed:", err);
            const errorMsg = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
            toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };

    const handleImageChange = () => {
        // Placeholder — image upload will be integrated with backend image service
        toast({
            title: "Image Upload",
            description: "Image upload functionality will be integrated with the backend.",
        });
    };

    if (loadingProfile) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    if (!profile.email && !profile.name) {
        return (
            <DashboardLayout>
                <div className="max-w-[1600px] mx-auto pb-10 space-y-6 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and profile information
                        </p>
                    </div>
                    <Card className="border-border shadow-soft p-12 text-center">
                        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No user data found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            We couldn't retrieve your profile information. Please verify your connection or try again.
                        </p>
                        <Button onClick={() => window.location.reload()} className="gradient-ocean">
                            Retry
                        </Button>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-6 max-w-[1600px] mx-auto pb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and profile information
                    </p>
                </div>

                <Card className="border-border shadow-soft overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-10 border-b">
                        <div className="flex flex-col md:flex-row md:items-end gap-6 relative">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-elevated">
                                    <AvatarImage src={editForm.profileImage || undefined} alt={editForm.name} />
                                    <AvatarFallback className="text-3xl gradient-ocean text-white">
                                        {editForm.name
                                            ? editForm.name.split(" ").map((n) => n[0]).join("")
                                            : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <button
                                        onClick={handleImageChange}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera className="h-8 w-8 text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {profile.email}
                                </p>
                                {profile.telephone && (
                                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4" /> {profile.telephone}
                                    </p>
                                )}
                            </div>
                            {!isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    className="md:absolute md:right-0 md:top-0 gradient-ocean"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, name: e.target.value })}
                                        disabled={!isEditing}
                                        className={cn(
                                            "pl-10 h-11 bg-background transition-all",
                                            isEditing
                                                ? "border-primary focus-visible:ring-primary/20"
                                                : "border-transparent bg-muted/20"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Email — read-only */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled
                                        className="pl-10 h-11 bg-muted/20 border-transparent cursor-not-allowed opacity-70"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground italic">Email cannot be changed for security reasons.</p>
                            </div>

                            {/* Telephone */}
                            <div className="space-y-2">
                                <Label htmlFor="telephone" className="text-sm font-semibold">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="telephone"
                                        placeholder="e.g. +94 77 123 4567"
                                        value={editForm.telephone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, telephone: e.target.value })}
                                        disabled={!isEditing}
                                        className={cn(
                                            "pl-10 h-11 bg-background transition-all",
                                            isEditing
                                                ? "border-primary focus-visible:ring-primary/20"
                                                : "border-transparent bg-muted/20"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Nationality */}
                            <div className="space-y-2">
                                <Label htmlFor="nationality" className="text-sm font-semibold">Nationality</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                                    <Select
                                        disabled={!isEditing}
                                        value={editForm.nationality}
                                        onValueChange={(val) => setEditForm({ ...editForm, nationality: val })}
                                    >
                                        <SelectTrigger 
                                            className={cn(
                                                "pl-10 h-11 bg-background transition-all",
                                                isEditing
                                                    ? "border-primary focus-visible:ring-primary/20"
                                                    : "border-transparent bg-muted/20"
                                            )}
                                        >
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {COUNTRIES.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {isEditing && (
                        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancel} className="h-11 px-6" disabled={saving}>
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="gradient-ocean h-11 px-8 shadow-glow" disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Preferences */}
                <section className="space-y-4 pt-6">
                    <h3 className="text-xl font-bold">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-border hover:border-primary/20 transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-semibold group-hover:text-primary transition-colors">Notification Settings</p>
                                    <p className="text-sm text-muted-foreground">Manage how you receive alerts</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                            </CardContent>
                        </Card>
                        <Card className="border-border hover:border-primary/20 transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-semibold group-hover:text-primary transition-colors">Password &amp; Security</p>
                                    <p className="text-sm text-muted-foreground">Update your security credentials</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* My Reviews Section */}
                <section className="pt-8">
                    <MyReviewsSection />
                </section>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
