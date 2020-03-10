const express = require('express')
const app = express()

var mongoose = require('mongoose')
var User = require('./models/Users.js')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.static("./SocketAssignment/public"));
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/api/history', (req,res) => {
    var username = req.param('username')
    res.download(User.find({name: username}))
})

app.post('/api/roomhistory', (req,res) => {
    var username = req.param('username')
    var roomname = req.param('roomname')
    res.download(User.find({name: username, room: roomname}))
})

app.get('/api/eventlog', (req,res) => {
    res.download(User.find({name: 'server', room: 'event'}))
})

// server conn here vv
var mongoDB = 'mongodb+srv://admin:admin@cluster0-tcdzv.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true })

var db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB Connection Error:'))

//Listen on port 3000
server = app.listen(3000)

//socket.io instantiation
const io = require("socket.io")(server)

var users = {}
var rooms = ['Alpha', 'Beta', 'Charlie', 'Delta']

// Logging functions - these are to be modified for mongoose calls
function RoomLog(socket){
    console.log(socket.username + " has connected to " + socket.room)    

    // db persistance
    User.create({name: 'server', room: 'event', message: socket.username + " has connected to " + socket.room}, function (err, newUser){
        if (err) console.log(err)
    })

    // Q4. uncomment to actually display!
    // userHistory(socket)

    // Q5. uncomment to actually display!
    // userHistoryRoomName(socket)

    // Q6. uncomment to actually display!
    // allEventLogs(socket)
}

function MessageLog(socket, data){
    console.log("[" + socket.room + "] " + socket.username + ": " + data.message)

    // db persistance
    User.create({name: socket.username, room: socket.room, message: data.message}, function (err, newUser){
        if (err) console.log(err)
    })
}

// Q4. query to retrieve all user history
async function userHistory(socket){
    var history = await User.find({name: socket.username})
    console.log(history)
}

// Q5. query to retrieve all user history by room name
async function userHistoryRoomName(socket){
    var history = await User.find({name: socket.username, room: socket.room})
    console.log(history)
}

// Q6. query to retrieve all event logs
async function allEventLogs(socket){
    var logs = await User.find({name: 'server', room: 'event'})
    console.log(logs)
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