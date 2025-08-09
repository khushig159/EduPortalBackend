function videoCallHandler(io, socket) {
  // NEW: Send incoming call signal to callee
  socket.on('call-user', ({ targetUserId, fromUserId }) => {
    io.to(targetUserId).emit('incoming-call', { fromUserId });
  });

  // Step 1: Send offer
  socket.on('video-offer', ({ targetUserId, offer, fromUserId }) => {
    io.to(targetUserId).emit('video-offer', { offer, fromUserId });
  });

  // Step 2: Send answer
  socket.on('video-answer', ({ targetUserId, answer, fromUserId }) => {
    io.to(targetUserId).emit('video-answer', { answer, fromUserId });
  });

  // Step 3: ICE candidates
  socket.on('ice-candidate', ({ targetUserId, candidate, fromUserId }) => {
    io.to(targetUserId).emit('ice-candidate', { candidate, fromUserId });
  });

  // Optional: handle call end
  socket.on('end-call', ({ targetUserId }) => {
    io.to(targetUserId).emit('end-call');
  });
}

module.exports = videoCallHandler;
