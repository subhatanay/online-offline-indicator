document.addEventListener('DOMContentLoaded',function () {
    userSearch();
    $("#user_subscribers").html('');
    user_subscribers_list = {};
    if (localStorage.getItem('loginUserId')) {
       // initializeLoginSuccess();
    }
});

var url = "http://localhost:80/userservice"
var user_subscribers_list = {};
function signUp() {
    var name = document.getElementById("username");

    var obj = {
        name: name.value
    }
    $.ajax({
        type: "POST",
        url: url + "/users",
        data: JSON.stringify(obj),
        dataType: 'json', 
       contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status, jqXHR) {  
            $("#signUpMessage").html("<b>User created successfull. User : @user" + data.user_id +"</b>");
        }, 
        error: function (jqXHR, status) { 
            $("#signUpMessage").text("User not created successfull");
        }
      });
}

function login() {
    var user = document.getElementById("userid").value;
    var userid = user.replace("@user","");

    
    $.ajax({
        type: "GET",
        url: url + "/users/" + userid, 
        dataType: 'json', 
       contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status, jqXHR) { 
            localStorage.setItem("loginUserId", data["user"].user_id);
            localStorage.setItem("loginUser", JSON.stringify(data["user"]));
            $("#loginMessage").html("<b>User login successfull. User name : " + data["user"].user_name +"</b>");
            initializeLoginSuccess(data["user"].user_id);
        }, 
        error: function (jqXHR, status) { 
            $("#loginMessage").text("User not created successfull");
        }
      });
}

function initializeLoginSuccess() { 
    $("#app").show();
    $("#signUpTab").hide();
    $("#loginTab").hide();

    $("#aBar").show();
    $("#sBar").hide();
    $("#lBar").hide();
    $("#user_subscribers").html('');
    user_subscribers_list = [];
    var user = JSON.parse(localStorage.getItem("loginUser"))
    $("#currentUserName").text(user.user_name + " - " + user.presence_status);
    $("#currentUserChip .mdl-chip__contact").text(user.user_name.substring(0,1));
    getUserSubscribers(localStorage.getItem('loginUserId'),null);

    initializeWebsocket();
    loginEvent(localStorage.getItem('loginUserId'));
}

function addUserSubscriber(from_user, to_user) {
    var obj = {
        user_id: to_user
    }

    $.ajax({
        type: "POST",
        url: url + "/users/" + from_user + "/subscribers",
        data: JSON.stringify(obj),
        dataType: 'json', 
       contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status, jqXHR) { 
            $("#user_subscribers").html('');
            user_subscribers_list = {};
            getUserSubscribers(localStorage.getItem('loginUserId'),null);
        }, 
        error: function (jqXHR, status) {  
        }
      });
}

function getUserSubscribers(from_user, next_user_id) {
    $.ajax({
        type: "GET",
        url: url + "/users/" + from_user + "/subscribers" + (next_user_id ? "?start_user_offset=" + next_user_id : ""), 
        dataType: 'json', 
       contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status, jqXHR) { 
             var template = `<div class="mdl-list__item mdl-list__item--two-line" id={{user_star_id}}>
             <span class="mdl-list__item-primary-content">
               <i class="material-icons mdl-list__item-avatar">person</i>
               <span>{{name}}</span>
               <span class="mdl-list__item-sub-title">{{user_status}}</span>
             </span>
             <a class="mdl-list__item-secondary-action" href="#"><i class="material-icons" >{{star}}</i></a>
           </div>`

           for (var i=0;i<data.count;i++) {
            var user_template = template.replace("{{name}}", data.users[i].user_name);
            user_template = user_template.replace("{{star}}", data.users[i].presence_status == "online" ? "star" : "star_border");
            user_template = user_template.replace("{{user_status}}", data.users[i].presence_status == "online" ? "Online" : "Offline - Last seen " + data.users[i].last_seen );
            user_template = user_template.replace("{{user_star_id}}", "userID_" +  data.users[i].user_id)
            $("#user_subscribers").append(user_template);
            data.users[i]["last_seen"] = new Date(data.users[i]["last_seen"]);
            user_subscribers_list[data.users[i].user_id] = (data.users[i]);
           }
           if (data.count > 0) {
            last_user_id = data["users"][data.count-1]["user_id"];
            getUserSubscribers(localStorage.getItem('loginUserId'),last_user_id);
           } 
           
        }, 
        error: function (jqXHR, status) {  
        }
      });
}

