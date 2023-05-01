const cors = require('cors');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const userCache = require('./dao/current-users-cache');
const presenceEventListener = require('./event-listeners/presence-event-listener')(io, userCache); 
const redisSubscriberListener = require("./event-listeners/redis-subsciber-listener")(userCache);

const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*'
}));

// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/chat-app.html');
//   });
//   app.get('/main.js', (req, res) => {
//     res.sendFile(__dirname + '/main.js');
//   });

http.listen(port, () => {
    console.log(`Presence Service  running at http://localhost:${port}/`);
  });
