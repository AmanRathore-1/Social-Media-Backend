import { Server } from "socket.io";

let io;

// Stores online users
// Example:
// {
//   aman: "socketId1",
//   rahul: "socketId2"
// }

const onlineUsers = {};

export const initSocket = (server) => {

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        const userId = socket.handshake.query.userId;

        if (userId) {
            onlineUsers[userId] = socket.id;
        }

        console.log(`${userId} connected`);
        console.log("Online Users:", onlineUsers);

        // Listen for messages
      socket.on("sendMessage", (data) => {

    // If Postman sends string, convert it
    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    const { receiver, text } = data;

    console.log(`${userId} -> ${receiver}: ${text}`);

    const receiverSocketId = onlineUsers[receiver];

    if (receiverSocketId) {

        io.to(receiverSocketId).emit("receiveMessage", {
            sender: userId,
            text
        });

        console.log("✅ Message Delivered");

    } else {

        console.log(`${receiver} is offline`);

    }

});

        socket.on("disconnect", () => {

            console.log(`${userId} disconnected`);

            delete onlineUsers[userId];

            console.log("Online Users:", onlineUsers);

        });

    });

};

export const getIO = () => {

    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
};