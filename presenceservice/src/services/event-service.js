
const DBPOOL = require("../dao/db-pool");
const userSubscriberDao = require('../dao/user-subscriber-dao')(DBPOOL)
const eventsConst =  require('../utils/event-const')
const dotenv = require('dotenv');
dotenv.config();
const redisUserCache = require('../dao/redis-user-cache');
const kafkaProducer = require('../services/presence-db-update-producer')();


module.exports = function(userCache) {
    const redisSubscriberListener = require("../event-listeners/redis-subsciber-listener")(userCache);
    return {
        /*
            1. add the user in node
            2. update online status to redis
            3. emit a success login message back to same client user
            4. update the status of the user online back to db.
        */ 
        onLoginRequestEvent : function(socket, loginEvent) {
            console.log(`Login request  from ${loginEvent.user_id}`);
            userCache.addUserInNode(loginEvent.user_id,socket);
            redisUserCache.setUserAsActive(loginEvent.user_id);
            socket.emit(eventsConst.LOGIN_SUCCESS_EVENT, loginEvent); 
            socket.user_id = loginEvent.user_id; 
            kafkaProducer.publishMessage(loginEvent.user_id, JSON.stringify({status: 'online', user_id: loginEvent.user_id, timestamp: new Date().getTime()}));
        },

        /*  1. update online status to redis
            2. fetch user's current active subscribed users in batch mode 
            3. for each subscribed user send a presence event that current is active now 
            4. update the status of the user online back to db. 
        */
        onHeartbeatEvent : async function (socket, heartbeatEvent) { 
            const currentUserId = heartbeatEvent.user_id;
            if (userCache.isUserPresentInNode(currentUserId)) {
                console.log(`Heartbeat event from ${currentUserId}`);
                redisUserCache.setUserAsActive(currentUserId);
                var activeSubscribedUserList = await userSubscriberDao.getActiveSubscribersByUser(currentUserId,0, 100); 
                do { 
                    for (var i=0;i<activeSubscribedUserList.length;i++) {
                        var to_user = "" + activeSubscribedUserList[i].user_id;
                        if (userCache.isUserPresentInNode(to_user)) { 
                            console.log (`Emitting presence event :: ${currentUserId}  to ${to_user}`)
                            userCache.getSocketForAUser(to_user).emit(eventsConst.PRESENCE_EVENT, {from_user_id : currentUserId, timestamp: new Date().getTime()})
                        } else {
                            console.log("sending to redis pubsub");
                            //  send to redis channel for broadcast. 
                             redisSubscriberListener.publish(JSON.stringify({from_user_id: currentUserId ,  to_user_id: to_user}));
                        }
                    }
                    if (activeSubscribedUserList.length == 0) break;
                    activeSubscribedUserList = userSubscriberDao.getActiveSubscribersByUser(currentUserId,activeSubscribedUserList[activeSubscribedUserList.length-1].user_id, 100);
                } while (activeSubscribedUserList.length > 0); 
                kafkaProducer.publishMessage(currentUserId, JSON.stringify({status: 'online', user_id: currentUserId, timestamp: new Date().getTime()}));
            }
        },
        /*
            1. remove the user from  current node
            2. update the user status to db.
        */
        onDisconnectEvent: function (socket) {
            if (userCache.isUserPresentInNode(socket.user_id)) {
                console.log(`Disconnect request from ${socket.user_id}`);
                userCache.removeUserFromCache(socket.user_id);
                redisUserCache.expireUser(socket.user_id); 
                kafkaProducer.publishMessage(socket.user_id, JSON.stringify({status: 'offline', user_id: socket.user_id, timestamp: new Date().getTime()}));
            }
            
        }
    }
}