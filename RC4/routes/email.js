var express    = require('express');
var mysql      = require('mysql');
var router     = express.Router();
var connection = require('../database.js');
var formidable = require('formidable');
var path       = require('path');  
var fs         = require('fs-extra');  
var multer     = require('multer');
var rc4        = require('../encrypt/RC4Cipher.js');
var CryptoJS   = require("crypto-js");

router.get('/compose', require('../middleware/auth.js'), function(req, res){
    //console.log(req.session);
    console.log("MASUK FUNGSI GET /COMPOSE");
    //req.session.banana = "login";
     res.render('compose', {
            'login': req.session.pisang.user_email
    });

}).post("/compose", multer({ dest: './img/'}).single('fileUploaded'),function(req, res){

    const db_message_plain  = req.body.msg_plain;
    var cipher_config       = req.body.key_sender;
    var ciphertext          = CryptoJS.RC4.encrypt(db_message_plain, cipher_config);
    // var plaintext           = CryptoJS.RC4.decrypt(ciphertext, cipher_config);
    // var plaintext           = CryptoJS.RC4.decrypt(ciphertext, cipher_config).toString(CryptoJS.enc.Utf8);

    console.log("INI CIPHERNYA >>>>>> " + ciphertext);
    console.log("INI KEYNYA  >>>>>> " + cipher_config);

    // console.log("Key Words >>>" + keyWords);
    // console.log("Key SigBytes >>>" + keySigBytes);

    // var d = cipher_config.encodeString(db_message_plain);
    // var e = cipher_config.decodeString(d);

    // console.log("KEY COMPOSE : "+req.body.key_sender);
    // console.log("Plain TEXT  : " +req.body.msg_plain);
    // console.log("HEXXX ->>>>>>>>> : "+String(ciphertext));
    // console.log("HEXXX ->>>>>>>>> : "+String(plaintext));

    var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
    var table = ["message","msg_source","msg_target","key_sender","msg_plain",req.session.pisang.user_email, req.body.msg_target, req.body.key_sender, ciphertext.toString()];
    
    console.log(query);
    console.log(table);

    query = mysql.format(query,table);
    console.log("MASUK FUNGSI POST /COMPOSE");
    console.log(query);

    connection.query(query,function(err,rows){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            console.log("MASUK FUNGSI POST /UPLOAD");
            console.log(rows.insertId);

            if (req.file) {
                console.log(req.file);
                fs.rename(req.file.path, './img/'+req.file.filename+ '-' + req.file.originalname, function(err) {
                    var nameFile = req.file.filename+ '-' + req.file.originalname;
                    var pathFile = '/img/'+req.file.filename+ '-' + req.file.originalname;
                    var sizeFile = req.file.size;

                    var query2 = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
                    var table2 = ["file_upload","name_file","path_file","size_file", "msg_id",nameFile, pathFile, sizeFile, rows.insertId];
                    query2     = mysql.format(query2,table2);
                    connection.query(query2,function(err,rows){
                        if(err) {
                            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                        } else {
                            // res.json({"Error" : false, "Message" : "Success", "Users" : rows});
                            // req.session.pisang = rows;
                            // console.log(req.session);
                            // res.redirect("/inbox");
                            console.log(rows);
                            // console.log("BISA MASUK GA")
                            // res.redirect("/inbox");
                        }
                    });
                });
            }

            res.redirect("/inbox");

        }
    });
}); 

router.get('/new', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
