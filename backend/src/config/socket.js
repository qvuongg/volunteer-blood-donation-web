import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Nới lỏng CORS cho môi trường dev để tránh lỗi từ frontend (http://localhost:5173)
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: false
    }
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      // Dùng chung JWT_SECRET và payload với authController (login)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // authController.login ký payload { userId: ... }
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.userId} connected to WebSocket`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userId} disconnected from WebSocket`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper function to send notification to a specific user
export const sendNotificationToUser = (userId, notification) => {
  try {
    const socketIO = getIO();
    socketIO.to(`user_${userId}`).emit('new_notification', notification);
    console.log(`📨 Sent notification to user ${userId}:`, notification.tieu_de);
  } catch (error) {
    console.error('Error sending notification via socket:', error);
  }
};
