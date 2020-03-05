$(function(){
    //make connection
 var socket = io.connect('http://localhost:3000')

 //buttons and inputs
 var message = $("#message")
 var username = $("#username")
 var send_message = $("#send_message")
 var send_username = $("#send_username")
 var chatroom = $("#chatroom")
 var feedback = $("#feedback")

 //Emit message
 send_message.click(function(){
     socket.emit('new_message', {message : message.val()})
 })

 //Listen zon new_message
 socket.on("new_message", (data) => {
     feedback.html('');
     message.val('');
     console.log("Socket's value - " , data.username)
     console.log("Client's value -> ", username.val())
     newUsername = data.username;
     if (newUsername == username.val()) {
        chatroom.append("<div class='alert alert-success' role='alert'> you: " + data.message + "</div>")
     } else {
        chatroom.append("<div class='alert alert-warning' role='alert'>" + data.username + ": " + data.message + "</div>")
     }
     
 })

 //Emit a username
 send_username.click(function(){
     socket.emit('change_username', {username : username.val()})
 })

 //Emit typing
 message.bind("keypress", () => {
     socket.emit('typing')
 })

 //Listen on typing
 socket.on('typing', (data) => {
     feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
 })
});