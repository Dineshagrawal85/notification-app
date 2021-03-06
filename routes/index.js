var crypto = require('crypto');
var secureRandom = require('secure-random');
var md5 = require('md5')
var express = require('express');
var router = express.Router();
var socketObjDetail = require('../socketClients').socketObjDetail
var notification = require('../notificationhistory').notification
var pool = require('./pg_pool.js')
var logger = require('./../logger/log');
var multer = require('multer');

router.post('/update/all',function(req,res,next){
  try{
    var clientId = req.body.clientId;
    var userId = socketObjDetail[clientId].user_info.user_id
  }
  catch(e){
    logger.log("error","Exception Occured in /update/all "+e)
    return res.json({"statusCode":0})
  }
  pool.acquire(function(err,connection){
      if(err){
        logger.log("error","Error connection to database "+err)
        return res.json({"statusCode":0})
      }
      else{
          var query = "update user_detail set last_read_timestamp = now()::timestamp with time zone where id = " +  userId
          connection.query(query, function(err, rows) {
            if (err){
              logger.log("error","Error Executing query "+query+ " \nError "+err)
              return res.json({"statusCode":0}) 
            }
            else{
              notification[clientId]["read"] = notification[clientId]["count"]
              return res.send({"statusCode":1,read:notification[clientId]["read"]})
            }
          });
      } 
      pool.release(connection);
  })
})

var getSecurePassword=function(passwordToHash,cb) { 

  try{
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
      cb(null,hashCreated,saltToString);   
  }
  catch(e){
      logger.log("error","Exception Occured in Generating hash for password "+e)
      cb(e)
  }
  
}


var saveUserDetails = function(user_name,img_url,hashCreated,saltToString, cb){
  pool.acquire(function(err,connection){
      if(err){
        logger.log("error","Error connection to database "+err)
        cb(err)
      }
      else{
          var query = "select * from public.save_user_details('"+user_name+"','"+img_url+"','"+hashCreated+"','"+saltToString+"')"
          connection.query(query, function(err, rows) {
            if (err){
              logger.log("error","Error Executing query "+query+ " \nError "+err)
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
        logger.log("error","Error connection to database "+err)
        cb(err)
      }
      else{
          var query = "insert into user_association (source_user,associated_user) values("+userId+",'{1,2,4,5}')"
          connection.query(query, function(err, rows) {
            if (err){
              logger.log("error","Error Executing query "+query+ " \nError "+err)
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
        logger.log("error","Error connection to database "+err)
        cb(err)
      }
      else{
          var query = "select * from public.post_user_subscriptions('["+subsciptionArray+"]',"+user_id+")"
          connection.query(query, function(err, rows) {
            if (err){
              logger.log("error","Error Executing query "+query+ " \nError "+err)
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
        logger.log("error","Error connection to database "+err)
        return res.json({"statusCode":0})
      }
      else{
          var query = "select * from public.get_user_login_details('"+user_name+"')"
          connection.query(query, function(err, rows) {
            if (err){
              logger.log("error","Error Executing query "+query+ " \nError "+err)
              res.json({"statusCode":0})
            }
            else{
              if(rows.rows.length > 0 ){
                var result = rows.rows[0]
                var generatedPassword = md5(result["salt"]+password)
                if(generatedPassword == result["hash"]){
                  var userDetail = {"user_id":result["id"],"user_name":result["name"],"img_url":result["img_url"]}
                  req.session.userDetail = userDetail
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

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now()+'_'+file.originalname);
  }
});

var upload = multer({ storage : storage}).single('file');
router.post('/signup',function(req,res,next){
  return res.json({"statusCode":0});
  var img_url = ""
  upload(req,res,function(err) {
        if(err) {
            logger.log("error","File uploading error"+err)
            return res.json({"statusCode":0});
        }else{
          var user_name = req.body.user;
          var password = req.body.password
          var img_url = req.file.filename
          getSecurePassword(password,function(err,hashCreated,saltToString){
            if(err){
              return res.json({"statusCode":0})
            }
                saveUserDetails(user_name,img_url,hashCreated,saltToString,function(err,user_id){
                  if(err){
                    logger.log("error","saveUserDetails error"+err)
                    return res.json({"statusCode":0})
                  }
                  logger.log("info","saveUserDetails success")
                  console.log("user_id",user_id)
                  saveUserAssociation(user_id.save_user_details,function(err){
                    if(err){
                      logger.log("error","saveUserAssociation error"+err)
                      return res.json({"statusCode":0})
                    }
                    logger.log("info","saveUserAssociation success")
                    saveUserSubscriptionMap(user_id.save_user_details,[1,2,4,5],function(err){
                      if(err){
                        logger.log("error","saveUserSubscriptionMap error"+err)
                        return res.json({"statusCode":0})
                      }
                      logger.log("info","saveUserSubscriptionMap success")
                      var user_detail = {"user_id":user_id.save_user_details,"user_name":user_name,"img_url":img_url}
                      res.json({"statusCode":1,"user_detail":user_detail})
                    })
                  })
                })
          })
        }
  })
})


router.get('/logout',function(req,res,next){
  req.session.destroy(function(err,result){
     if(err){
       logger.log("error","Error in destroying user session")
       return res.json({"statusCode":0});
     }
     else
     {
      res.json({"statusCode":1});
     }
   }); 
})

module.exports = router;
