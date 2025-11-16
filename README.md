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

---

## Deployment on Render

This project is configured for easy deployment to [Render](https://render.com/).

### Blueprint Deployment (Recommended)

1.  Push your code to a GitHub repository.
2.  Go to the [Render Blueprint dashboard](https://dashboard.render.com/blueprints) and click "New Blueprint Instance".
3.  Connect the repository containing this project.
4.  Render will automatically detect the `render.yaml` file and configure the service.
5.  You will need to add your `API_KEY` as a **secret environment variable** in the Render service settings.
    -   Key: `API_KEY`
    -   Value: `YOUR_GEMINI_API_KEY_HERE`
6.  Click "Apply" or "Create" to deploy the application.

The `render.yaml` file in this repository automatically configures a single web service that:
- Installs dependencies for both the server and client.
- Builds the React client for production.
- Starts the Express server, which serves both the API and the built client files.
