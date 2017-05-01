'use strict';
module.exports = function(req,res,next){
	//res.send(req.session.pisang)
    if(req.session.pisang) next();
    else {
    	var response = {code:403,msg:"Forbidden Access!"};
		req.session.response = response;
    	res.redirect("/login");
    }
    /*next();*/
};
