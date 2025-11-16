
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Modality } from '@google/genai';
import multer from 'multer';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Use a more permissive CORS policy for deployment
app.use(express.json({ limit: '10mb' }));

// Setup for multer (for file uploads)
const upload = multer({ storage: multer.memoryStorage() });

// Securely initialize GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// =================================================================
// API Routes - MUST be defined before the production static serving
// =================================================================
app.get('/api/v1/test', (req, res) => {
  res.json({ message: "🚀 Lingofy API is running!" });
});

// New endpoint for chatbot
app.post('/api/v1/chat', async (req, res) => {
    try {
        const { messages } = req.body; // Full message history from client

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // Format for Gemini API
        const contents = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: 'You are a friendly and helpful AI assistant for Lingofy, an e-commerce platform for creators. Your goal is to help creators manage their online store. Keep your answers concise and easy to understand.',
            }
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: 'Failed to get chat response' });
    }
});


// New endpoint for image generation
app.post('/api/v1/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let generatedImage = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                generatedImage = part.inlineData.data;
                break;
            }
        }

        if (generatedImage) {
            res.json({ base64Image: generatedImage });
        } else {
            throw new Error("No image data returned from AI.");
        }

    } catch (error) {
        console.error("Image generation error:", error);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

// Updated save endpoint for multipart/form-data
app.post('/api/v1/save', upload.array('images'), (req, res) => {
  console.log('Received data to save:');
  // req.body.data contains the JSON string of your form data
  console.log('Form Fields:', JSON.parse(req.body.data));
  // req.files contains an array of file objects uploaded
  console.log('Received Files:', req.files.map(f => ({ name: f.originalname, size: f.size })));
  
  // In a real application, you would process this data,
  // e.g., save form fields to a database and upload files to cloud storage.

  res.status(200).json({ success: true, message: "Data saved successfully!" });
});
// =================================================================


// Serve React App in Production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Resolve path to client build directory
  const clientBuildPath = path.resolve(__dirname, '..', 'client', 'dist');

  // Serve static files from the React app
  app.use(express.static(clientBuildPath));

  // The "catchall" handler: for any request that doesn't match one above,
  // send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}


app.listen(port, () => {
  console.log(`Lingofy server listening on port ${port}`);
});