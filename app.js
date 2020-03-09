const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.static("./SocketAssignment/public"));
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/api/history', (req,res) => {
    res.download(/*need the history file here - this is the entire JSON file or 'document' from mongoose*/)
})

app.post('/api/roomhistory', (req,res) => {
    var roomname = req.param('roomname')
    res.download(/* need to history file for all where room = roomname */)
})

app.get('/api/eventlog', (req,res) => {
    res.download(/* here we need a history json file for all events where user = 'event' or w/e */)
})

//Listen on port 3000
server = app.listen(3000)

//socket.io instantiation
const io = require("socket.io")(server)

var users = {}
var rooms = ['Alpha', 'Beta', 'Charlie', 'Delta']

// Logging functions - these are to be modified for mongoose calls
function RoomLog(socket){
    console.log(socket.username + " has connected to " + socket.room)
}

function MessageLog(socket, data){
    console.log("[" + socket.room + "] " + socket.username + ": " + data.message)
}

io.on('connection', function(socket){
    // Basic joining functionality - 
    socket.username = socket.handshake.query.username
    socket.room = rooms[0]
    users[socket.username] = socket.handshake.query.username

    socket.join(rooms[0])
    
    RoomLog(socket)
    socket.emit('update_users', {username:socket.username, room:socket.room})


    // Receiving new messages
    socket.on('new_msg', (data) => {
        MessageLog(socket, data)
        socket.to(socket.room).emit("new_message", {message:data.message, username:socket.username});
    })

    // {name} is typing ...
    socket.on('typing', () => {
        socket.to(socket.room).broadcast.emit('typing', {username : socket.username})
    })

    // changing rooms ...   
    socket.on('change_rooms', (data) => {
        socket.to(socket.room).emit('update_users_l', {username: socket.username, room:socket.room})
        socket.leave(socket.room)
        socket.room = data.room
        socket.join(socket.room)
        RoomLog(socket)

        socket.emit('update_users', {username:socket.username, room:socket.room})
    })


})