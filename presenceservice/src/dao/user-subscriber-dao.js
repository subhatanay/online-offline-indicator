

module.exports = (function (DBPOOL) {
  return { 
    getActiveSubscribersByUser: async function (user_id, starting_offset, limit) {
      console.log(`Fetching users list from who subscibered to user ${user_id}`);
      var sqlQuery =
        "SELECT sub.user_id FROM user_subscribers usub INNER JOIN users sub on usub.user_id=sub.user_id AND sub.presence_status=1 WHERE usub.user_id_to = $1  and sub.user_id > $2 ORDER BY sub.user_id LIMIT $3";
      try {
        let result = await DBPOOL.getInstance().query(sqlQuery, [user_id,starting_offset, limit]); 
        
        return result.rows;
      } catch (ex) {
        console.log(ex);
        return null;
      } 
    }
  };
});