function userSearch(){
    $('#user-name-search').typeahead({
        source: function (request, response) {
            $.ajax({
                url: url + "/users?user_search_text=" + request,
                dataType: "json",
                type: "GET",
                contentType: "application/json; charset=utf-8",
                success: function (data) { 
                    
                    response(data["users"]);

                    // SET THE WIDTH AND HEIGHT OF UI AS "auto" ALONG WITH FONT.
                    // YOU CAN CUSTOMIZE ITS PROPERTIES.
                    $(".dropdown-menu").css("width", "auto");
                    $(".dropdown-menu").css("height", "auto");
                    $(".dropdown-menu").css("font", "15px Verdana");
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(textStatus);
                }
            },
            );
        },
        updater: function(item) {
            addUserSubscriber(localStorage.getItem('loginUserId'), item.user_id);
            $("#user-name-search").val('');
        },
        hint: true,             // SHOW HINT (DEFAULT IS "true").
        highlight: true,        // HIGHLIGHT (SET <strong> or <b> BOLD). DEFAULT IS "true".
        minLength: 3 ,       // MINIMUM 1 CHARACTER TO START WITH. 
        displayText: function (data) {
            
            return data ?  data.user_name + " - " + data.presence_status :null; 
        }
    }); 
    
}

function renderUser(userId, status, diff) {
    if (status == 'online') {
        $("#userID_" + userId + " .mdl-list__item-secondary-action .material-icons").text('star');
        $("#userID_" + userId + " .mdl-list__item-sub-title").text('Online');
    } else {
        $("#userID_" + userId + " .mdl-list__item-secondary-action .material-icons").text('star_border');
        $("#userID_" + userId + " .mdl-list__item-sub-title").text( "Offline - Last seen " + diff);
    }
     
} 


// -------------- SOCKET Code 


var socket;
this.subscribedUser = {}; 


function initializeWebsocket() {
    socket = io('ws://localhost:80', {path: '/presenceservice/socket.io'}); 
    socket.on("loginSuccessEvent", function(e) {
        console.log(e)
        var user = JSON.parse(localStorage.getItem("loginUser"))
        $("#currentUserName").text(user.user_name + " - " + 'online');
         
        setInterval(function () {
            socket.emit('heartBeatEvent', {user_id : e.user_id});
        }.bind(this), 5000);

        setInterval(function() {
            for (var x in user_subscribers_list) {
                var c = user_subscribers_list[x];
                var cT = new Date();
                var clS =(c.last_seen);
                var diff = cT - clS;
                console.log("last seen of " + c.user_id + " " + diff + " msec");
                if (diff > 30000) {
                    if (diff > 24* 60* 1000) {
                        renderUser(c.user_id,'offline'," yesterday");
                    } else if (diff > 60* 1000) {
                        renderUser(c.user_id,'offline'," a hour ago");
                    }  else if (diff > 20000) {
                        renderUser(c.user_id,'offline',(diff/1000) + " secs ago");
                    }  else  {
                        renderUser(c.user_id,'offline', "" + c.last_seen);
                    }
    
                }
                
            }
        }.bind(this), 10000);
    }.bind(this)); 
      
    socket.on("presenceEvent", function(ev) { 
        renderUser(ev["from_user_id"],'online',null);
        user_subscribers_list[ev["from_user_id"]]["presence_status"] = 'online';
        user_subscribers_list[ev["from_user_id"]]["last_seen"] = new Date(ev["timestamp"]);

    }.bind(this)) 
}

function loginEvent(userid) { 
  var user = {
      user_id: userid, 
  }
  socket.emit('loginEvent', user);
  this.user = user;
}


