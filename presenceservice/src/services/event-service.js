
const DBPOOL = require("../dao/db-pool");
const userActionDao = require('../dao/user-action-dao')(DBPOOL)
const userSubscriberDao = require('../dao/user-subscriber-dao')(DBPOOL)
const eventsConst =  require('../utils/event-const')

module.exports = function(userCache) {
    return {
        /*
            1. add the user in node
            2. emit a success login message back to same client user
            3. update the status of the user online back to db.
        */ 
        onLoginRequestEvent : function(socket, loginEvent) {
            console.log(`Login request  from ${loginEvent.user_id}`);
            userCache.addUserInNode(loginEvent.user_id,socket);
            socket.emit(eventsConst.LOGIN_SUCCESS_EVENT, loginEvent);
            userActionDao.updateUser(loginEvent.user_id, 1, null);
            socket.user_id = loginEvent.user_id;
            
        },

        /*
            1. fetch user's current active subscribed users in batch mode 
            2. for each subscribed user send a presence event that current is active now 
            3. update the status of the user online back to db. 
        */
        onHeartbeatEvent : async function (socket, heartbeatEvent) {
            
            const currentUserId = heartbeatEvent.user_id;
            if (userCache.isUserPresentInNode(currentUserId)) {
                console.log(`Heartbeat event from ${currentUserId}`);
                var activeSubscribedUserList = await userSubscriberDao.getActiveSubscribersByUser(currentUserId,0, 100); 
                do { 
                    for (var i=0;i<activeSubscribedUserList.length;i++) {
                        var to_user = "" + activeSubscribedUserList[i].user_id;
                        if (userCache.isUserPresentInNode(to_user)) { 
                            console.log ("emmitting presence event :: " +to_user)
                            userCache.getSocketForAUser(to_user).emit(eventsConst.PRESENCE_EVENT, {from_user_id : currentUserId, timestamp: new Date().getTime()})
                        } else {
                            // TODO send to redis channel for broadcast.
                        }
                    }
                    if (activeSubscribedUserList.length == 0) break;
                    activeSubscribedUserList = userSubscriberDao.getActiveSubscribersByUser(currentUserId,activeSubscribedUserList[activeSubscribedUserList.length-1].user_id, 100);
                } while (activeSubscribedUserList.length > 0);
                userActionDao.updateUser(currentUserId, 1, null);
            }
        },
        /*
            1. remove the user from  current node
            2. update the user status to db.
        */
        onDisconnectEvent: function (socket) {
            if (userCache.isUserPresentInNode(socket.user_id)) {
                userCache.removeUserFromCache(socket.user_id);
                userActionDao.updateUser(socket.user_id, 0, null);
            }
            
        }
    }
}