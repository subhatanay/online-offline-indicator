const pool = require("./db-pool");

module.exports = (function () {
  return {
    createUserSubscriber: function (from_userid, to_userid, callback) {
      console.log(`Adding user ${from_userid} to ${to_userid}`);
      pool.query(
        "INSERT INTO user_subscribers  VALUES ($1, $2)",
        [from_userid, to_userid],
        (error, result) => {
          callback(error, result);
        }
      );
    },

    getUserSubscribers: function (user_id, limit, start_offset, callback) {
      console.log(`Fetching user subscribers for ${user_id}`);
      var sqlQuery =
        "SELECT sub.* FROM user_subscribers usub INNER JOIN users sub on usub.user_id_to=sub.user_id WHERE usub.user_id = $1 AND  sub.user_id > $2  ORDER BY sub.user_id LIMIT $3";
        
      pool.query(sqlQuery, [user_id, limit,start_offset], (error, result) => {
        callback(error, result);
      });
    },
  };
})();
