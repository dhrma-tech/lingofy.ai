import { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatbotProps {
    onClose: () => void;
}

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function Chatbot({ onClose }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "Hello! I'm the Lingofy assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a friendly and helpful AI assistant for Lingofy, an e-commerce platform for creators. Your goal is to help creators manage their online store. Keep your answers concise and easy to understand.',
                },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't connect to the AI service. Please check the API key." }]);
        }
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', content: result.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error('Gemini API error:', error);
            const errorMessage: Message = { role: 'model', content: 'Oops! Something went wrong. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-[90vw] max-w-md z-50 animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-300">
            <Card className="flex flex-col h-[60vh] shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bot className="w-6 h-6 text-primary" />
                        <CardTitle className="text-lg">Lingofy Assistant</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    {msg.role === 'model' && <div className="p-2 rounded-full bg-muted"><Bot className="w-5 h-5 text-primary" /></div>}
                                    <div className={cn("max-w-[80%] rounded-lg px-4 py-2 text-sm", 
                                        msg.role === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                                            : 'bg-muted rounded-bl-none'
                                    )}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && <div className="p-2 rounded-full bg-accent"><User className="w-5 h-5 text-accent-foreground" /></div>}
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                    <div className="p-2 rounded-full bg-muted"><Bot className="w-5 h-5 text-primary" /></div>
                                    <div className="bg-muted rounded-lg rounded-bl-none px-4 py-2 text-sm flex items-center">
                                       <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Ask about your store..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}