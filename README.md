## Run Locally

**Prerequisites:** Node.js

This project has two parts: a client (frontend) and a server (backend). You must run them in **two separate terminals**.

**Terminal 1: Run the Frontend (Client)**

1.  Navigate to the client folder:
    `cd lingofy/client`
2.  Install dependencies:
    `npm install`
3.  Run the client app:
    `npm run dev`
4.  Your app will be available at `http://localhost:5173`.

**Terminal 2: Run the Backend (Server)**

1.  Navigate to the server folder:
    `cd lingofy/server`
2.  Install dependencies:
    `npm install`
3.  Set your API key *securely* (e.g., in a `.env` file):
    `GEMINI_API_KEY="your_secret_key_here"`
4.  Run the server:
    `npm start`
5.  Your API will be running at `http://localhost:3001`. The client is already configured to talk to it.
