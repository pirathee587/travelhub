import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, MapPin, Camera, Save, X, Edit2 } from "lucide-react";
import { userName as initialUserName } from "@/data/mockData";

// Simple Textarea component if not available, otherwise import it
import { Textarea as ShdnTextarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// If Textarea is not exported from @/components/ui/textarea, we use a fallback
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
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: initialUserName,
        email: "harith.keshan@example.com",
        address: "123 Adventure Lane, Colombo, Sri Lanka",
        // switched to a male avatar image
        profilePic: "https://i.pravatar.cc/",
    });

    const [editForm, setEditForm] = useState({ ...profile });

    const handleSave = () => {
        setProfile({ ...editForm });
        setIsEditing(false);
        toast({
            title: "Profile updated",
            description: "Your profile changes have been saved successfully.",
        });
    };

    const handleCancel = () => {
        setEditForm({ ...profile });
        setIsEditing(false);
    };

    const handleImageChange = () => {
        // Placeholder for image upload logic
        toast({
            title: "Image Upload",
            description: "Image upload functionality will be integrated with the backend.",
        });
    };

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
                                    <AvatarImage src={editForm.profilePic} alt={editForm.name} />
                                    <AvatarFallback className="text-3xl gradient-ocean text-white">
                                        {editForm.name.split(" ").map(n => n[0]).join("")}
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
                                <p className="text-xs text-muted-foreground italic">Email cannot be changed for security reasons.</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="text-sm font-semibold">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="address"
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        disabled={!isEditing}
                                        className={cn(
                                            "pl-10 min-h-[100px] bg-background transition-all resize-none",
                                            isEditing ? "border-primary focus-visible:ring-primary/20" : "border-transparent bg-muted/20"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="bg-muted/10 border-t p-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancel} className="h-11 px-6">
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} className="gradient-ocean h-11 px-8 shadow-glow">
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                        </CardFooter>
                    )}
                </Card>

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
                                    <p className="font-semibold group-hover:text-primary transition-colors">Password & Security</p>
                                    <p className="text-sm text-muted-foreground">Update your security credentials</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
