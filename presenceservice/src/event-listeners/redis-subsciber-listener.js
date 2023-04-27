const eventsConst =  require('../utils/event-const')
const dotenv = require('dotenv');
dotenv.config();
const redis = require("redis");
const subscriber = redis.createClient({url: process.env.REDIS_URL});

module.exports = function(userCache) {
    subscriber.on("message", function (channel, message) {
        var presenceEvent = JSON.parse(message);

        if (userCache.isUserPresentInNode(presenceEvent.to_user_id)) {
            console.log(`Got a Presence event from redis. Sending presence event to ${presenceEvent.to_user_id}`);
            userCache.isUserPresentInNode(presenceEvent.to_user_id) && userCache.getSocketForAUser(presenceEvent.to_user_id).emit( {from_user_id : presenceEvent.from_user_id, timestamp: new Date().getTime()})
        }

    });

    subscriber.subscribe(eventsConst.REDIS_PRESENCE_CHANNEL);

}