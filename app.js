const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
require("dotenv").config();
const app = express();
app.use(express.json());

const PORT=process.env.PORT || 3000

const userRoute=require('./routes/userRoute')
const chatRoute=require('./routes/chat_routes')
const messageRoute=require('./routes/message_route')

app.use('/',userRoute),
app.use('/api/chat',chatRoute)
app.use('/api/message',messageRoute);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));





mongoose.connect("mongodb://localhost:27017/chat-application", {
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

const server=app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io=require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.socket_origin,
        // credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // Listen for chat messages from client
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        console.log(`userId: ${userData._id}`);

        socket.emit("connected");
        console.log(`userId: ${userData._id}`);
        // io.emit("message", message); // Broadcast message to all clients
    });
    socket.on("Join Chat",(room)=>{
        socket.join(room);
        console.log(`User joined room: ${room}`);
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
    socket.on("new message",(newMessageRecieved)=>{
        var chat=newMessageRecieved.chat;
        if(!chat.users) return console.log("chat.users not defined");
        chat.users.forEach(user=>{
            if(user._id==newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved",newMessageRecieved);
        })
    })
});
