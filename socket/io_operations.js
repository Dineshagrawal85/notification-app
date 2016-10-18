var socketClients = require('../socketClients'),
io = socketClients.io,
socketObjDetail = socketClients.socketObjDetail;
privateChatSessions = socketClients.privateChatSessions
var notification = require('../notificationhistory').notification
var utility = require('../routes/utility.js')
var array = require('./../array')
var logger = require('./../logger/log');

module.exports = function(io){
io.sockets.on('connection', function (socket) {
  console.log(":connection")
  //var socketObj = {}
  var key = socket.id
  //socketObj[socket.id] = socket
  //socketArr.push(socket.id)

    //Invoked when a user send a message in Public Chat Session
    //data is JSON Object contains information about message
    socket.on('send', function (data) {
      console.log(":send")
        var key = socket.id
        var keysObj = Object.keys(io.sockets.connected)
        var indexOfCurrentClient = keysObj.indexOf(key);
        keysObj.splice(indexOfCurrentClient,1)
        for(a in keysObj){
          console.log(":key a",a)
          //notification[keysObj[a]]["count"] += 1
        }
        var notificationDetail = {"type":"Ping in chat","id":socketObjDetail[key]["user_info"]["user_id"]}
        notificationDetail["name"] = socketObjDetail[key]["user_info"]["user_name"]
        socket.broadcast.emit('newmessage',{'message':data.message,"notification":notificationDetail})
        //io.emit('newmessage',{'message':data.message,"count":notification[key]["count"],"notification":notificationDetail,"read":notification[key]["read"]})
    });

    //Invoked when a user disconnects it's session
    socket.on('disconnect', function () {
      //var socketObj = {}
      //socketObj[socket.id] = socket
      //var indexSocketId = socketArr.indexOf(socket.id)
      //socketArr = socketArr.splice(indexSocketId,1)
      try{
        var user_id = socketObjDetail[socket.id]["user_info"].user_id
        //This is called to delete it's entry from active sessionsObject
        delete socketObjDetail[socket.id]

        //This is true when then user which disconnected is doing Private Chat With other user
        //Reason Code 0 - User Disconnected
        if (privateChatSessions[user_id] != undefined){
            for(key in socketObjDetail){
                var userId = socketObjDetail[key].user_info.user_id
                if(userId == privateChatSessions[user_id]){
                    //Delete the Disconnected user entry from private Chat Session Object
                    //To Make the status Available of the destination user
                    delete privateChatSessions[privateChatSessions[user_id]]
                    delete privateChatSessions[user_id]
                    io.sockets.connected[key].emit('private-chat-session-over',{"code":0})
                }
            }
        }
      }

      catch(e){
        console.log(":Exception Occured",e)
        logger.log("error","Error in disconnect handler "+e)
      }
      
    });


    //Invoked Initially to send the basic Information to the newly connected user
    //about it's notifications
    socket.on('info',function(data){
      //console.log(":data",data)
      socketObjDetail[socket.id] = data
      utility.getNotificationFromDB(data.user_info.user_id,socket.id,function(err){

        if(err){
          return
        }
        socket.emit('message',
          { message: 'Welcome to the Chat System - By \'Dinesh Agrawal\'',
            "count":notification[socket.id]["count"],
            "list":notification[socket.id]["list"],
            "read":notification[socket.id]["read"],
            "clientId":socket.id
          });
      })
    })
    //Called when a user wants to personal chat with some user
    //In return 
    //Step 1:- Destination user will be sent a proposal of chat with details of 
    //source user
    socket.on('private-chat-request',function(obj){
      for(key in socketObjDetail){
        var userId = socketObjDetail[key].user_info.user_id
        if(userId == obj["user_id"]){
          console.log(":active_user",userId,"key",key)
          console.log("socket",socket)
          console.log(":socketObjDetail",socketObjDetail)
          io.sockets.connected[key].emit('private-chat-proposal',socketObjDetail[socket.id]["user_info"])
        }
      }
    })

    //Called when a Destination User replies for a Private Chat Proposal
    //responseObj is Object contains information about destination user Response and source User Detail
    socket.on('private-chat-proposal-response',function(responseObj){
      //console.log(":private-chat-proposal-response")
      //console.log(":responseObj[sourceUserDetail]",responseObj["sourceUserDetail"])
      var sourceUserId = responseObj["sourceUserDetail"]["user_id"]
      var finalResponse = {
        "destinationUserInfo":socketObjDetail[socket.id]["user_info"],
        "acceptance":responseObj["Accepted"]
      }
      //console.log(":sourceUserId",sourceUserId)
      for(key in socketObjDetail){
        var userId = socketObjDetail[key].user_info.user_id
        //console.log(":userId",userId)
        if(userId == sourceUserId){

          //If Accepted Send Both the Users signal to start Session
          //If not Accepted Send the Source user that Private Chat Request not accepted
          io.sockets.connected[key].emit('private-chat-proposal-destination-response',finalResponse)
          if(responseObj["Accepted"]){
              privateChatSessions[finalResponse["destinationUserInfo"].user_id] = responseObj["sourceUserDetail"].user_id
              privateChatSessions[responseObj["sourceUserDetail"].user_id] = finalResponse["destinationUserInfo"].user_id
              io.sockets.connected[key].emit('private-chat-session-start',finalResponse["destinationUserInfo"])
              io.sockets.connected[socket.id].emit('private-chat-session-start',responseObj["sourceUserDetail"])
          }
         var found = true
        }
      }
      //Called In case the Source is disconnected
      if(!found){
        io.sockets.connected[socket.id].emit('private-chat-session-source-missing',responseObj["sourceUserDetail"])
      }
    })

    //Called when two users doing chat in Private Session
    //messageObj is JSON Object and containes information about destinationUser
    socket.on('private-chat-session',function(messageObj){
      var destinationUserId = messageObj["user_id"]
      var prepareResponse = {"sourceUserId":socketObjDetail[socket.id]["user_info"],
                             "message":messageObj["message"]}
      for(key in socketObjDetail){
        var userId = socketObjDetail[key].user_info.user_id
        //console.log(":userId",userId)
        if(userId == destinationUserId){
          io.sockets.connected[key].emit('private-chat-session',prepareResponse)
        }
      }
    })

    //called when a user closes Private Chat Session
    //Reason Code 1 - User closes Private Chat Session
    socket.on('close-current-private-chat-session',function(destinationUserDetails){
          var user_id = socketObjDetail[socket.id]["user_info"].user_id
          var found = false
          delete privateChatSessions[privateChatSessions[user_id]]
          delete privateChatSessions[user_id]
          for(key in socketObjDetail){
            var userId = socketObjDetail[key].user_info.user_id
            if(userId == destinationUserDetails["user_id"]){
              found = true
              io.sockets.connected[key].emit('private-chat-session-over',{"code":1})
              break
            }
          }
          if(!found){
            console.log(":Destination user Already Disconnected")
          }
    })

    //This is set to send the available users list to the active clients in a interval
    setInterval(function(){
      try{
        var activeSockets = Object.keys(io.sockets.connected)
        var activeSocketsObj = {}
        activeSockets.map(function(sockObj){
         //return socketObjDetail[sockObj]["user_info"]
         var currentUserDetail = socketObjDetail[sockObj]["user_info"]
         activeSocketsObj[currentUserDetail["user_id"]] = socketObjDetail[sockObj]["user_info"]
         activeSocketsObj[currentUserDetail["user_id"]]["status"] = (privateChatSessions[currentUserDetail["user_id"]] == undefined)?"Available":"Busy";
        })
        console.log(":activeSocketsObj",activeSocketsObj)
        io.emit('socket-list', activeSocketsObj);
      }
      catch(e){
        console.log(":exception occured",e)
      }
    },1000*20)
});
}