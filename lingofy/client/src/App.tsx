

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/Tabs";
import { LayoutDashboard, PenSquare, Star, MessageSquare } from 'lucide-react';
import { StudioTab } from "./components/StudioTab";
import { DashboardTab } from "./components/DashboardTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { Chatbot, Message } from "./components/Chatbot";
import { Button } from "./components/ui/Button";
import { LandingPage } from "./components/LandingPage";
import { AnimatePresence } from "framer-motion";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [showHub, setShowHub] = useState(false);
  
  // Lifted Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm the Lingofy assistant. How can I help you today?" }
  ]);
  const [isChatLoading, setChatIsLoading] = useState(false);

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
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isChatLoading) return;

    const userMessage: Message = { role: 'user', content: message };
    // The initial greeting from the model should not be part of the API history.
    const messagesForApi = [...messages.slice(1), userMessage];
    
    setMessages(prev => [...prev, userMessage]);
    setChatIsLoading(true);

    try {
        const response = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesForApi }),
        });

        if (!response.ok) {
          // Try to get a specific error message from the server's JSON response
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `The server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        const modelMessage: Message = { role: 'model', content: result.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error('Chat API error:', error);
        // Display the specific error message in the chat
        const messageText = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
        const errorMessage: Message = { role: 'model', content: `Sorry, I ran into an issue: ${messageText}` };
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