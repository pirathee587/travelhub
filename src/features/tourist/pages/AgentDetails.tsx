import { memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Star,
    Briefcase,
    Globe,
    MessageSquare,
    Package,
    Users,
    CheckCircle2,
    Languages,
    Calendar,
} from "lucide-react";
import { useAgentById } from "@/features/tourist/hooks/useApi";
import { cn } from "@/features/tourist/services/utils";

// ── Colour palette (synced with Agents.jsx) ──────────
const CARD_GRADIENTS = [
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
    "from-amber-500 to-orange-500",
    "from-indigo-500 to-blue-700",
];

const getInitials = (name) => {
    if (!name) return "A";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

const MemoizedTravelCard = memo(TravelCard);

// ── Loading skeleton ──────────────────────────────────
const AgentDetailSkeleton = () => (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-8 bg-muted/60 rounded w-32" />
        <div className="h-52 bg-muted/60 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/60 rounded-xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-44 bg-muted/60 rounded-2xl" />
            ))}
        </div>
        <div className="h-6 bg-muted/60 rounded w-1/4 mt-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 bg-muted/60 rounded-2xl" />
            ))}
        </div>
    </div>
);

// ── Reusable info row ─────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-medium text-foreground break-words">{value}</p>
            </div>
        </div>
    );
};

// ── Stat card ─────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
        <div
            className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                colorClass
            )}
        >
            <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
            <p className="text-xl font-bold text-foreground">{value ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

// ── Page ──────────────────────────────────────────────
const AgentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: agent, isLoading } = useAgentById(id);

    // Pick gradient consistently by agent id
    const gradient = CARD_GRADIENTS[(parseInt(id) || 0) % CARD_GRADIENTS.length];

    // ── Loading state ──────────────────────────────────
    if (isLoading) {
        return (
            <DashboardLayout>
                <AgentDetailSkeleton />
            </DashboardLayout>
        );
    }

    // ── Not found ──────────────────────────────────────
    if (!agent) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
                    <p className="text-muted-foreground mb-5">
                        This agent does not exist or is no longer available.
                    </p>
                    <Button
                        id="agent-not-found-back"
                        onClick={() => navigate("/tourist/agents")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agents
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const initials = getInitials(agent.agencyName || agent.agentName);
    const packages = agent.packages || [];

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-6 animate-slide-up pb-10">

                {/* Back button */}
                <Button
                    id="agent-detail-back"
                    variant="ghost"
                    onClick={() => navigate("/tourist/agents")}
                    className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Agents
                </Button>

                {/* ── Hero ─────────────────────────────────────── */}
                <section
                    className={cn(
                        "relative rounded-3xl overflow-hidden bg-gradient-to-br",
                        gradient
                    )}
                >
                    {/* decorative shapes */}
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />

                    <div className="relative px-8 py-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        {/* Avatar */}
                        {agent.profileImage ? (
                            <img
                                src={agent.profileImage}
                                alt={agent.agencyName}
                                className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg flex-shrink-0"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30 shadow-lg flex-shrink-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">{initials}</span>
                            </div>
                        )}

                        {/* Identity */}
                        <div className="text-white flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified Agent
                                </Badge>
                                {agent.memberSince && (
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Since {agent.memberSince.split("-")[0]}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight truncate">
                                {agent.agencyName || agent.agentName || "Unknown Agency"}
                            </h1>
                            {agent.agencyName && agent.agentName && (
                                <p className="text-white/75 text-base mt-0.5">by {agent.agentName}</p>
                            )}
                            {agent.location && (
                                <div className="flex items-center gap-1.5 text-white/70 text-sm mt-2">
                                    <MapPin className="h-4 w-4" />
                                    {agent.location}
                                </div>
                            )}
                        </div>

                        {/* Rating bubble */}
                        {agent.rating != null && agent.rating > 0 ? (
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center flex-shrink-0">
                                <div className="flex items-center gap-1 justify-center mb-0.5">
                                    <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                                    <span className="text-2xl font-bold text-white">
                                        {agent.rating.toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-white/65 text-xs">Rating</p>
                            </div>
                        ) : (
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center flex-shrink-0">
                                <p className="text-white text-sm font-semibold">No Rating Yet</p>
                                <p className="text-white/65 text-xs">Rating</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Stats grid ─────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={Briefcase}
                        label="Total Trips"
                        value={agent.totalTrips ?? "—"}
                        colorClass="bg-primary"
                    />
                    <StatCard
                        icon={Star}
                        label="Agent Rating"
                        value={agent.rating != null && agent.rating > 0 ? agent.rating.toFixed(1) : "No Rating Available"}
                        colorClass="bg-yellow-500"
                    />
                    <StatCard
                        icon={Package}
                        label="Active Packages"
                        value={packages.length}
                        colorClass="bg-emerald-500"
                    />
                </div>

                {/* ── Agent details row ────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bio / About */}
                    <div className="bg-card rounded-2xl border border-border/50 p-5">
                        <h3 className="font-semibold text-base mb-3">About</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {agent.bio || "Leading travel agency."}
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="bg-card rounded-2xl border border-border/50 p-5">
                        <h3 className="font-semibold text-base mb-1">Contact</h3>
                        <InfoRow icon={Phone} label="Phone" value={agent.phone} />
                        <InfoRow icon={MessageSquare} label="WhatsApp" value={agent.whatsappNumber} />
                        <InfoRow icon={Mail} label="Email" value={agent.email} />
                        <InfoRow icon={Globe} label="Website" value={agent.websiteUrl} />
                    </div>

                    {/* Expertise */}
                    <div className="bg-card rounded-2xl border border-border/50 p-5">
                        <h3 className="font-semibold text-base mb-1">Expertise</h3>
                        <InfoRow icon={Languages} label="Languages" value={agent.languages || "English"} />
                        <InfoRow
                            icon={MapPin}
                            label="Operating Districts"
                            value={agent.operatingDistricts || "Western province"}
                        />
                    </div>
                </div>

                {/* ── Packages list ────────────────────────────── */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold">Packages by this Agent</h3>
                        <Badge variant="secondary">{packages.length}</Badge>
                    </div>

                    {packages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <MemoizedTravelCard
                                    key={pkg.id}
                                    recommendation={pkg}
                                    className="w-full"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-14 bg-muted/20 rounded-2xl border border-dashed border-border">
                            <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
                            <p className="font-medium text-muted-foreground">No packages available</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                This agent has no active packages yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AgentDetails;
