// ~~~~~~~~~~~~~~~~~ imports ~~~~~~~~~~~~~~~~~
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

// ~~~~~~~~~~~~~~~~~~ setup ~~~~~~~~~~~~~~~~~~~
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// ~~~~~~~~~~~~~~~~~~ middleware ~~~~~~~~~~~~~~~~~~~
const io = new Server(server, {
  cors: {
    origin: 'https://chat-application-deb.vercel.app',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: 'https://chat-application-deb.vercel.app' }));

// ~~~~~~~~~~~~~~~~~~~ routes ~~~~~~~~~~~~~~~~~~~
io.on("connection", (socket) => {
  socket.emit("welcome", `Welcome to the chat room`);
  socket.broadcast.emit("welcome", `${socket.id} joined the chat room`);

  socket.on("message", ({ room, message, senderId }) => {
    console.log({ room, message, senderId });
    // Broadcast the message along with sender ID
    socket.to(room).emit("receive-message", { message, senderId });
  });
  

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
})

app.get("/", (req, res) => { 
  res.send("Hello World!");
});

// ~~~~~~~~~~~~~~~~~~~ server ~~~~~~~~~~~~~~~~~~~
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});