// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);


// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Socket-server listening at http://' + host + ':' + port);
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', function (socket) {
  
    console.log("We have a new client: " + socket.id);

    socket.on('scoreboard', function(data) {
        // emit to all including sender
        io.emit('scoreboard', data);
      }
    );
    
    socket.on('message', function(data) {
        // emit to all including sender
        io.emit('message', data);
      }
    );

    socket.on('disconnect', function() {
      console.log("Client " + socket.id + " has disconnected");
    });
  }
);