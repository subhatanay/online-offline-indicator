

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
        }
    };

}()
