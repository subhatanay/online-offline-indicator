module.exports = (function (DBPOOL) {
  return { 
    updateUser: function (user_id, status, callback) {
      console.log('Updating user status to ' + (status == 0 ? 'offline' : 'online'));
      var sqlQuery =
        "UPDATE users SET presence_status=$2, last_seen=NOW() , last_u_stamp=NOW() WHERE user_id=$1";
        
        DBPOOL.getInstance().query(sqlQuery, [user_id,status], (error, result) => {
           
        callback && callback(error, result);
      });
    }
    
  };
});
