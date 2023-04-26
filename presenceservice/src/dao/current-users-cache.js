

module.exports = function () {
    console.log("creating map")
    var userNodeSet = new Map();

    return {
        addUserInNode: function(userid,socket) {
            userNodeSet.set(userid,socket);
            console.log(userNodeSet.keys());
        },
        isUserPresentInNode: function(userid) { 
            console.log(userNodeSet.keys() , userid)
            return userNodeSet.has(userid);
        },
        getSocketForAUser: function(userid) {
            
            return userNodeSet.get(userid)
        },
        removeUserFromCache : function(userid) {
            userNodeSet.delete(userid);
        },
        getSize() {
            return userNodeSet;
        }

    }
}()