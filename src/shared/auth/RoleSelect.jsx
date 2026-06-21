import { useNavigate } from "react-router-dom";
import "./auth.css";

const ROLES = [
    {
        key: "TOURIST",
        label: "Tourist",
        description: "Explore packages, hotels & manage your trips",
        path: "/tourist",
    },
    {
        key: "AGENT",
        label: "Agent",
        description: "Manage bookings, vehicles & packages",
        path: "/agent",
    },
    {
        key: "ADMIN",
        label: "Admin",
        description: "Approvals, payments & analytics",
        path: "/admin",
    },
];

export default function RoleSelect() {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <div className="auth-brand">
                    <img src="/TravelHUB.png" alt="TravelHub" className="auth-logo" />
                    <h1>TravelHub</h1>
                </div>

                <h2 className="auth-title">Continue as</h2>
                <p className="auth-subtitle">Pick a dashboard to open</p>

                <div className="role-select-grid">
                    {ROLES.map((role) => (
                        <button
                            key={role.key}
                            className="role-select-card"
                            onClick={() => navigate(role.path)}
                        >
                            <span className="role-select-label">{role.label}</span>
                            <span className="role-select-desc">{role.description}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
