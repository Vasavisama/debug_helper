const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ErrorPost = require('../models/ErrorPost');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    // Join an error discussion room
    socket.on('joinRoom', (errorId) => {
      socket.join(errorId);
      console.log(`User joined room: ${errorId}`);
    });

    // Handle incoming messages
    socket.on('sendMessage', async (data) => {
      const { errorId, senderId, message, senderName } = data;

      try {
        // Save message to DB
        const newMessage = await Message.create({
          errorId,
          senderId,
          message,
        });

        // Broadcast to everyone else in the room
        socket.to(errorId).emit('receiveMessage', {
             _id: newMessage._id,
             errorId,
             senderId: { _id: senderId, name: senderName }, // Populated-like structure
             message,
             createdAt: newMessage.createdAt
        });

        // Notify the error post author if they aren't the sender
        const errorPost = await ErrorPost.findById(errorId);
        if(errorPost && errorPost.userId.toString() !== senderId) {
             await Notification.create({
                userId: errorPost.userId,
                message: `${senderName} replied in chat on your error post: ${errorPost.title}`,
                type: 'chat'
            });
        }

      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    // Leave room
    socket.on('leaveRoom', (errorId) => {
        socket.leave(errorId);
        console.log(`User left room: ${errorId}`);
    });

    // Handle new answer broadcast
    socket.on('newAnswer', (data) => {
        socket.to(data.errorId).emit('newAnswer');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;
