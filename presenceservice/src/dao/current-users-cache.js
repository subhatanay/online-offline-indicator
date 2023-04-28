

module.exports = function () { 
    var userNodeSet = new Map();

    return {
        addUserInNode: function(userid,socket) {
            userNodeSet.set(userid,socket); 
        },
        isUserPresentInNode: function(userid) {  
            return userNodeSet.has(userid);
        },
        getSocketForAUser: function(userid) { 
            return userNodeSet.get(userid)
        },
        removeUserFromCache : function(userid) {
            userNodeSet.delete(userid);
        },
        getSize() {
            return userNodeSet.size();
        }

    }
}()