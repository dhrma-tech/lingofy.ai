import { useState, useRef, ChangeEvent } from "react";
import { INITIAL_DATA, LingofyData } from "../lib/data";
import { GoogleGenAI, Modality } from "@google/genai";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { Alert, AlertDescription, AlertTitle } from "./ui/Alert";
import { Loader2, CheckCircle, AlertCircle, ImageUp, XCircle, Sparkles } from "lucide-react";

export function StudioTab() {
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

        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: parsedValue,
            },
        }));
    };
    
    const readFilesAsDataURLs = (files: File[]): Promise<string[]> => {
      return Promise.all(files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }));
    };

    const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        setImageError(null);
        const files = e.target.files;
        if (!files) return;

        const filesArray = Array.from(files);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

        const validFiles = filesArray.filter(file => {
            if (file.size > MAX_SIZE) {
                setImageError(`File "${file.name}" exceeds the 5MB size limit.`);
                return false;
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                setImageError(`File type for "${file.name}" is not supported (use JPG, PNG, WEBP).`);
                return false;
            }
            return true;
        });
        
        if (validFiles.length !== filesArray.length) {
            if (e.target) e.target.value = '';
            return;
        }

        try {
            const newPreviews = await readFilesAsDataURLs(validFiles);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        } catch (error) {
            console.error("Error reading files:", error);
            setImageError("An error occurred while reading the image files.");
        }
        
        if (e.target) e.target.value = '';
    };

    const handleGenerateImage = async () => {
        setIsGenerating(true);
        setImageError(null);

        const basePrompt = `Generate a high-quality, professional product photograph for e-commerce. The product is: "${formData.product.title}". Description: "${formData.product.description}". The image should be on a clean, minimalist background, suitable for a product listing.`;
        
        const finalPrompt = imageGenPrompt.trim()
            ? `${basePrompt} Additional instructions from the creator: "${imageGenPrompt.trim()}".`
            : basePrompt;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: finalPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            let generatedImage: string | null = null;
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    generatedImage = `data:image/png;base64,${base64ImageBytes}`;
                    break;
                }
            }

            if (generatedImage) {
                setImagePreviews(prev => [...prev, generatedImage!]);
            } else {
                throw new Error("AI did not return a valid image.");
            }

        } catch (error) {
            console.error("AI Image Generation Error:", error);
            setImageError("Failed to generate image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setSaveStatus(null);
        const dataToSave = {
            ...formData,
            product: {
            ...formData.product,
            images: imagePreviews,
            },
        };

        try {
            const response = await fetch('/api/v1/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
            if (result.success) {
                setSaveStatus({ type: 'success', message: result.message || 'Data saved successfully!' });
            } else {
                throw new Error(result.message || 'Failed to save data.');
            }
        } catch (error) {
            console.error("Failed to save data:", error);
            setSaveStatus({ type: 'error', message: 'An error occurred while saving. Please try again.' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setSaveStatus(null), 5000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Studio</h2>
                    <p className="text-muted-foreground">Manage all your store's content in one place.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading || isGenerating}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                        <CardHeader>
                            <CardTitle>Site & Creator Details</CardTitle>
                            <CardDescription>Basic information about your site and you.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                           <div className="space-y-4">
                               <h3 className="font-medium">Meta</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="meta.siteName">Site Name</Label>
                                    <Input id="meta.siteName" name="meta.siteName" value={formData.meta.siteName} onChange={handleFormChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="meta.siteSlug">Site Slug</Label>
                                    <Input id="meta.siteSlug" name="meta.siteSlug" value={formData.meta.siteSlug} onChange={handleFormChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="creator.bio">Creator Bio</Label>
                                    <Textarea id="creator.bio" name="creator.bio" value={formData.creator.bio} onChange={handleFormChange} />
                                </div>
                           </div>
                           <div className="space-y-4">
                                <h3 className="font-medium">Contact & Socials</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="contact.email">Email</Label>
                                    <Input id="contact.email" name="contact.email" type="email" value={formData.contact.email} onChange={handleFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="socials.twitter">Twitter URL</Label>
                                    <Input id="socials.twitter" name="socials.twitter" value={formData.socials.twitter} onChange={handleFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="socials.instagram">Instagram URL</Label>
                                    <Input id="socials.instagram" name="socials.instagram" value={formData.socials.instagram} onChange={handleFormChange} />
                                </div>
                           </div>
                        </CardContent>
                        <CardFooter>
                           <p className="text-xs text-muted-foreground">Changes are saved when you click the "Save Changes" button.</p>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="product">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                             <CardDescription>Manage your main product information and images.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="product.title">Product Title</Label>
                                    <Input id="product.title" name="product.title" value={formData.product.title} onChange={handleFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="product.price">Price</Label>
                                    <Input id="product.price" name="product.price" type="number" value={formData.product.price} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product.description">Product Description</Label>
                                <Textarea id="product.description" name="product.description" value={formData.product.description} onChange={handleFormChange} rows={5} />
                            </div>
                            <div className="space-y-4">
                                <Label>Product Images</Label>
                                <div className="p-4 border-2 border-dashed rounded-lg">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        multiple 
                                        accept="image/jpeg,image/png,image/webp" 
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    <div className="flex gap-2 flex-wrap">
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isGenerating || isLoading}>
                                            <ImageUp className="w-4 h-4 mr-2"/>
                                            Select Images
                                        </Button>
                                         <Button type="button" onClick={handleGenerateImage} disabled={isGenerating || isLoading}>
                                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                                        </Button>
                                    </div>
                                     {imageError && (
                                        <Alert variant="destructive" className="mt-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Image Error</AlertTitle>
                                            <AlertDescription>{imageError}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="mt-4 space-y-2">
                                        <Label htmlFor="ai-prompt">AI Prompt Keywords (Optional)</Label>
                                        <Input
                                            id="ai-prompt"
                                            placeholder="e.g., on a wooden table, vibrant colors, studio lighting"
                                            value={imageGenPrompt}
                                            onChange={(e) => setImageGenPrompt(e.target.value)}
                                            disabled={isGenerating || isLoading}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Add keywords to refine the generated image. Uses title and description by default.
                                        </p>
                                    </div>
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 mt-4 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {imagePreviews.map((src, index) => (
                                                <div key={index} className="relative group">
                                                    <img src={src} alt={`Preview ${index + 1}`} className="object-cover w-full h-24 rounded-md"/>
                                                    <button 
                                                        onClick={() => handleRemoveImage(index)}
                                                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label="Remove image"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="blog">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Manager</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                                <p className="text-muted-foreground">Blog Manager Coming Soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}