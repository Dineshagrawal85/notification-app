var array = require('./../array.js')
var notification = require('../notificationhistory').notification
var socketObjDetail = require('../socketClients').socketObjDetail
var pool = require('./pg_pool.js')
var logger = require('./../logger/log');
//var io = require('../socketClients').io
exports.getNotificationFromDB = function(userId,key,cb){
  pool.acquire(function(err,connection){
      if(err){
        console.log(":err",err)
        logger.log("error","Error connection to database "+err)
        cb(err)
        //res.json({statusCode: 0, message: err.code});
      }
      else{
          var query = "SELECT * FROM  get_all_notification1("+userId+")"
          console.log(":query",query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
              logger.log("error","Error Executing query "+query+ " \nError "+err)
              cb(err)
            }
            else{
            //console.log(":rows",rows.rows[0])   
            var notificationDataForUnRead = rows.rows[0].unreadmessage;
            var notificationDataForRead = rows.rows[0].readmessage
            notification[key] = {"list":[],"count":0,"max_id":-1}
            if(notificationDataForUnRead != null){
               notification[key]["count"] = notificationDataForUnRead.length
               notification[key]["list"] = notificationDataForUnRead
               notification[key]["read"] = 0
               notification[key]["max_id"] = notificationDataForUnRead[0]["max_id"]
            }
            if(notificationDataForRead != null){
              notification[key]["count"] += notificationDataForRead.length
              for(a in notificationDataForRead){
                notification[key]["list"].push(notificationDataForRead[a])
              }
              notification[key]["read"] = notificationDataForRead.length
              if(notification[key]["max_id"] == -1){
                notification[key]["max_id"] = notificationDataForRead[0]["max_id"]
              }
            }
            cb()
            }
          });
      } 
      pool.release(connection);
  });
}



var startNotification = function(){
  setInterval(function(){
    var index = Math.floor((Math.random() * 39));
    var newNotification = array[index]
    pool.acquire(function(err,connection){
      if(err){
        console.log(":err",err)
        logger.log("error","Error connection to database "+err)
      }
      else{
          var query = "SELECT * FROM  insert_notification("+newNotification.id+","+newNotification.type+")"
          console.log(":query",query)
          sendPublicInfo(query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
              logger.log("error","Error Executing query "+query+ " \nError "+err)
            }
            else{
              fetchNewNotification(newNotification.id)
            }
          });
      } 
      pool.release(connection);
  });
    },40*1000)
}
startNotification()
//module.exports = startNotification


var fetchNewNotification = function(senderId){
  pool.acquire(function(err,connection){
      if(err){
        console.log(":err",err)
        logger.log("error","Error connection to database "+err)
        return
      }
      else{
          var query = "select receiver from user_subscription_map where sender = " + senderId
          console.log(":query",query)
          sendPublicInfo(query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
              logger.log("error","Error Executing query "+query+ " \nError "+err)
              return
            }
            else{
            //console.log(":rows",rows.rows[0])   
            //console.log(":rows",rows)
              if(rows.rows.length){
                console.log(":rows.rows[0].receiver",rows.rows[0].receiver)
                var receiverIdArray = rows.rows[0].receiver
                sendPublicInfo("Response:"+receiverIdArray.toString())
                checkActiveUserAndSendNotification(receiverIdArray)
              }
            }
          });
      } 
      pool.release(connection);
  });
  
}

var checkActiveUserAndSendNotification = function(receiverIdArray){
  console.log(":socketObjDetail",socketObjDetail)
   for(key in socketObjDetail){
    var userId = socketObjDetail[key].user_info.user_id
    if(receiverIdArray.indexOf(userId)!=-1){
      console.log(":active_user",userId,"key",key)
      var maxNotificationId = notification[key]["max_id"]
      checkAllNotificationInDB(userId,key,maxNotificationId)
    }
   }
}


var checkAllNotificationInDB = function(userId,key,maxNotificationId){
  pool.acquire(function(err,connection){
        if(err){
          console.log(":err",err)
          logger.log("error","Error connection to database "+err)
          return
        }
        else{
          var query = "SELECT * FROM  get_new_notification("+userId+","+maxNotificationId+")"
          console.log(":query",query)
          sendPublicInfo(query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
              logger.log("error","Error Executing query "+query+ " \nError "+err)
              return
            }
            else{
              console.log(":rows",rows)
              sendPublicInfo(rows)
              var notificationDataForUnRead = rows.rows[0].unreadmessage || rows.rows[0].get_new_notification
              sendPublicInfo(notificationDataForUnRead)
              if(notificationDataForUnRead != null){
                notification[key]["count"] += notificationDataForUnRead.length
                notification[key]["list"] = notificationDataForUnRead
                notification[key]["max_id"] = notificationDataForUnRead[0].max_id
                sendPublicInfo(key)
                sendNotificationToClient(key)
              }
            }
          });
        } 
      pool.release(connection);
      });
}
var sendNotificationToClient = function(key){
  sendPublicInfo(Object.keys(require('../socketClients').io.sockets.connected))
  //console.log(":key",key)
  var keysObj = Object.keys(require('../socketClients').io.sockets.connected);
  //console.log(":active socket keys",keysObj)
  require('../socketClients').io.sockets.connected[key].emit('notification',
          { "count":notification[key]["count"],
            "list":notification[key]["list"],
            "read":notification[key]["read"],
            "clientId":key
          });
}


var sendPublicInfo = function(dataToSend){
  var data = {"message":dataToSend}
  require('../socketClients').io.emit('public-message', data);
}