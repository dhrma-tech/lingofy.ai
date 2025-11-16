import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/Tabs";
import { LayoutDashboard, PenSquare, Star, MessageSquare } from 'lucide-react';
import { StudioTab } from "./components/StudioTab";
import { DashboardTab } from "./components/DashboardTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { Chatbot, Message } from "./components/Chatbot";
import { Button } from "./components/ui/Button";
import { LandingPage } from "./components/LandingPage";
import { AnimatePresence } from "framer-motion";
import { GoogleGenAI, Chat } from "@google/genai";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [showHub, setShowHub] = useState(false);
  
  // Lifted Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm the Lingofy assistant. How can I help you today?" }
  ]);
  const [isChatLoading, setChatIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    fetch('/api/v1/test')
      .then(res => {
        if (!res.ok) {
          throw new Error('API request failed');
        }
        return res.json();
      })
      .then(data => setApiStatus(data.message))
      .catch(() => setApiStatus("❌ Lingofy API is down."));
  
    // Initialize Chatbot AI instance once
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

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isChatLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setChatIsLoading(true);

    try {
        const result = await chatRef.current.sendMessage({ message });
        const modelMessage: Message = { role: 'model', content: result.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage: Message = { role: 'model', content: 'Oops! Something went wrong. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setChatIsLoading(false);
    }
  };

  if (!showHub) {
    return <LandingPage onEnter={() => setShowHub(true)} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Lingofy Hub</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${apiStatus.startsWith('🚀') ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{apiStatus}</span>
          </div>
        </header>

        <div className="mt-6">
          <Tabs defaultValue="studio" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="studio">
                <PenSquare className="w-4 h-4 mr-2" />
                Studio
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="studio" className="mt-6">
              <StudioTab />
            </TabsContent>
            <TabsContent value="dashboard" className="mt-6">
              <DashboardTab />
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <ReviewsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AnimatePresence>
        {isChatOpen && (
          <Chatbot
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
            aria-label="Toggle Chatbot"
            >
              <MessageSquare className="w-8 h-8"/>
          </Button>
      </div>
    </main>
  );
}

export default App;