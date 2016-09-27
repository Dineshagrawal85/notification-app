var crypto = require('crypto');
var secureRandom = require('secure-random');
var md5 = require('md5')
var express = require('express');
var router = express.Router();
var socketObjDetail = require('../socketClients').socketObjDetail
var notification = require('../notificationhistory').notification
var pool = require('./pg_pool.js')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('/home/Dinesh/work/socket/views/page1.html');
});

/*router.get('/demo',function(req,res,next){
	console.log(":demo")
	console.log(":req.path",req.path)
	req.path = "/demo/set"
	req.url = "/demo/set"
	console.log(":req.path",req.path)
	console.log(":req.url",req.url)
	next();
})

router.get('/demo/set',function(req,res,next){
	console.log(":req")
})*/

router.post('/update/all',function(req,res,next){
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
})

var getSecurePassword=function(passwordToHash,cb) { 
   
  var salt = secureRandom.randomBuffer(4);  
  var saltToString = salt.toString('hex');
  var bytes = [];
  var str = passwordToHash;
  for (var i = 0; i < str.length; ++i) {
      bytes.push(str.charCodeAt(i));
  } 
  var hash = crypto.createHash('md5');      
    hash.update(saltToString);      
    hash.update(str);
  var hashCreated = hash.digest(bytes).toString('hex');   
  cb(hashCreated,saltToString);   
}


var saveUserDetails = function(user_name,img_url,hashCreated,saltToString, cb){
  pool.acquire(function(err,connection){
      if(err){
        cb(err)
      }
      else{
          var query = "select * from public.save_user_details('"+user_name+"','"+img_url+"','"+hashCreated+"','"+saltToString+"')"
          connection.query(query, function(err, rows) {
            if (err){
              cb(err)
            }
            else{
              if(rows.rows.length > 0 ){
                cb(null,rows.rows[0])
              }else{
                cb("Not Found")
              }
            }
          });
      } 
      pool.release(connection);
  })
}

var saveUserAssociation = function(userId,cb){
  pool.acquire(function(err,connection){
      if(err){
        cb(err)
      }
      else{
          var query = "insert into user_association (source_user,associated_user) values("+userId+",'{1,2,4,5}')"
          connection.query(query, function(err, rows) {
            if (err){
              cb(err)
            }
            else{
              cb(null)
            }
          });
      } 
      pool.release(connection);
  })
}

var saveUserSubscriptionMap = function(user_id,subsciptionArray,cb){
  pool.acquire(function(err,connection){
      if(err){
        cb(err)
      }
      else{
          var query = "select * from public.post_user_subscriptions('["+subsciptionArray+"]',"+user_id+")"
          connection.query(query, function(err, rows) {
            if (err){
              cb(err)
            }
            else{
              cb(null)
            }
          });
      } 
      pool.release(connection);
  })
}

router.post('/login',function(req,res,next){
  var user_name = req.body.user;
  var password = req.body.password
  pool.acquire(function(err,connection){
      if(err){
        res.json({"statusCode":0})
      }
      else{
          var query = "select * from public.get_user_login_details('"+user_name+"')"
          connection.query(query, function(err, rows) {
            if (err){
              res.json({"statusCode":0})
            }
            else{
              if(rows.rows.length > 0 ){
                var result = rows.rows[0]
                var generatedPassword = md5(result["salt"]+password)
                if(generatedPassword == result["hash"]){
                  var userDetail = {"user_id":result["id"],"user_name":result["name"],"img_url":result["img_url"]}
                  res.json({"statusCode":1,"loggedIn":true,"userDetail":userDetail})
                }else{
                  res.json({"statusCode":1,"loggedIn":false,"Message":"Wrong Password"})
                }
              }else{
                res.json({"statusCode":1,"loggedIn":false,"Message":"User doesn't Exists"})
              }
            }
          });
      } 
      pool.release(connection);
  })
})


router.post('/signup',function(req,res,next){
  var user_name = req.body.user;
  var password = req.body.password
  var img_url = ""
  getSecurePassword(password,function(hashCreated,saltToString){
    saveUserDetails(user_name,img_url,hashCreated,saltToString,function(err,user_id){
      if(err){
        return res.json({"statusCode":0})
      }
      saveUserAssociation(user_id.id,function(err){
        if(err){
          return res.json({"statusCode":0})
        }
        saveUserSubscriptionMap(user_id.id,[1,2,4,5],function(err){
          if(err){
            return res.json({"statusCode":0})
          }
          var user_detail = {"user_id":user_id.id,"user_name":user_name,"img_url":img_url}
          res.json({"statusCode":1,"user_detail":user_detail})
        })
      })
    })
  })
})


module.exports = router;
