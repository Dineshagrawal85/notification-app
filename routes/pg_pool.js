var pg = require('pg');
var genericpool = require("generic-pool");

/*var database_conf = {
  "host":"localhost",
    "username":"postgres",
    "password":"paxcel@123",
    "db":"notification_app",
    "port": 5432,
    "dialect": "postgres" 
}*/

/*var database_conf = {
  "host":"ec2-54-75-228-83.eu-west-1.compute.amazonaws.com",
    "username":"maqtincwtssiww",
    "password":"abZsu5kPquqSuwFXzx-AEDQ9uR",
    "db":"dcddpalkomp2tc",
    "port": 5432,
    "dialect": "postgres" 
}*/


/*ec2-54-75-228-83.eu-west-1.compute.amazonaws.com
db - dcddpalkomp2tc
user - maqtincwtssiww
password - abZsu5kPquqSuwFXzx-AEDQ9uR*/
//var connectionString = 'postgres://'+database_conf.username+':'+database_conf.password+'@'+database_conf.host+'/'+database_conf.db;
var connectionString  = 'postgres://garkljwsizcqmu:mQOfygl0RuJSw2mvFcEzq_GHZn@ec2-54-235-87-70.compute-1.amazonaws.com:5432/ddr371q6rrcpk9'



var pool = genericpool.Pool({
    name: "postgres",
    create: function (callback) {
      var client =new pg.Client(connectionString);
      client.connect(function (error) {
        if (error) {
          console.log(":error",error);
        }
        callback(error, client);
      });
    },
    destroy: function(client) {
      client.end();
    },
    max: 100,
    min: 10,
    idleTimeoutMillis: 30000,
    log : false
  });

module.exports = pool