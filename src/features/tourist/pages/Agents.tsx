import { useState, useMemo, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { Input } from "@/components/common/ui/input";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
    Users,
    Search,
    Star,
    MapPin,
    Briefcase,
    ChevronRight,
    Calendar,
    Package,
} from "lucide-react";
import { useAllAgents } from "@/features/tourist/hooks/useApi";
import { cn } from "@/features/tourist/services/utils";

// ── Colour palette cycling for card headers ───────────
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

// ── Skeleton ───────────────────────────────────────────
const AgentCardSkeleton = () => (
    <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-soft animate-pulse flex flex-col h-full">
        <div className="flex gap-4 items-center mb-4">
            <div className="h-16 w-16 rounded-full bg-muted/80 flex-shrink-0" />
            <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted/80 rounded w-3/4" />
                <div className="h-3 bg-muted/60 rounded w-1/2" />
            </div>
        </div>
        <div className="h-3 bg-muted/60 rounded w-full mt-2" />
        <div className="h-3 bg-muted/60 rounded w-5/6 mt-2" />
        <div className="flex gap-3 mt-4">
            <div className="h-5 bg-muted/60 rounded w-16" />
            <div className="h-5 bg-muted/60 rounded w-20" />
        </div>
        <div className="h-9 bg-muted/60 rounded-xl w-full mt-auto pt-4" />
    </div>
);

// ── Single agent card ─────────────────────────────────
const AgentCard = memo(({ agent, index }) => {
    const navigate = useNavigate();
    const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
    const initials = getInitials(agent.agencyName || agent.agentName);

    const handleClick = useCallback(
        () => navigate(`/tourist/agents/${agent.id}`),
        [navigate, agent.id]
    );

    return (
        <div
            className="group flex flex-col bg-card p-5 rounded-2xl border-2 border-primary/20 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/60 transition-all duration-300 cursor-pointer h-full"
            onClick={handleClick}
        >
            {/* Header: Avatar + Info */}
            <div className="flex gap-4 items-start mb-4">
                <div className="relative">
                    {agent.profileImage ? (
                        <img
                            src={agent.profileImage}
                            alt={agent.agencyName}
                            className="h-16 w-16 rounded-full object-cover shadow-sm flex-shrink-0 border border-border/50"
                        />
                    ) : (
                        <div
                            className={cn(
                                "h-16 w-16 rounded-full shadow-sm flex-shrink-0 flex items-center justify-center font-bold text-xl text-white border border-border/50 bg-gradient-to-br",
                                gradient
                            )}
                        >
                            {initials}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                        {agent.agencyName || agent.agentName || "Unknown Agency"}
                    </h3>
                    {agent.agencyName && agent.agentName && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{agent.agentName}</p>
                    )}
                    {agent.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                            <MapPin className="h-3 w-3" />
                            {agent.location}
                        </div>
                    )}
                </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {agent.bio || "Experienced travel agent ready to plan your perfect trip."}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
                {agent.rating != null && agent.rating > 0 ? (
                    <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{agent.rating.toFixed(1)}</span>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">No Rating</span>
                )}
                {agent.totalTrips != null && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span className="text-sm">{agent.totalTrips} trips</span>
                    </div>
                )}
                {agent.totalPackages != null && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-md ml-1 border border-emerald-500/20">
                        <Package className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{agent.totalPackages} packages</span>
                    </div>
                )}
                {agent.memberSince && (
                    <Badge variant="secondary" className="text-xs ml-auto flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" />
                        {agent.memberSince.split("-")[0]}
                    </Badge>
                )}
            </div>

            {/* CTA button */}
            <Button
                size="sm"
                id={`agent-view-${agent.id}`}
                className="w-full mt-auto bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm border-none"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
            >
                View Profile
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    );
});

AgentCard.displayName = "AgentCard";

// ── Page ───────────────────────────────────────────────
const Agents = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: agents = [], isLoading } = useAllAgents();

    const filteredAgents = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return agents;
        return agents.filter(
            (a) =>
                a.agencyName?.toLowerCase().includes(q) ||
                a.agentName?.toLowerCase().includes(q) ||
                a.location?.toLowerCase().includes(q)
        );
    }, [agents, searchQuery]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-slide-up">

                {/* ── Hero banner ── */}
                <section className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-sky-600 to-blue-800" />
                    {/* decorative circles */}
                    <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

                    <div className="relative px-8 py-12 text-white">
                        <div className="flex items-center gap-4 mb-5">
                            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                                    Meet Our Agents
                                </h1>
                                <p className="text-white/75 text-sm mt-0.5">
                                    Verified travel experts ready to plan your perfect adventure
                                </p>
                            </div>
                        </div>

                        {/* Summary pills */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold">
                                <Users className="h-4 w-4 text-white/80" />
                                {agents.length} Verified Agents
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold">
                                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                                Top Rated Experts
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-semibold">
                                <MapPin className="h-4 w-4 text-white/80" />
                                Sri Lanka Wide
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Search ── */}
                <section>
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="agents-search"
                            placeholder="Search by agency name or location…"
                            className="pl-10 bg-card border-border/60 h-11 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </section>

                {/* ── Grid ── */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <Users className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">All Agents</h2>
                        <Badge variant="secondary">{filteredAgents.length} available</Badge>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <AgentCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredAgents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredAgents.map((agent, i) => (
                                <AgentCard key={agent.id} agent={agent} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border">
                            <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-lg font-semibold text-foreground mb-1">No agents found</p>
                            <p className="text-sm text-muted-foreground">
                                {searchQuery
                                    ? `No results for "${searchQuery}"`
                                    : "No approved agents are available yet."}
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    className="mt-4 text-primary"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
};

export default Agents;
