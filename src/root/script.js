var textName = document.getElementById("text-name")
var textRoom = document.getElementById("text-room")
var textMessage = document.getElementById("text-msg")

var socket = io()

let roomId = ""

const RoomKeys = {
    LIST: 'room-list',
    CREATE: 'room-create',
    JOIN: 'room-join',
    LEAVE: 'room-leave',
    MESSAGE: 'room-message'
}

window.onload = function() {
    
    console.log("onload")

    socket.on(RoomKeys.LIST, function(list) {
        console.log(RoomKeys.LIST, list)
    })

    socket.on(RoomKeys.CREATE, function(rid) {
        console.log(RoomKeys.CREATE, rid)
        roomId = rid
        textRoom.value = rid
    })

    socket.on(RoomKeys.JOIN, function(rid) {
        console.log(RoomKeys.JOIN, rid)
        roomId = rid
        textRoom.value = rid
    })

    socket.on(RoomKeys.LEAVE, function(rid) {
        console.log(RoomKeys.LEAVE, rid)
        roomId = ""
        textRoom.value = ""
    })

    socket.on(RoomKeys.MESSAGE, function(msg) {
        console.log(RoomKeys.MESSAGE, msg)
    })

}

function handleCreate() {
    if(roomId.length > 0) return
    if(textName.value.length === 0) return
    socket.emit(RoomKeys.CREATE, textName.value)
}

function handleList() {
    socket.emit(RoomKeys.LIST)
}

function handleJoin() {
    if(roomId.length > 0) return
    if(textRoom.value.length === 0) return
    socket.emit(RoomKeys.JOIN, textRoom.value)
}

function handleSend() {
    if(roomId.length === 0) return
    if(textMessage.value.length === 0) return
    socket.emit(RoomKeys.MESSAGE, textMessage.value)
}

function handleLeave() {
    if(roomId.length === 0) return
    socket.emit(RoomKeys.LEAVE)
}