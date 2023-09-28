const http = require('http');

const express = require('express');
const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io');
const io = new Server(server)
const path = require('path');
const dotEnv = require('dotenv');

app.use(express.static(path.join(__dirname , "public")))

dotEnv.config({ path : "./configs/config.env" })

const PORT = process.env.PORT || 3000

server.listen(PORT , () => console.log(`Server is running on port ${PORT}`))

//websocket setup

const users = {}

const chatNamespace = io.of("/chat")

//Listens to "connection" event 
chatNamespace.on("connection" , socket => {
    console.log(`User connected : ${socket.id}`);

    //Listens to "disconnect" event
    socket.on("disconnect" , () => {
        delete users[socket.id] //deletes an object property by its key
        chatNamespace.emit("online-users" , users)
    })

    //listens to login event sent by client
    socket.on("login" , data => {
        socket.join(data.chatRoom)
        users[socket.id] = {username : data.username , chatRoom : data.chatRoom}

        //Emits users object to chat-room
        chatNamespace.to(data.chatRoom).emit("online-users" , users);
    })


    //Listens to "chat-message" event sent by client
    socket.on("chat-message" , data => {
        //Server emits data to all users
        chatNamespace.to(data.chatRoom).emit("chat-message" , data)
    })

    //Listens to "typing" event sent by client
    socket.on("typing" , data => {

        //server emits data to all users except for sender
        socket.broadcast.in(data.chatRoom).emit("typing" , data)

    })

    //Listens to "pvChat" event sent by client
    socket.on("pvChat" , data => chatNamespace.to(data.receiverId).emit("pvChat" , data))

})