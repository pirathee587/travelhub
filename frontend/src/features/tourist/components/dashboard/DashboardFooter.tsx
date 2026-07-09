import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Github, Plane, GithubIcon, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                                <Plane className="h-5 w-5 text-white" />            {/*Plane Icon*/}
                            </div>
                            <span className="text-2xl font-bold tracking-tight">
                                TRAVEL<span className="text-primary italic">HUB</span>
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Your ultimate companion for discovering the hidden gems of Sri Lanka. 
                            Experience luxury, adventure, and comfort all in one place.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all duration-300">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all duration-300">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary hover:text-white transition-all duration-300">
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/tourist" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    Explore Destinations
                                </Link>
                            </li>
                            <li>
                                <Link to="/tourist/overview" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    Travel Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/tourist/trips" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    My Bookings
                                </Link>
                            </li>
                            <li>
                                <Link to="/tourist/documents" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    Documents
                                </Link>
                            </li>
                            <li>
                                <Link to="/tourist/hotels" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary" />
                                    Luxury Hotels
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-lg mb-6">Contact Us</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Sri Lanka Headquarters</p>
                                    <p className="text-muted-foreground">123 Travel Lane, Colombo 01</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">+94 11 234 5678</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <p className="text-sm text-muted-foreground">hello@travelhub.lk</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} TRAVEL<span className="italic font-bold">HUB</span> Srilanka. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">English (US)</a>
                        <a href="#" className="hover:text-primary transition-colors">$ USD</a>
                        <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                            <Github className="h-4 w-4" />
                            <span>v1.2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
