const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const userCache = require('./dao/current-users-cache');
const presenceEventListener = require('./event-listeners/presence-event-listener')(io, userCache); 

const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

http.listen(port, () => {
    console.log(`Presence Service  running at http://localhost:${port}/`);
  });
