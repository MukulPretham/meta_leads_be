# MukulPretham/meta_leads_be (Assignment)

This project provides a simple backend service for integrating with Meta (Facebook Lead Ads) webhooks. It captures lead data, fetches details from the Facebook Graph API, and displays them via a basic web interface and WebSockets for real-time updates.

## Features

*   Receives Meta Lead Ads webhook notifications.
*   Fetches full lead details using the Facebook Graph API.
*   Stores leads in memory (non-persistent).
*   Exposes leads via a REST API (`/leads`).
*   Provides real-time lead updates via WebSockets.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MukulPretham/meta_leads_be.git
    cd meta_leads_be
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configuration (in `server.js`):**
    *   `VERIFY_TOKEN`: Your Meta webhook verification token.
    *   `PAGE_ACCESS_TOKEN`: Your Meta Page Access Token for fetching lead data.
    
    **Important:** Replace the placeholder tokens with your actual values.

4.  **Run the server:**
    ```bash
    node server.js
    ```
    The server will run on `http://localhost:3000` (HTTP and WebSocket).

## Usage

### 1. Webhook Setup (Meta Lead Ads)

*   Configure your Meta App webhook to point to `http://YOUR_SERVER_URL:3000/webhook`.
*   Use the `VERIFY_TOKEN` defined in `server.js` for verification.

### 2. Accessing Leads

*   **REST API:** Open `http://localhost:3000/leads` in your browser to see all current leads.
*   **WebSockets:** Connect a WebSocket client to `ws://localhost:3000` to receive real-time lead updates. New leads will be broadcasted in JSON format: 
    ```json
    { "type": "leads", "count": 1, "leads": [...] }
    ```
