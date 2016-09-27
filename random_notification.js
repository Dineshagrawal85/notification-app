var array = require('./array.js')

var startNotification = function(){
  setInterval(function(){
    var index = Math.floor((Math.random() * 10));
    var newNotification = array[index]
    pool.acquire(function(err,connection){
      if(err){
        console.log(":err",err)
      }
      else{
          var query = "SELECT * FROM  insert_notification("+newNotification.id+","+newNotification.type+")"
          console.log(":query",query)
          connection.query(query, function(err, rows) {
            if (err){
              console.log(":err",err)
            }
            else{
              fetchNewNotification(newNotification.id)
            }
          });
      } 
      pool.release(connection);
  });
    },30000)
}

module.exports = startNotification