
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "../modules/api";

const AiChatPage = () => {
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem("ai_chat_history");
        return saved ? JSON.parse(saved) : [
            { role: "assistant", content: "Hello! I can help you analyze your call data. Ask me anything about your call data. For example, 'Show me the last 5 internal calls' or 'Count incoming calls from 192.168.1.10'." }
        ];
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        sessionStorage.setItem("ai_chat_history", JSON.stringify(messages));
    }, [messages]);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.post(`/api/chat`, { message: userMessage.content });

            const aiResponse = { role: "assistant", content: response.data.answer };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error chatting with AI:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error while processing your request. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background p-6 space-y-4">
            <Card className="h-full flex flex-col border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        AI Data Assistant
                    </CardTitle>
                    <CardDescription>
                        Ask questions about your CDR data.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {msg.role === "assistant" && <Bot className="h-4 w-4 mt-1 opacity-70" />}
                                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                        {msg.role === "user" && <User className="h-4 w-4 mt-1 opacity-70" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t flex gap-2">
                        <Input
                            placeholder="Type your question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button onClick={handleSend} disabled={isLoading} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AiChatPage;
