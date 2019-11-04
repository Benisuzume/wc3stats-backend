
// var server;
// var sockets = [];

const secret = require("../.secret.json");  
const io = require("socket.io-client");
var socket = null;

module.exports = class SocketController {

    static init() {
        var url = secret.socket_server.url;
        console.log("socket url: " + url);
        socket = io.connect(url);
    }

    /**
     * Broadcasts to bots are achieved by sending a message to a websocket-server
     * possible tags: broadcast, message.
     * @param {*} tag 
     * @param {*} data 
     */
    static broadcast(tag, data) {
        console.log("broadcasting: " + tag);
        socket.emit(tag, data);
    }
    
}