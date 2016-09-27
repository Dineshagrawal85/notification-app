var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


var app = express();
var array = require('./array.js')
var socketClients = require('./socketClients')
var notificationHistory = require('./notificationhistory')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./routes/index');
var users = require('./routes/users');

var x = ""
var socketList = {}
var notification = notificationHistory.notification
var notificationIds = []
var socketArr = []
var socketObjDetail = socketClients.socketObjDetail







app.use('/', routes);
app.use('/users', users);





//startNotification()

app.get('/home/send',function(req,res,next){
  var notificationSocketList = notificationIds;
  console.log(":notificationSocketList",notificationSocketList);
  var index = notificationSocketList.indexOf(req.session.id)
  notificationSocketList.splice(index,1);
  console.log(":notificationSocketList",notificationSocketList)
  for(var i =0 ;i<notificationSocketList.length;i++){
    notificationSocketList[i].emit('msg',{'message':'sent'})
  }
})
/*app.post('/update/all',function(req,res,next){
  var clientId = req.body.clientId;
  var userId = socketObjDetail[clientId].user_info.user_id
  pool.acquire(function(err,connection){
      if(err){
        console.log(":err",err)
      }
      else{
          var query = "update user_detail set last_read_timestamp = now()::timestamp with time zone where id = " +  userId
          console.log(":query",query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
            }
            else{
              notification[clientId]["read"] = notification[clientId]["count"]
              res.send({"read":notification[clientId]["read"]})
            }
          });
      } 
      pool.release(connection);
  })
})*/

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var sendToAll = function(socketId){
  var notificationSocketList = notificationIds;
  var index = notificationSocketList.indexOf(socketId)
  notificationSocketList.splice(index,1);
  for(var i =0 ;i<notificationSocketList.length;i++){
    var index = Math.floor((Math.random() * 10));
    notification[notificationSocketList[i]]["list"].push(array[10])
    socketList[notificationSocketList[i]].emit('msg',{'message':'sent',"count":notification[notificationSocketList[i]]["count"],"notification":array[index],"read":notification[notificationSocketList[i]]["read"]})
  }
}
var io=require('socket.io').listen(app.listen(parseInt(process.env.PORT)));
require('./socket/io_operations')(io);
socketClients.io = io;


