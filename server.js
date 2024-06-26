const express = require('express');
const socketIo = require('socket.io');
const { createServer } = require('http');
const app = express();
const server = createServer(app)
const { Server } = require("socket.io");
const io = socketIo(server)
const { v4: uuidV4 } = require('uuid')
//import libs
const PORT = process.env.PORT || 5000;
var ExpressPeerServer = require("peer").ExpressPeerServer;    
var options = {
  debug: true,
  allow_discovery: true,
};
let peerServer = ExpressPeerServer(server, options);
app.use("/peerjs", peerServer);
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.get('/', (req,res)=>{
    res.redirect(`/${uuidV4()}`)
})
app.get('/:room',(req, res)=>{
    res.render('index', {room: req.params.room})
})
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('chat message', (msg) => {
        // console.log('message: ' + msg);
        io.emit('chat message', msg);
    });
    socket.on('join-room',(roomId, userId)=>{
        console.log('room: ',roomId, 'user: ',userId)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        socket.on('disconnect',()=>{
            io.emit('disconnected','client disconnect')
            socket.to(roomId).emit('user-disconnected', userId);
        })
    })
    
});
server.listen(PORT,()=>{
    console.log(`socket is running on port ${PORT}`)
})
// concurrently \"node server.js\" \"peerjs --port 3001\"