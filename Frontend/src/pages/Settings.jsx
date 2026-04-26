import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Mail, Lock, Loader2, ChevronRight } from "lucide-react";
import axios from "axios";

const SettingsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        profileImage: ""
    });

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
                        Manage your account security and authentication
                    </p>
                </div>

                <Card className="border-border shadow-soft overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-6 border-b">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-2 border-background shadow-elevated">
                                <AvatarImage src={profile.profileImage || "https://i.pravatar.cc/300"} alt={profile.name} />
                                <AvatarFallback className="text-xl gradient-ocean text-white">
                                    {profile.name ? profile.name.split(" ").map(n => n[0]).join("") : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">{profile.name}</h2>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-3 w-4" /> {profile.email}
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <section className="space-y-4 pt-6">
                    <h3 className="text-xl font-bold">Security & Authentication</h3>
                    <Card className="border-border hover:border-primary/20 transition-colors cursor-pointer group" onClick={() => setShowPasswordModal(true)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold group-hover:text-primary transition-colors">Change Password</p>
                                    <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                        </CardContent>
                    </Card>

                    <Card className="border-border opacity-60">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-muted text-muted-foreground">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">Two-Factor Authentication</p>
                                    <p className="text-sm text-muted-foreground">Feature managed by the platform security team</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
                            <CardHeader>
                                <h3 className="text-xl font-bold">Update Password</h3>
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
