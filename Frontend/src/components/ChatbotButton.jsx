import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ChatbotButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Chatbot Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-glow",
                    "gradient-ocean hover:scale-110 transition-transform duration-300",
                    "flex items-center justify-center"
                )}
                aria-label="Open chatbot assistant"
            >
                <MessageCircle className="h-6 w-6 text-primary-foreground" />
            </Button>

            {/* Chatbot Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-primary" />
                            Tourist Assistant
                        </DialogTitle>
                        <DialogDescription>
                            How can I help you with your travel plans today?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Placeholder Chat Interface */}
                        <div className="min-h-[300px] max-h-[400px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
                            <div className="space-y-3">
                                {/* Bot Message */}
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full gradient-ocean flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                    <div className="bg-card rounded-lg p-3 shadow-sm max-w-[80%]">
                                        <p className="text-sm">
                                            Hello! I'm your tourist assistant. I can help you with:
                                        </p>
                                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                                            <li>Finding hotels and accommodations</li>
                                            <li>Exploring travel packages</li>
                                            <li>Booking information</li>
                                            <li>Travel tips and recommendations</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Placeholder for future messages */}
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    <p>Chat functionality coming soon!</p>
                                </div>
                            </div>
                        </div>

                        {/* Input Area (Disabled for now) */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your message... (coming soon)"
                                disabled
                                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm opacity-50 cursor-not-allowed"
                            />
                            <Button disabled className="opacity-50">
                                Send
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
