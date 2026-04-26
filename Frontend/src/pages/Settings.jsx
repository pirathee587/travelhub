import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, MapPin, Camera, Save, X, Edit2, Lock, Loader2 } from "lucide-react";
import axios from "axios";

// Simple Textarea component if not available, otherwise import it
import { Textarea as ShdnTextarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Textarea = (props) => {
    try {
        return <ShdnTextarea {...props} />;
    } catch {
        return <textarea
            {...props}
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                props.className
            )}
        />;
    }
};

const SettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        telephone: "",
        profileImage: "",
        nationality: "",
        preferredLanguage: ""
    });

    const [editForm, setEditForm] = useState({ ...profile });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setEditForm(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast({
                title: "Error",
                description: "Failed to load profile information.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            const response = await axios.put("http://localhost:8080/api/users/profile", editForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setIsEditing(false);
            toast({
                title: "Profile updated",
                description: "Your profile changes have been saved successfully.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update profile.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/api/users/change-password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast({
                title: "Password Changed",
                description: "Your password has been updated successfully.",
            });
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to change password.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-6 max-w-4xl mx-auto pb-10">
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
                                    <AvatarImage src={editForm.profileImage || "https://i.pravatar.cc/300"} alt={editForm.name} />
                                    <AvatarFallback className="text-3xl gradient-ocean text-white">
                                        {editForm.name ? editForm.name.split(" ").map(n => n[0]).join("") : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h2 className="text-2xl font-bold">{profile.name}</h2>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {profile.email}
                                </p>
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
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        disabled={!isEditing}
                                        className={cn(
                                            "pl-10 h-11 bg-background transition-all",
                                            isEditing ? "border-primary focus-visible:ring-primary/20" : "border-transparent bg-muted/20"
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={profile.email}
                                        disabled={true}
                                        className="pl-10 h-11 bg-muted/20 border-transparent cursor-not-allowed opacity-70"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telephone" className="text-sm font-semibold">Phone Number</Label>
                                <Input
                                    id="telephone"
                                    value={editForm.telephone || ""}
                                    onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })}
                                    disabled={!isEditing}
                                    className={cn(
                                        "h-11 bg-background transition-all",
                                        isEditing ? "border-primary focus-visible:ring-primary/20" : "border-transparent bg-muted/20"
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nationality" className="text-sm font-semibold">Nationality</Label>
                                <Input
                                    id="nationality"
                                    value={editForm.nationality || ""}
                                    onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                                    disabled={!isEditing}
                                    className={cn(
                                        "h-11 bg-background transition-all",
                                        isEditing ? "border-primary focus-visible:ring-primary/20" : "border-transparent bg-muted/20"
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancel} className="h-11 px-6">
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="gradient-ocean h-11 px-8 shadow-glow">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                <section className="space-y-4 pt-6">
                    <h3 className="text-xl font-bold">Security</h3>
                    <Card className="border-border hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => setShowPasswordModal(true)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold group-hover:text-primary transition-colors">Password & Security</p>
                                    <p className="text-sm text-muted-foreground">Update your password and secure your account</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                        </CardContent>
                    </Card>
                </section>

                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
                            <CardHeader>
                                <h3 className="text-xl font-bold">Change Password</h3>
                            </CardHeader>
                            <form onSubmit={handleChangePassword}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input 
                                            id="currentPassword" 
                                            type="password" 
                                            required 
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input 
                                            id="newPassword" 
                                            type="password" 
                                            required 
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input 
                                            id="confirmPassword" 
                                            type="password" 
                                            required 
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving} className="gradient-ocean">
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Update Password
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
