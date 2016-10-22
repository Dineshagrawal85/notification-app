var sessionLessAccess = ["/auth/authenticate","/login","/signup"]

module.exports = function(app){
    
	app.all("*",function(req,res,next){   
		if(sessionLessAccess.indexOf(req.path)!= -1 || req.session.userDetail){
			return next()
		}
	    else if(req.session.userDetail == undefined){
			res.statusCode = 401;
			return res.json({"statusCode":401});
		}

	})
}