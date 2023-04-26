const userdao = require("../dao/user-dao");
const uservalidation = require("../helpers/user-validation");

module.exports = (function () {
  return {
    createUser: function createUser(request, response) {
      var error = uservalidation.validateUserObject(request.body);
      if (error != "") {
        response.status(400).json({
          errorMsg: error,
        });
        return;
      }
      var userObj = {
        name: request.body.name,
      };
      userdao.createUser(userObj, function (err, result) {
        if (err) {
          response.status(500).json({
            errorMsg: err,
          });
          console.log("Fail to create user. Reason : ", err);
          return;
        }
        response.status(201).json({
          user_id: result.rows[0].user_id,
        });
        console.log(`User created successfully with id ::  ${result.rows[0].user_id}`)
      });
    },
    getUsers: function getUsers(request, response) {
      var user_search_text = request.query.user_search_text || "";
      var user_id = request.query.user_id || null;
      var limit = request.query.limit || 10;
      if (!user_search_text || user_search_text == "" || user_search_text.length<3) {
        response.status(400).json({
          errorMsg: "Provide atleast 3 letter prefix of username",
        });
        return;
      }

      userdao.getUsersByUserName(
        user_search_text,
        user_id,
        limit,
        function (err, result) {
          if (err) {
            console.log(err)
            response.status(500).json({
              errorMsg: err.error,
            });
            console.log("Fail to fetch  users. Reason : ", err);
            return;
          }
          response.status(200).json({
            users: result.rows,
          }); 
        }
      );
    },
    getUserById: function (request, response) {
        const user_id = parseInt(request.params.user_id);
        
        userdao.getUserByUserId(
            user_id, 
          function (err, result) {
            if (err) {
              console.log(err)
              response.status(500).json({
                errorMsg: err.error,
              });
              console.log("Fail to fetch  users. Reason : ", err);
              return;
            }
            if (result.rows && result.rows.length>0) {
                response.status(200).json({
                    user: result.rows[0],
                  }); 
            } else {
                response.status(400); 
            }
            
          }
        );
      },
    
  };
})();
