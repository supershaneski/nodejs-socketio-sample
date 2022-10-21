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

let listOfUsers = []
let listOfRooms = []

//let users = []
//let rooms = []

app.use('/', express.static(path.join(__dirname, 'root')))

io.on('connection', (socket) => {

    //let id = socket.id
    //let roomid = ""

    let userId = socket.id
    let userName = ""
    let roomId = ""
    
    console.log('[server] User connected', socket.id)

    //users.push(id)

    listOfUsers.push({ id: userId, name: "", room: "" })

    /*socket.on('subscribeToTimer', (interval) => {

        console.log('user subscribing to timer')

        setInterval(() => {

            socket.emit('timer', (new Date()).toLocaleTimeString())

        }, interval)

    })*/


    socket.on('disconnect', () => {

        console.log('[server] User disconnected', userId)

        listOfRooms = listOfRooms.map(room => {
            
            let members = room.members
            
            if(room.id === roomId) {
                
                members = members.filter(item => item !== userId)

                roomId = ""
                roomName = ""

            }

            return {
                ...room,
                members,
            }
        })

        listOfRooms = listOfRooms.filter(room => room.members.length > 0)
        listOfUsers = listOfUsers.filter(user => user.id !== userId)

    })


    socket.on('room-login', (name) => {
        
        userName = name

        listOfUsers = listOfUsers.map(item => {
            return {
                ...item,
                name: item.id === userId ? name : item.name,
            }
        })

        socket.emit('room-login', {id: userId, name: userName })

    })

    socket.on('room-list', () => {

        socket.emit('room-list', listOfRooms)

    })

    socket.on('room-create', (name) => {

        let rid = getSimpleId()

        listOfRooms.push({ id: rid, name: name, members: [userId] })

        roomId = rid

        socket.emit('room-create', { id: rid, name: name })

    })

    socket.on('room-message', (msg) => {

        let room = listOfRooms.find(item => item.id === roomId)

        room.members.forEach(member => {
            io.to(member).emit('room-message', { name: userName, text: msg })
        })

    })

    socket.on('room-join', (rid) => {
        
        listOfRooms = listOfRooms.map(room => {
            let members = room.members
            if(room.id === rid) {
                members.push(userId)

                roomId = rid
                roomName = room.name

                socket.emit('room-join', { id: rid, name: room.name })

            }
            return {
                ...room,
                members,
            }
        })

        let room = listOfRooms.find(item => item.id === roomId)

        room.members.filter(member => member !== userId).forEach(member => {

            io.to(member).emit('room-message', { name: "SYS-MSG", text: userName + " joined" })

        })

    })
    
    socket.on('room-leave', () => {

        let rid = roomId

        listOfRooms = listOfRooms.map(room => {
            let members = room.members
            if(room.id === roomId) {
                
                members = members.filter(item => item !== userId)

                roomId = ""
                roomName = ""

                socket.emit('room-leave', "OK")

            }
            return {
                ...room,
                members: members || [],
            }
        })

        listOfRooms = listOfRooms.filter(room => room.members.length > 0)

        let room = listOfRooms.find(item => item.id === rid)

        if(room) {
            room.members.forEach(member => {

                io.to(member).emit('room-message', { name: "SYS-MSG", text: userName + " left" })
    
            })
        }
        

    })
    
})

server.listen(4000, () => {
    console.log("[socket.io] Chat Server v1.0.0")
    console.log("Now listening on *:4000")
})