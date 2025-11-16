# Lingofy Hub

Lingofy is the all-in-one hub for creators to build, manage, and grow their e-commerce brand with the power of AI.

## Project Structure

This project is a monorepo containing two main parts:

-   `lingofy/client`: A React frontend application built with Vite. This is the user interface.
-   `lingofy/server`: An Express.js backend server that securely handles API requests to the Google Gemini API and manages file uploads.

**Important:** Do not run `npm` commands in the root directory. Always navigate to the `client` or `server` directory first.

## Prerequisites

-   Node.js (v18 or higher)
-   npm
-   A Google Gemini API Key

## Local Development Setup

To run this project locally, you will need to run the client and server in two separate terminal windows.

### 1. Backend Server Setup

First, set up and run the Express server.

1.  **Navigate to the server directory:**
    ```bash
    cd lingofy/server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create and configure your environment file:**
    In the `lingofy/server` directory, you **must** create a new file named `.env`. This file securely stores your secret API key where the server can access it.

    Add your Google Gemini API key to the `.env` file like this:
    ```env
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:3001`.

---

### 2. Frontend Client Setup

Next, set up and run the React client in a **new terminal window**.

1.  **Navigate to the client directory:**
    ```bash
    cd lingofy/client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the client:**
    ```bash
    npm run dev
    ```
    The client application will start on `http://localhost:5173`. It is configured to proxy API requests to the server running on port 3001.

You can now open `http://localhost:5173` in your browser to use the application.
