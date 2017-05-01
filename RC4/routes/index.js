var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../database.js');

/* GET home page. */
    router.get("/",function(req,res){
        //res.json({"Message" : "Hello World !"});
        console.log("MASUK FUNGSI GET /");
        res.render('index');
    });

    // router.get('/coba1', function(req, res){
    //     req.session.pisang = "asd";
    //     res.send("asd");
    // });

    // router.get('/coba2', function(req, res){
    //     req.session.pisang = "asd";
    //     res.send(req.session.pisang);
    // })


    router.get("/login", function(req, res){
        console.log(req.session);
        console.log("MASUK FUNGSI GET /LOGIN");
        res.render('login');
        req.session.pisang = "login";

    }).post("/login", function(req, res){
        var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
        var table = ["user","user_email",req.body.email,"user_password",req.body.password];
        query = mysql.format(query,table);

        connection.query(query,function(err,rows){

            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else if(rows.length){
                //res.json(rows);
                req.session.pisang = rows[0];
                // res.json(req.session.pisang);
                // res.json({"Error" : false, "Message" : "Success", "Users" : rows});
                res.redirect("/inbox");
                // console.log(req.session);
            }
            else {
                res.redirect("/login");
            }
        });
    }); 

    router.get('/logout', function(req, res) {
        if (!req.session.pisang) {
            res.redirect('/login');
        } else {
            req.session.pisang = null;
            var response = {
                code: 200,
                msg: 'Logout Successfully!'
            };
            req.session.response = response;
            res.redirect('/login');
        }
    });

module.exports = router;