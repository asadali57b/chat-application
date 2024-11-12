
const mongoose = require("mongoose");
const http = require("http");
const Message=require("./models/message_model")
const User=require("./models/userModel");
const Chat=require("./models/chatModel");

const express = require("express");
const {Server}=require("socket.io");
const app = express();
const server=http.createServer(app);
const io=new Server(server)
require("dotenv").config();
const path = require("path");
app.use(express.json());

const PORT = process.env.PORT || 3000;

const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chat_routes');
const messageRoute = require('./routes/message_route');

// Routes setup
app.use('/', userRoute);
app.use('/api/chat', chatRoute);
app.use('/api/message', messageRoute);

app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/chat-application")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

    io.on("connection", (socket) => {
        console.log("A new user has connected ",socket.id);
        
        socket.on("chatMessage", async (data) => {
            const { content, chatId, senderId } = data;
    
            if (!content || !chatId || !senderId) {
                console.log("Invalid data passed into chatMessage event");
                return;
            }
    
            const newMessage = {
                sender: senderId,
                content: content,
                chat: chatId
            };
    
            try {
                let message = await Message.create(newMessage);
    
                message = await message.populate("sender", "name image");
                message = await message.populate("chat");
                message = await User.populate(message, {
                    path: "chat.users",
                    select: "name image email"
                });
    
                await Chat.findByIdAndUpdate(chatId, { $set: { latestMessage: message } });
    
                io.to(chatId).emit("message", message);
                console.log("Message saved and broadcasted:", message);
            } catch (error) {
                console.log("Error saving message:", error);
            }
        });
        
        socket.on("join_room", (data) => {
            socket.join(data);
            console.log(`User with ID: ${socket.id} joined room: ${data}`);
        });
          
        socket.on("typing", (room) => {
            socket.in(room).emit("typing");
        });
        socket.on("stop typing", (room) => {
            socket.in(room).emit("stop typing");
        });

        socket.on("disconnect", () => {
            console.log("User disconnected from socket.io");
        });
        
    })
