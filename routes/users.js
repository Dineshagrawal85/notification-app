var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/demo',function(req,res,next){
	console.log(":demo")
	console.log(":req.path",req.path)
	req.path = "/demo/set"
	req.url = "/demo/set"
	console.log(":req.path",req.path)
	console.log(":req.url",req.url)
	req.session.user = {"user_id":1}
	console.log(":req.session",req.session.user)
	next();
})

router.get('/demo/set',function(req,res,next){
	console.log(":req")
	console.log(":req.session.user",req.session.user)
})
module.exports = router;
