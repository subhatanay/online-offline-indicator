const userSubscriberDao = require("../dao/user-subscriber-dao");
const uservalidation = require("../helpers/user-validation"); 
module.exports = (function (redisUserCache) {
  return {
    createUserSubscriber: function createUser(request, response) {
      var error = uservalidation.validateUserSubscriberObject(request.body);
      if (error != "") {
        response.status(400).json({
          errorMsg: error,
        });
        return;
      }
      var from_user_id= request.params.user_id;
      var to_user_id = request.body.user_id
      
      if (from_user_id == to_user_id) {
        response.status(400).json({
          errorMsg: "User can't subscribe to itself",
        });
        return;
      }
       
      userSubscriberDao.createUserSubscriber(from_user_id,to_user_id, function (err, result) {
        if (err) {
          response.status(500).json({
            errorMsg: err,
          });
          console.log("Fail to map user to its subscriber. Reason : ", err);
          return;
        }
        response.status(201).send('');
        console.log(`User ${from_user_id} successfully subscribed to ${to_user_id}`)
      });
    },
    getUserSubscribers: function (request, response) {
      var user_id = parseInt(request.params.user_id);  
      var limit = parseInt(request.query.limit) || 10;  

      userSubscriberDao.getUserSubscribers(
        user_id, 
        limit,
         async function (err, result) {
          if (err) {
            console.log(err)
            response.status(500).json({
              errorMsg: err.error,
            });
            console.log("Fail to fetch  users. Reason : ", err);
            return;
          }
          for (var i=0;i<result.rows.length;i++) {
            var status =  await redisUserCache.getUserStatus(result.rows[i]["user_id"]);
            result.rows[i]["presence_status"] = status || 'offline'; 
          }

          response.status(200).json({
            count: result.rowCount,
            users: result.rows,
          }); 
        }
      );
    }
  };
});
