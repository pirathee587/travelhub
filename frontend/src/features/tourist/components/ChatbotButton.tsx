import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/common/ui/dialog";
import { cn } from "@/features/tourist/services/utils";

const CHATBOT_API_URL = "http://localhost:8001/chat";

const WELCOME_MESSAGE = {
    role: "bot",
    text: "Hello! I'm your TravelHUB AI assistant 👋\n\nI can help you with:\n• Finding travel packages\n• Recommending hotels\n• Sri Lanka destinations & tips\n• Booking information\n\nWhat would you like to know?",
};

export function ChatbotButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const sendMessage = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isLoading) return;

        const userMessage = { role: "user", text: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch(CHATBOT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: trimmed }),
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            const botReply = data.response || "Sorry, I couldn't get a response.";
            setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
        } catch (err) {
            console.error("[Chatbot] Error:", err);
            const errorMsg = "⚠️ Cannot connect to the server. Please make sure the backend is running.";
            setMessages((prev) => [...prev, { role: "bot", text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

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
                <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Tourist Assistant
                        </DialogTitle>
                        <DialogDescription>
                            How can I help you with your travel plans today?
                        </DialogDescription>
                    </DialogHeader>

                    {/* Chat Interface */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-muted/30">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    msg.role === "user" ? "bg-primary" : "gradient-ocean"
                                )}>
                                    {msg.role === "user" ? (
                                        <MessageCircle className="h-4 w-4 text-primary-foreground" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-primary-foreground" />
                                    )}
                                </div>
                                <div className={cn(
                                    "rounded-lg p-3 shadow-sm max-w-[80%] text-sm whitespace-pre-wrap",
                                    msg.role === "user" 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-card text-foreground"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full gradient-ocean flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Bot className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="bg-card rounded-lg p-3 shadow-sm flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-card flex gap-2 items-center">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            rows={1}
                            className={cn(
                                "flex-1 min-h-[40px] max-h-[120px] rounded-lg border border-border bg-background px-4 py-2 text-sm",
                                "resize-none focus:outline-none focus:ring-1 focus:ring-primary",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            disabled={isLoading}
                        />
                        <Button 
                            onClick={sendMessage} 
                            disabled={isLoading || !inputValue.trim()}
                            size="icon"
                            className="h-10 w-10 flex-shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
