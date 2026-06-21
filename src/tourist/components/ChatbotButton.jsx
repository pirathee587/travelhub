import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@tourist/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@tourist/components/ui/dialog";
import { cn } from "@tourist/lib/utils";

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
            console.warn("[Chatbot] Backend unreachable, falling back to local simulation:", err);
            
            // Simulate a brief thinking delay for realism
            await new Promise((resolve) => setTimeout(resolve, 600));

            const query = trimmed.toLowerCase();
            let reply = "";

            if (query.includes("package") || query.includes("tour") || query.includes("trip")) {
                reply = "Here are some of our popular Sri Lanka packages:\n\n" +
                        "1. **Cultural Triangle Tour (5 Days)**: Explore Sigiriya, Anuradhapura, and Polonnaruwa. Includes guided tours and hotel stays.\n" +
                        "2. **Hill Country Scenic Escape (4 Days)**: Visit Kandy, Ella, and Nuwara Eliya. Famous scenic train ride included!\n" +
                        "3. **Golden Beaches & Wildlife (6 Days)**: Relax in Mirissa, enjoy a safari in Yala National Park, and explore Galle Fort.\n\n" +
                        "You can book these under the 'Explore' tab in your dashboard!";
            } else if (query.includes("hotel") || query.includes("stay") || query.includes("room") || query.includes("accommodation")) {
                reply = "We recommend these highly-rated hotels in Sri Lanka:\n\n" +
                        "• **Amaya Lake (Dambulla)**: Beautiful lakeside setting, perfect for cultural site visits.\n" +
                        "• **Cinnamon Grand (Colombo)**: Modern luxury in the heart of the city.\n" +
                        "• **Heritance Kandalama (Dambulla)**: An eco-friendly architectural marvel built into the cliffs.\n" +
                        "• **98 Acres Resort & Spa (Ella)**: Stunning tea-estate views.\n\n" +
                        "Check out the 'Hotels' tab to see available rooms and prices!";
            } else if (query.includes("agent") || query.includes("guide") || query.includes("driver")) {
                reply = "Our registered agents are verified and highly experienced:\n\n" +
                        "• **Lanka Safe Tours**: Specialists in family trips and airport transfers.\n" +
                        "• **Ceylon Tour Guide**: Expert historical and adventure tour guides.\n" +
                        "• **Travel Lanka Agents**: Affordable customized transport & logistics.\n\n" +
                        "You can contact them directly or request bookings from the 'Overview' tab.";
            } else if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("greetings")) {
                reply = "Hello there! 😊 How is your visit to Sri Lanka going? Let me know if you need any recommendations for hotels, tour packages, or transport!";
            } else if (query.includes("help") || query.includes("support") || query.includes("contact")) {
                reply = "I'm here to help! You can ask me about:\n" +
                        "• Tour packages available in Sri Lanka\n" +
                        "• Hotel recommendations & pricing\n" +
                        "• Verifying your travel documents\n\n" +
                        "For urgent support, please contact our support hotline at support@travelhub.com.";
            } else {
                reply = "That sounds interesting! 🌴 As I'm currently running in offline preview mode, I can help you best with hotel suggestions, package options, and agent details. Try asking 'tell me about packages' or 'recommend some hotels'!";
            }

            setMessages((prev) => [...prev, { role: "bot", text: reply }]);
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
