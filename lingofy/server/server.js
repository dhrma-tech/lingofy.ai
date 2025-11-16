
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
// Increase the payload size limit to handle base64 images
app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/v1/test', (req, res) => {
  res.json({ message: "🚀 Lingofy API is running!" });
});

app.post('/api/v1/save', (req, res) => {
  console.log('Received data to save:');
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ success: true, message: "Data saved successfully!" });
});

app.listen(port, () => {
  console.log(`Lingofy server listening on port ${port}`);
});
