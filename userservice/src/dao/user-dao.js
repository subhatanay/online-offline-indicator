const pool = require("./db-pool");

module.exports = function () {
    return {
        createUser:   function (user, callback) {
            console.log("Creating user");
            pool.query("INSERT INTO users (user_name,created_stamp,last_u_stamp) VALUES ($1, NOW(), NOW()) RETURNING *", [user.name], (error, result) => {
                callback(error, result);
            });
        },
    
        getUsersByUserName:   function(user_search_text, user_id, limit, callback) {
            console.log("Fetching users with search text : " + user_search_text + " and user_id : " + user_id);
            
            var sqlQuery = "SELECT * FROM users WHERE user_name LIKE  '" + user_search_text + "%'"  + (user_id!=null ? " AND user_id>$1"  : "") + " ORDER BY user_name LIMIT " + limit;
            var params = []; 
            if (user_id!==null)  {
                params.push(user_id);
            } 
             
            pool.query(sqlQuery, params, (error, result) => { 
                callback(error, result);
            });
        },

        getUserByUserId:   function(user_id, callback) {
            console.log("Fetching user by user_id  : " + user_id);
            
            var sqlQuery = "SELECT * FROM users WHERE user_id =$1";
            var params = [user_id]; 
             
            pool.query(sqlQuery, params, (error, result) => { 
                callback(error, result);
            });
        }
    } 
}()