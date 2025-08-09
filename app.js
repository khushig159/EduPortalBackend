const express = require('express');
const cookieParser = require('cookie-parser');
const { urlencoded } = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose =require('mongoose');
const authRoutes=require('./routes/auth')
const { v4: uuidv4 } = require('uuid');
const cors= require('cors');
const userRoutes=require('./routes/user')
const path = require('path');
const http=require('http')
const {Server }=require('socket.io')
const app = express();
const server=http.createServer(app)
const chatRoutes=require('./routes/chat')
const videoCallHandler=require('./socketHandlers/videoCall')
require('dotenv').config()
const Message=require('./model/Messages')
const messageRoutes=require('./routes/message')

const port=process.env.PORT || 8000;

const fs = require('fs');

const folders = [
  'uploads',
  'uploads/CompanyLogo',
  'uploads/resumes',
  'uploads/profilePhotos'
];

folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }
});

const io=new Server(server,{
  cors:{
    origin:process.env.CLIENT_URL,
    credentials:true,
  }
})

io.on('connection',(socket)=>{
  console.log('User connected:', socket.id)

  socket.on('join',(userId)=>{
    console.log(`User ${userId} joined`);
    socket.join(userId);
  })
  socket.on("requestMentorship", ({ mentorId, menteeId }) => {
    console.log(`Mentorship request from ${menteeId} to ${mentorId}`);
    io.to(mentorId).emit("newMentorshipRequest", { mentorId, menteeId });
  });

  // 🔹 Mentor accepts
  socket.on("acceptMentorship", ({ mentorId, menteeId }) => {
    io.to(menteeId).emit("mentorshipAccepted", { mentorId });
  });

  // 🔹 Mentor rejects
  socket.on("rejectMentorship", ({ mentorId, menteeId }) => {
    io.to(menteeId).emit("mentorshipRejected", { mentorId });
  });
socket.on("menteeAcceptedMentorship", ({ mentorId, menteeId }) => {
    console.log(`Mentee ${menteeId} accepted mentorship from mentor ${mentorId}`);
    io.to(mentorId).emit("mentorshipAcceptedByMentee", { menteeId });
  });

  socket.on('sendMessage',async({senderId,receiverId,content})=>{
    const msg=new Message({senderId,receiverId,content})
    await msg.save();

    io.to(receiverId).emit('receiveMessage',msg)
  })

  socket.on('typing', ({ from, to }) => {
    io.to(to).emit('typing', { from });
  });

  socket.on('stopTyping', ({ from, to }) => {
    io.to(to).emit('stopTyping', { from });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  videoCallHandler(io, socket);
})


app.use(cors({
    origin: process.env.CLIENT_URL,
    // methods: 'GET, POST, PUT, DELETE, OPTIONS',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({limit:"16kb"}));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use('/uploads',express.static(path.join(__dirname,'uploads')));


app.use('/auth',authRoutes);
app.use('/user',userRoutes)
app.use('/messages', messageRoutes);
app.use("/api", chatRoutes);

app.use((err,req,res,next)=>{
    console.log(err);
    const status=err.statusCode||500;
    const message=err.message;
    const data=err.data;
    res.status(status).json({
        message:message,
        data:data,
    })
})

mongoose.connect(process.env.MONGO_URI)
.then(result=>{
    console.log("Connected to MongoDB");
    server.listen(port, () => {
        console.log("Server is running on port 8000");
    });
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
});