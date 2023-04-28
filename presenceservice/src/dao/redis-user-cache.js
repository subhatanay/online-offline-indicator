const redis = require("redis");
const dotenv = require('dotenv');
dotenv.config();
const redisClient = redis.createClient({url: process.env.REDIS_URL}); 
redisClient.connect();

module.exports = function() {

    const activeUserPrefix = "activeUser:";
    const activeUserExpiryInSecs = 10;
    const onlineUserStatus = "online";

    return {
        setUserAsActive: function(userId) {
            redisClient.setEx(`${activeUserPrefix}:${userId}`,activeUserExpiryInSecs,onlineUserStatus); 
        }, 

        isUserExists: async function(userId) {
           return await redisClient.exists(`${activeUserPrefix}:${userId}`); 
        },
        expireUser: function(userId) {
            redisClient.del([`${activeUserPrefix}:${userId}`]);
        }
    } 
}()