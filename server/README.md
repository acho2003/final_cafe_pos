# Café POS Backend Server

This directory contains the Node.js, Express, and MongoDB backend for the Café POS system.

## Setup Instructions

1.  **Install Dependencies**: Navigate to this `server` directory and run:
    ```bash
    npm install
    ```

2.  **Create Environment File**: Create a `.env` file in this directory by copying the example:
    ```bash
    cp .env.example .env
    ```

3.  **Configure Environment Variables**: Open the `.env` file and add your MongoDB connection string and a secure JWT secret.
    -   `MONGO_URI`: Your connection string for the MongoDB database (e.g., from MongoDB Atlas).
    -   `JWT_SECRET`: A long, random, and secret string used for signing authentication tokens.

## Running the Server

1.  **Start the Server**:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:5000`.

2.  **Seed the Database**: To populate the database with initial mock data, stop the server and run the seed script. **You must do this once after the initial setup.**
    ```bash
    npm run seed
    ```
    This will clear all existing data and insert the default cafes, users (with hashed passwords), menu items, and orders.

---

## Troubleshooting

### Error: "Failed to fetch" on the Login Page

This is the most common error during setup. It means the frontend application cannot reach the backend server. 99% of the time, this is because the backend server crashed immediately on startup because it failed to connect to the database.

**Solution: Whitelist Your IP Address in MongoDB Atlas**

MongoDB Atlas uses an IP access list to block connections from unknown IP addresses for security. You must add your computer's IP address to this list.

1.  **Log in to MongoDB Atlas**: Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/).
2.  **Navigate to Network Access**: In the left-hand menu, under the "Security" section, click on **Network Access**.
3.  **Add Your IP Address**:
    -   Click the **"Add IP Address"** button.
    -   For easy development, click **"Allow Access From Anywhere"**. This will add the IP address `0.0.0.0/0` to the list.
    -   Click **"Confirm"**. It may take a minute for the change to apply.

4.  **Re-run the Seeder and Restart the Server**:
    -   After whitelisting your IP, you **must** run the seeder again to ensure the data is correct: `npm run seed`.
    -   Then, restart your server: `npm start`.

Your frontend should now be able to connect to the backend.
