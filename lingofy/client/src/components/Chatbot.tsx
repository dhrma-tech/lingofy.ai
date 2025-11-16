import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export type Message = {
    role: 'user' | 'model';
    content: string;
};

interface ChatbotProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    onClose: () => void;
}

export function Chatbot({ messages, isLoading, onSendMessage, onClose }: ChatbotProps) {
    const [input, setInput] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        const viewport = viewportRef.current;
        if (viewport) {
           viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        onSendMessage(input);
        setInput('');
    };

    return (
        <motion.div 
            className="fixed bottom-24 right-6 w-[90vw] max-w-md z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
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
                    <ScrollArea className="h-full p-6" viewportRef={viewportRef}>
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
        </motion.div>
    );
}