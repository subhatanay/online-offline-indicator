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

    getUserSubscribers: function (user_id, limit, callback) {
      console.log(`Fetching user subscribers for ${user_id}`);
      var sqlQuery =
        "SELECT sub.* FROM user_subscribers usub INNER JOIN users sub on usub.user_id_to=sub.user_id WHERE usub.user_id = $1 ORDER BY sub.user_id LIMIT $2";
        
      pool.query(sqlQuery, [user_id, limit], (error, result) => {
        callback(error, result);
      });
    },
  };
})();
