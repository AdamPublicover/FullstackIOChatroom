$(function(){
    
    //buttons and inputs
    var message = $("#message")
    var btn_send_message = $("#send_message")
    var chatroom = $("#chatroom")
    var feedback = $("#feedback")
    var newroomname = $("#newroomname")
    var btn_changeroom = $("#changeroom")

    var username = prompt("Please enter your username: ")
    var query = 'username=' + username;
    
    var socket = io.connect('http://localhost:3000', {query: query} )
    
    //Emitters
    btn_send_message.click(function(){
        var myMessage = message.val()
        socket.emit('new_msg', {message : myMessage})
        chatroom.append("<div class='alert alert-success' role='alert'> you: " + myMessage + "</div>")
        message.val('');
    })

    message.bind("keypress", () => {
        socket.emit('typing')
    })

    btn_changeroom.click(function() {
        socket.emit('change_rooms', {room:newroomname.val()})
    })



    //Listeners
    socket.on("new_message", (data) => {
        chatroom.append("<div class='alert alert-warning' role='alert'>" + data.username + ": " + data.message + "</div>")
     })

     socket.on('update_users', (data) => {
        chatroom.append("<div class='alert alert-primary' role='alert' id='user_event'> [" + data.room + "] " + data.username + " has joined. </div>")
     })

     socket.on('typing', (data) => {
        feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
     })

});