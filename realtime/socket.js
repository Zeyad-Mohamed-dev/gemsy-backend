import { Server } from "socket.io";

let io;

export function initSocket(server) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡️ Socket connected:", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId) {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    }
    else {
      console.log("User did not provide an id");
    }    
    // socket.on("joinRoom", (room) => {
    //   socket.join(room);
    //   socket.emit("joined", room);
    // });
    // socket.on("leaveRoom", (room) => {
    //   socket.leave(room);
    //   socket.emit("left", room);
    // });

    // socket.on("sendMessage", ({ room, message }) => {
    //   if (room) {
    //     io.to(room).emit("message", { message, from: socket.id, room });
    //   } else {
    //     io.emit("message", { message, from: socket.id });
    //   }
    // });

    // socket.on("disconnect", (reason) => {
    //   console.log(`Socket disconnected: ${socket.id} (${reason})`);
    // });
  });

  return io;
}

export function getIo() {
  return io;
}
