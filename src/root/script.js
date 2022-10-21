var socket = io()

const RoomKeys = {
    LOGIN: 'room-login',
    LIST: 'room-list',
    CREATE: 'room-create',
    JOIN: 'room-join',
    LEAVE: 'room-leave',
    MESSAGE: 'room-message'
}

var App = {
    userId: "",
    userName: "",
    roomId: "",
    roomName: "",
}

var timer

window.onload = function() {
    
    socket.on(RoomKeys.LOGIN, function(resp) {
        
        const { id, name } = resp

        App.userId = id
        App.userName = name

        const panel_genkan = document.getElementById("panel-genkan")
        const panel_lobby = document.getElementById("panel-lobby")

        panel_genkan.style.display = "none"
        panel_lobby.style.display = "block"

        timer = setInterval(function(){
            socket.emit(RoomKeys.LIST)
        }, 10000)

    })

    socket.on(RoomKeys.LIST, function(list) {

        let html = ""
        
        list.forEach(item => {
            html+='<li class="room-item">'
            html+='<span class="room-title">'+item.name+'</span>'
            html+='<button onclick="handleJoin(\''+item.id+'\')">Join</button>'
            html+='</li>'
        })

        document.getElementById("list-room").innerHTML = html

    })

    socket.on(RoomKeys.CREATE, function(resp) {
        
        const { id, name } = resp

        App.roomId = id
        App.roomName = name

        document.getElementById("room-header-title").innerHTML = name

        const panel_lobby = document.getElementById("panel-lobby")
        const panel_message = document.getElementById("panel-message")
        
        panel_lobby.style.display = "none"
        panel_message.style.display = "block"

        clearInterval(timer)

        socket.emit(RoomKeys.LIST)

    })


    socket.on(RoomKeys.MESSAGE, function(msg) {

        console.log("received...", msg)
        
        const { name, text } = msg

        let li = document.createElement('li')
        li.className = "message-item"
        let html = '<p class="message">'
        if(name.indexOf("SYS-MSG")<0) html += '<span class="message-sender"><strong>'+name+'</strong></span>'
        html += '<span class="message-text">'+text+'</span>'
        html += '</p>'
        li.innerHTML = html

        let list = document.getElementById("list-message")
        list.appendChild(li)
        list.scrollTop = list.scrollHeight
        
    })

    socket.on(RoomKeys.JOIN, function(resp) {
        
        const { id, name } = resp

        App.roomId = id
        App.roomName = name

        document.getElementById("room-header-title").innerHTML = name

        const panel_lobby = document.getElementById("panel-lobby")
        const panel_message = document.getElementById("panel-message")
        
        panel_lobby.style.display = "none"
        panel_message.style.display = "block"

        clearInterval(timer)

    })

    socket.on(RoomKeys.LEAVE, function(msg) {

        document.getElementById("list-message").innerHTML = ""

        App.roomId = ""
        App.roomName = ""

        const panel_lobby = document.getElementById("panel-lobby")
        const panel_message = document.getElementById("panel-message")
        
        panel_lobby.style.display = "block"
        panel_message.style.display = "none"

        timer = setInterval(function(){
            socket.emit(RoomKeys.LIST)
        }, 10000)

    })

}

// Login
function handleEnter() {
    
    const name = document.getElementById("text-name").value

    if(name.length < 3) {
        console.log("Invalid user name")
        return
    }

    socket.emit(RoomKeys.LOGIN, name)

}

function handleCreate() {

    const name = document.getElementById("text-room").value

    if(name.length < 0) {
        console.log("Invalid room name")
        return
    }

    socket.emit(RoomKeys.CREATE, name)

    document.getElementById("text-room").value = ""

}

function handleSend() {

    const message = document.getElementById("text-message").value

    console.log("send...", message)

    if(message.length < 0) {
        return
    }
    
    socket.emit(RoomKeys.MESSAGE, message)

    document.getElementById("text-message").value = ""

}

function handleJoin(rid) {
    //if(roomId.length > 0) return
    //if(textRoom.value.length === 0) return
    //socket.emit(RoomKeys.JOIN, textRoom.value)

    if(!rid) return

    socket.emit(RoomKeys.JOIN, rid)

}

function handleLeave() {
    socket.emit(RoomKeys.LEAVE)
}
