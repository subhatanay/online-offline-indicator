const eventsConst = require("../utils/event-const")
module.exports = function (io, currentUserCache) {
    const eventService = require('../services/event-service')(currentUserCache); 
    io.on('connection', (socket) => { 
        
        socket.on(eventsConst.LOGIN_EVENT, event => {
            eventService.onLoginRequestEvent(socket, event);
        });

        socket.on(eventsConst.HEARTBEAT_REQUEST_EVENT, event => {
            eventService.onHeartbeatEvent(socket, event);
        });

        socket.on(eventsConst.DISCONNECT_EVENT, event => {
            eventService.onDisconnectEvent(socket, event);
        });
    
    });
}

