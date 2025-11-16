import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import ReactDOM from 'react-dom/client';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { Slot } from "@radix-ui/react-slot";
import { GoogleGenAI, Modality, Chat } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
    LayoutDashboard, PenSquare, Star, MessageSquare, Loader2, CheckCircle, 
    AlertCircle, ImageUp, XCircle, Sparkles, Download, QrCode, Bot, 
    Send, User, X, ArrowRight, Image 
} from 'lucide-react';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA ---
interface LingofyData {
    meta: { siteName: string; siteSlug: string; baseLanguage: string; baseCurrency: string; };
    creator: { bio: string; location: string; };
    product: { title: string; description: string; price: number; images: string[]; };
    contact: { email: string; phone: string; };
    socials: { twitter: string; instagram: string; linkedin: string; };
    seo: { title: string; description: string; };
}

const INITIAL_DATA: LingofyData = {
    meta: { siteName: 'My Creative Store', siteSlug: 'my-creative-store', baseLanguage: 'en-US', baseCurrency: 'USD' },
    creator: { bio: 'I am a passionate creator sharing my work with the world.', location: 'Global' },
    product: { title: 'Handcrafted Wonder', description: 'A unique piece, crafted with love and care. Perfect for any occasion.', price: 49.99, images: [] },
    contact: { email: 'hello@creator.com', phone: '+1 (555) 123-4567' },
    socials: { twitter: 'https://twitter.com/creator', instagram: 'https://instagram.com/creator', linkedin: 'https://linkedin.com/in/creator' },
    seo: { title: 'My Creative Store | Handcrafted Goods', description: 'Discover unique handcrafted goods from a passionate creator.' },
};

// --- UI COMPONENTS ---

// Alert
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  { variants: { variant: { default: "bg-background text-foreground", destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive" } }, defaultVariants: { variant: "default" } }
);
const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

// Button
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

// Card
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
));
Card.displayName = "Card";
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
    return <input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";

// Label
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

// ScrollArea
const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-1.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-1.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-accent" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// Tabs
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
    return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";

// --- MAIN COMPONENTS ---

function DashboardTab() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Global Reach</CardTitle></CardHeader>
                <CardContent><div className="flex items-center justify-center h-64 bg-muted rounded-md"><p className="text-muted-foreground">World Map Placeholder</p></div></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Share Kit</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-48 h-48 bg-muted rounded-md"><QrCode className="w-24 h-24 text-muted-foreground" /></div>
                    <Button className="w-full"><Download className="w-4 h-4 mr-2" />Download Share Card</Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ReviewsTab() {
    return (
        <Card>
            <CardHeader><CardTitle>Reviews Manager</CardTitle></CardHeader>
            <CardContent><div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md"><p className="text-muted-foreground">Reviews Table Placeholder</p></div></CardContent>
        </Card>
    );
}

