var server;
var sockets = [];

module.exports = class SocketController {

    

    static init(serv) {
        server = serv;
        var io = require('socket.io')(server);
        // Register a callback function to run when we have an individual connection
        // This is run for each individual user that connects
        io.sockets.on('connection', function (socket) {
            
            // register client socket 
            sockets.push(socket);
            console.log("We have a new client: " + socket.id + ". Connected clients = " + sockets.length);
        
            // We update the scoreboard of the connecting client 
            socket.emit('scoreboard', "Scoreboard update!");

            socket.on('disconnect', function() {
                // unregister client socket 
                for (var i = sockets.length - 1; i >= 0; i--) {
                    if (sockets[i].id == socket.id) {
                        sockets.splice(i, 1);
                        break;
                    }
                }
                console.log("Client has disconnected: " + socket.id + ". Connected clients = " + sockets.length);
            });
        });
    }

    static broadcast(tag, data) {
        for (var i = sockets.length - 1; i >= 0; i--) {
            sockets[i].emit(tag, data)
        }
    }
}