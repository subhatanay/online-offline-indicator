const eventsConst =  require('../utils/event-const')
const dotenv = require('dotenv');
dotenv.config();
const redis = require("redis");
const publisher = redis.createClient({url: process.env.REDIS_URL});
const subscriber = publisher.duplicate(); 


module.exports =  function(userCache) { 
    async function initializeRedisConnection() {
        await publisher.connect();
        await subscriber.connect();
        console.log("Successfully connected to redis as pub-sub client")
        await subscriber.on("message",  function (channel, message) {
            var presenceEvent = JSON.parse(message);

            if (userCache.isUserPresentInNode(presenceEvent.to_user_id)) {
                console.log(`Got a Presence event from redis. Sending presence event to ${presenceEvent.to_user_id}`);
                userCache.isUserPresentInNode(presenceEvent.to_user_id) && userCache.getSocketForAUser(presenceEvent.to_user_id).emit( {from_user_id : presenceEvent.from_user_id, timestamp: new Date().getTime()})
            }

        });

        await subscriber.subscribe(eventsConst.REDIS_PRESENCE_CHANNEL,function (message, channel) {
            console.log(message,channel);
            var presenceEvent = JSON.parse(message);

            if (userCache.isUserPresentInNode(presenceEvent.to_user_id)) {
                console.log(`Got a Presence event from redis. Sending presence event to ${presenceEvent.to_user_id}`);
                userCache.getSocketForAUser(presenceEvent.to_user_id).emit(eventsConst.PRESENCE_EVENT, {from_user_id : presenceEvent.from_user_id, timestamp: new Date().getTime()})
            }

        });
    }

    initializeRedisConnection().catch(console.error); 

    return {
        publish : function ( data) {
            publisher.publish(eventsConst.REDIS_PRESENCE_CHANNEL, data,function() {});
        }
    }

}