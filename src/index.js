const express = require('express')
const app = express()
const path =require('path')
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server)

const getSimpleId = () => {
    return Math.random().toString(26).slice(2);
}

let users = []
let rooms = []

app.get('/socket.io.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/root/socket.io.js'))
})

app.get('/socket.io.js.map', (req, res) => {
    res.sendFile(path.join(__dirname + '/root/socket.io.js.map'))
})

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/root/script.js'))
})

app.get('/test.html', (req, res) => {
    res.sendFile(path.join(__dirname + '/root/test.html'))
})

app.get('/', (req, res) => {

    //console.log(req)

    //console.log("dirname", __dirname)
    //res.send('<span>Hello, world!</span>')
    res.sendFile(path.join(__dirname + '/root/index.html'))
})

io.on('connection', (socket) => {

    let id = socket.id //getSimpleId()
    let roomid = ""
    
    console.log('a user connected', id, socket.id)

    //socket.broadcast.emit('hi)

    //io.sockets.socket(socket_id).emit(msg)

    users.push(id)

    socket.on('subscribeToTimer', (interval) => {

        console.log('user subscribing to timer')

        setInterval(() => {

            socket.emit('timer', (new Date()).toLocaleTimeString())

        }, interval)

    })

    /////// BEGIN ROOM ///////
    socket.on('room-list', () => {
        socket.emit('room-list', rooms)
    })
    socket.on('room-create', (name) => {
        let rid = getSimpleId()
        rooms.push({ id: rid, name: name, members: [id] })
        roomid = rid
        socket.emit('room-create', rid)
    })
    socket.on('room-join', (rid) => {
        rooms = rooms.map(room => {
            let members = room.members
            if(room.id === rid) {
                members.push(id)
            }
            return {
                ...room,
                members,
            }
        })

        roomid = rid
        
        let room = rooms.find(room => room.id === roomid)
        room.members.forEach(member => {
            //io.sockets.socket(member).emit('room-join', id + " joined")
            io.to(member).emit('room-join', id + " joined")
        })
    })
    socket.on('room-leave', () => {
        rooms = rooms.map(room => {
            let members = room.members
            if(room.id === roomid) {
                members = members.filter(item => item !== id)
            }
            return {
                ...room,
                members: members,
            }
        })
        rooms = rooms.filter(room => room.members.length > 0)
        socket.emit("room-leave", roomid)
        roomid = ""
    })
    socket.on('room-message', (msg) => {
        let room = rooms.find(room => room.id === roomid)
        room.members.forEach(member => {
            //io.sockets.socket(member).emit('room-message', msg)
            io.to(member).emit('room-message', msg)
        })
    })
    /////// END ROOM ///////

    socket.on('chat message', (msg) => {

        console.log("send", id, users)

        io.emit('chat message', msg)
        //console.log('message: ' + msg)
    })

    socket.on('disconnect', () => {

        users = users.filter(item => item === id)

        console.log("users", users)

        console.log("user diconnected")

    })

})

server.listen(4000, () => {
    console.log("Now listening on *:4000")
})