import http from "http";
import dotenv from "dotenv";

import app from "./app.js";
import { connectDb } from "./src/config/db.js";
import { initSocket } from "./src/sockets/socket.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP Server
const server = http.createServer(app);
initSocket(server);
try {
    await connectDb();

    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

} catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
}