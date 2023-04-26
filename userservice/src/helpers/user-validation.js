

module.exports = function() {
    return {
        validateUserObject: function validateUserObject(user) {
            if (!user) {
              return "Please provide a user request body";
            }
            if (!user.name || user.name == "") {
              return "User name should not be empty or null";
            }
            return "";
        },
        validateUserSubscriberObject : function (userSubscriber) {
          if (!userSubscriber) {
            return "Please provide a userSubscriber request body";
          }
          if (!userSubscriber.user_id || userSubscriber.user_id <0) {
            return "Mapping user's subscriber id should be null or less than 0";
          }
          return "";
        }
    };

}()