function StudioTab() {
    const [formData, setFormData] = useState<LingofyData>(INITIAL_DATA);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageGenPrompt, setImageGenPrompt] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (!name.includes('.')) return;
        const [section, field] = name.split('.') as [keyof LingofyData, string];
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: parsedValue } }));
    };
    
    const readFilesAsDataURLs = (files: File[]): Promise<string[]> => {
      return Promise.all(files.map(file => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
      })));
    };

    const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const files = e.target.files;
        if (!files) return;
        const filesArray = Array.from(files);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
        const validFiles = filesArray.filter(file => {
            if (file.size > MAX_SIZE) { setImageError(`File "${file.name}" exceeds 5MB.`); return false; }
            if (!ALLOWED_TYPES.includes(file.type)) { setImageError(`Unsupported file type for "${file.name}".`); return false; }
            return true;
        });
        if (validFiles.length !== filesArray.length) { if (e.target) e.target.value = ''; return; }
        try {
            const newPreviews = await readFilesAsDataURLs(validFiles);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        } catch (error) {
            console.error("Error reading files:", error);
            setImageError("An error occurred while reading files.");
        }
        if (e.target) e.target.value = '';
    };

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        setImageError(null);
        const basePrompt = `Generate a high-quality, professional product photograph for e-commerce. The product is: "${formData.product.title}". Description: "${formData.product.description}". The image should be on a clean, minimalist background.`;
        const finalPrompt = imageGenPrompt.trim() ? `${basePrompt} Additional instructions: "${imageGenPrompt.trim()}".` : basePrompt;
        try {
            const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ text: finalPrompt }] }, config: { responseModalities: [Modality.IMAGE] } });
            let generatedImage: string | null = null;
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) { generatedImage = `data:image/png;base64,${part.inlineData.data}`; break; }
            }
            if (generatedImage) { setImagePreviews(prev => [...prev, generatedImage!]); } else { throw new Error("AI did not return a valid image."); }
        } catch (error) {
            console.error("AI Image Generation Error:", error);
            setImageError("Failed to generate image. Please try again.");
        } finally { setIsGenerating(false); }
    };

    const handleRemoveImage = (indexToRemove: number) => { setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove)); };

    const handleSave = async () => {
        setIsLoading(true); setSaveStatus(null); setImageError(null);
        const dataToSave = { ...formData, product: { ...formData.product, images: imagePreviews } };
        console.log("Simulating save with data:", dataToSave);
        setTimeout(() => {
            setSaveStatus({ type: 'success', message: 'Data saved successfully!' });
            setIsLoading(false);
            setTimeout(() => setSaveStatus(null), 5000);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Studio</h2>
                    <p className="text-muted-foreground">Manage all your store's content in one place.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading || isGenerating}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {saveStatus && (
                <Alert variant={saveStatus.type === 'error' ? 'destructive' : 'default'}>
                    {saveStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{saveStatus.type === 'success' ? 'Success!' : 'Error!'}</AlertTitle>
                    <AlertDescription>{saveStatus.message}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="site">
                <TabsList>
                    <TabsTrigger value="site">Site Info</TabsTrigger>
                    <TabsTrigger value="product">Product</TabsTrigger>
                    <TabsTrigger value="blog" disabled>Blog</TabsTrigger>
                </TabsList>
                <TabsContent value="site">
                    <Card>
                        <CardHeader><CardTitle>Site & Creator Details</CardTitle><CardDescription>Basic information about your site and you.</CardDescription></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                           <div className="space-y-4">
                               <h3 className="font-medium">Meta</h3>
                                <div className="space-y-2"><Label htmlFor="meta.siteName">Site Name</Label><Input id="meta.siteName" name="meta.siteName" value={formData.meta.siteName} onChange={handleFormChange} /></div>
                                <div className="space-y-2"><Label htmlFor="meta.siteSlug">Site Slug</Label><Input id="meta.siteSlug" name="meta.siteSlug" value={formData.meta.siteSlug} onChange={handleFormChange} /></div>
                                <div className="space-y-2"><Label htmlFor="creator.bio">Creator Bio</Label><Textarea id="creator.bio" name="creator.bio" value={formData.creator.bio} onChange={handleFormChange} /></div>
                           </div>
                           <div className="space-y-4">
                                <h3 className="font-medium">Contact & Socials</h3>
                                <div className="space-y-2"><Label htmlFor="contact.email">Email</Label><Input id="contact.email" name="contact.email" type="email" value={formData.contact.email} onChange={handleFormChange} /></div>
                                <div className="space-y-2"><Label htmlFor="socials.twitter">Twitter URL</Label><Input id="socials.twitter" name="socials.twitter" value={formData.socials.twitter} onChange={handleFormChange} /></div>
                                <div className="space-y-2"><Label htmlFor="socials.instagram">Instagram URL</Label><Input id="socials.instagram" name="socials.instagram" value={formData.socials.instagram} onChange={handleFormChange} /></div>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="product">
                    <Card>
                        <CardHeader><CardTitle>Product Details</CardTitle><CardDescription>Manage your main product information and images.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2"><Label htmlFor="product.title">Product Title</Label><Input id="product.title" name="product.title" value={formData.product.title} onChange={handleFormChange} /></div>
                                <div className="space-y-2"><Label htmlFor="product.price">Price</Label><Input id="product.price" name="product.price" type="number" value={formData.product.price} onChange={handleFormChange} /></div>
                            </div>
                            <div className="space-y-2"><Label htmlFor="product.description">Product Description</Label><Textarea id="product.description" name="product.description" value={formData.product.description} onChange={handleFormChange} rows={5} /></div>
                            <div className="space-y-4">
                                <Label>Product Images</Label>
                                <div className="p-4 border-2 border-dashed rounded-lg">
                                    <input type="file" ref={fileInputRef} multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                                    <div className="flex gap-2 flex-wrap">
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isGenerating || isLoading}><ImageUp className="w-4 h-4 mr-2"/>Select Images</Button>
                                        <Button type="button" onClick={handleGenerateImage} disabled={isGenerating || isLoading}>
                                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                                        </Button>
                                    </div>
                                    {imageError && (<Alert variant="destructive" className="mt-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Image Error</AlertTitle><AlertDescription>{imageError}</AlertDescription></Alert>)}
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="ai-prompt">AI Prompt Keywords (Optional)</Label>
                                        <Input id="ai-prompt" placeholder="e.g., on a wooden table, studio lighting" value={imageGenPrompt} onChange={(e) => setImageGenPrompt(e.target.value)} disabled={isGenerating || isLoading} />
                                        <p className="text-sm text-muted-foreground">Add keywords to refine the generated image.</p>
                                    </div>
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 mt-4 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {imagePreviews.map((src, index) => (
                                                <div key={index} className="relative group">
                                                    <img src={src} alt={`Preview ${index + 1}`} className="object-cover w-full h-24 rounded-md"/>
                                                    <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image"><XCircle className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface ChatbotProps { onClose: () => void; }
type Message = { role: 'user' | 'model'; content: string; };

function Chatbot({ onClose }: ChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([{ role: 'model', content: "Hello! I'm the Lingofy assistant. How can I help?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });
            chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction: 'You are a friendly AI assistant for Lingofy, an e-commerce platform for creators. Help creators manage their online store. Keep answers concise.' } });
        } catch (error) {
            console.error("Failed to initialize Gemini:", error);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't connect to the AI service." }]);
        }
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
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
            setMessages(prev => [...prev, { role: 'model', content: result.text }]);
        } catch (error) {
            console.error('Gemini API error:', error);
            setMessages(prev => [...prev, { role: 'model', content: 'Oops! Something went wrong.' }]);
        } finally { setIsLoading(false); }
    };

    return (
        <motion.div 
            className="fixed bottom-24 right-6 w-[90vw] max-w-md z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <Card className="flex flex-col h-[60vh] shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2"><Bot className="w-6 h-6 text-primary" /><CardTitle className="text-lg">Lingofy Assistant</CardTitle></div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    {msg.role === 'model' && <div className="p-2 rounded-full bg-muted"><Bot className="w-5 h-5 text-primary" /></div>}
                                    <div className={cn("max-w-[80%] rounded-lg px-4 py-2 text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>{msg.content}</div>
                                    {msg.role === 'user' && <div className="p-2 rounded-full bg-accent"><User className="w-5 h-5 text-accent-foreground" /></div>}
                                </div>
                            ))}
                             {isLoading && (<div className="flex items-start gap-3 justify-start"><div className="p-2 rounded-full bg-muted"><Bot className="w-5 h-5 text-primary" /></div><div className="bg-muted rounded-lg rounded-bl-none px-4 py-2 text-sm flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Thinking...</div></div>)}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                        <Input placeholder="Ask about your store..." value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}><Send className="h-4 w-4" /></Button>
                    </form>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

interface LandingPageProps { onEnter: () => void; }
const features = [
    { icon: <LayoutDashboard className="w-8 h-8 text-primary" />, title: "All-in-One Studio", description: "Manage your products, content, and site settings from a single, beautifully designed dashboard." },
    { icon: <Bot className="w-8 h-8 text-primary" />, title: "AI-Powered Assistant", description: "Get help with product descriptions, ask questions, or brainstorm ideas with your integrated AI assistant." },
    { icon: <Image className="w-8 h-8 text-primary" />, title: "Instant Image Generation", description: "Generate stunning, high-quality product images with a single click, powered by AI." }
];
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
    return (
        <motion.div ref={ref} variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} initial="hidden" animate={inView ? "visible" : "hidden"} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <Card className="h-full hover:shadow-lg hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6 text-center flex flex-col items-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">{icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
function LandingPage({ onEnter }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-y-auto">
            <header className="fixed top-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-50 border-b">
                 <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary">Lingofy</h1>
                    <Button onClick={onEnter}>Enter Hub</Button>
                </div>
            </header>
            <main className="pt-24">
                <motion.section className="text-center py-20 px-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">Your Global Store, Simplified.</h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">Lingofy is the all-in-one hub for creators to build, manage, and grow their brand with the power of AI.</p>
                    <Button size="lg" onClick={onEnter}>Start Creating <ArrowRight className="w-5 h-5 ml-2" /></Button>
                </motion.section>
                <section className="py-20 px-4 bg-muted/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12"><h3 className="text-3xl font-bold">A toolkit built for creators.</h3><p className="text-muted-foreground mt-2">Everything you need to succeed, right at your fingertips.</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{features.map((feature, index) => <FeatureCard key={index} {...feature} />)}</div>
                    </div>
                </section>
                <footer className="py-8 text-center text-muted-foreground text-sm"><p>&copy; {new Date().getFullYear()} Lingofy. All rights reserved.</p></footer>
            </main>
        </div>
    );
}


function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showHub, setShowHub] = useState(false);

  useEffect(() => {
    setApiStatus("🚀 Lingofy API is running!");
  }, []);

  if (!showHub) {
    return <LandingPage onEnter={() => setShowHub(true)} />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Lingofy Hub</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>{apiStatus}</span>
          </div>
        </header>
        <div className="mt-6">
          <Tabs defaultValue="studio" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="studio"><PenSquare className="w-4 h-4 mr-2" />Studio</TabsTrigger>
              <TabsTrigger value="dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
              <TabsTrigger value="reviews"><Star className="w-4 h-4 mr-2" />Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="studio" className="mt-6"><StudioTab /></TabsContent>
            <TabsContent value="dashboard" className="mt-6"><DashboardTab /></TabsContent>
            <TabsContent value="reviews" className="mt-6"><ReviewsTab /></TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AnimatePresence>
        {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="rounded-full w-16 h-16 shadow-lg" onClick={() => setIsChatOpen(!isChatOpen)} aria-label="Toggle Chatbot">
              <MessageSquare className="w-8 h-8"/>
          </Button>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
