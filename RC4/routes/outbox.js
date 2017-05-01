var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../database.js');
var CryptoJS    = require("crypto-js");
var utf8        = require('utf8');

router.get("/", require('../middleware/auth.js'), function(req,res){
    console.log("MASUK FUNGSI GET /OUTBOX");
    var outboxList = [];
    var query = "SELECT * FROM ?? WHERE ?? = ? ORDER BY ?? DESC";
    var table = ["message", "msg_source", req.session.pisang.user_email, "msg_time"];
    query = mysql.format(query,table);

    connection.query(query,function(err,rows,fields){
        if(err) {
            //console.log("MASUK IF ERROR QUERY");
            return res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            // res.json({"Error" : false, "Message" : "Success", "Users" : rows});
            for (var i = 0; i < rows.length; i++) {
                console.log("row length: ", rows.length);
                console.log("i: ", i);
                // Create an object to save current row's data
                var login = req.session.pisang.user_email;
                var getTime = '' + rows[0].msg_time;
                var time = getTime.substr(0,24);
                console.log(login);
                var outbox = {
                    'msg_id'     : rows[i].msg_id,
                    'msg_source' : rows[i].msg_source,
                    'msg_plain'  : rows[i].msg_plain,
                    'msg_time'   : time,
                    'msg_target' : rows[i].msg_target,
                    'key_sender' : rows[i].key_sender,
                    'login'      :login
            }
            // Add object into array
            outboxList.push(outbox);
            }
        }
        res.render('outbox', {
            'outboxList': outboxList,
            'login': req.session.pisang.user_email
        });
    });
});

router.get('/viewOutbox/:msg_id/:key_sender', require('../middleware/auth.js'), function(req, res, next) {
    console.log("MASUK FUNGSI GET /VIEWOUTBOX");
    var viewOutbox = [];

    var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    var table = ["message", "msg_id", req.params.msg_id, "key_sender", req.params.key_sender];
    query     = mysql.format(query,table);
    console.log(query);
    console.log(req.params.msg_id);

    connection.query(query,function(err,rows,fields){
        if(err) {
            return res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {  

            const db_message_plain  = rows[0].msg_plain;
            var cipher_config       = req.params.key_sender;
            // var ciphertext          = CryptoJS.RC4.encrypt(db_message_plain, cipher_config);
            // var plaintext           = CryptoJS.RC4.decrypt(ciphertext, cipher_config);
            var dekrip              = db_message_plain.toString();
            var plaintext           = CryptoJS.RC4.decrypt(dekrip, cipher_config).toString(CryptoJS.enc.Utf8);

            console.log("INI PESAN DARI DB    >>>>>> " + db_message_plain);
            console.log("INI KEY DARI DB      >>>>>> " + cipher_config);
            console.log("INI PESAN DI STRING  >>>>>> " + dekrip);
            console.log("INI HASIL DEKRIP     >>>>>> " + plaintext);

            var flagComparationBetweenURLandDB = false;

            if(cipher_config) {
                flagComparationBetweenURLandDB = true;
            }

            // var cipher_config = key_from_sender_db;
            // var plaintext     = CryptoJS.RC4.decrypt(db_message_plain, cipher_config);

            // console.log("MESSAGE :: >>>> " + db_message_plain);
            // console.log("KEY     :: >>>> " + key_from_sender_db);
            // console.log("CIPHER  :: >>>> " + cipher_config);
            // console.log("DEKRIP  :: >>>> " + plaintext);

            //return res.json({"Error" : false, "Message" : "Success", "users" : rows});
            var getTime = '' + rows[0].msg_time;
            var time = getTime.substr(0,24);

            global.viewOutbox2 = {
                'msg_id'     : rows[0].msg_id,
                'msg_source' : rows[0].msg_source,
                'msg_plain'  : plaintext,
                'msg_time'   : time,
                'msg_target' : rows[0].msg_target
            }
            viewOutbox.push(viewOutbox2);

            var viewAttachment = [];
            var query2 = "SELECT * FROM ?? WHERE ?? = ?";
            var table2 = ["file_upload", "msg_id", req.params.msg_id];
            query2     = mysql.format(query2,table2);
            console.log(query2);

            connection.query(query2,function(err,rows){
                if(err) {
                    res.json({"Error" : true, "Message" : "Error executing MySQL query"});
                } else {
                    console.log("MASUK GAAAAAAA");

                    if(rows[0]) {
                        global.viewAttachment2 = {
                            'id_file'  : rows[0].id_file,
                            'path_file'  : rows[0].path_file,
                            'size_file'  : rows[0].size_file
                        }
                        viewAttachment.push(viewAttachment2);

                        console.log(viewAttachment2);

                        res.render('viewOutbox', {
                            'viewOutbox': viewOutbox,
                            'viewAttachment' : viewAttachment,
                            'login': req.session.pisang.user_email
                        });  
                    }

                    res.render('viewOutbox', {
                    'viewOutbox': viewOutbox,
                    'viewAttachment' : viewAttachment,
                    'login': req.session.pisang.user_email
            }); 
                }
            });  
        }
 
        // res.render('viewOutbox', {
        //     'viewOutbox': viewOutbox,
        //     'viewAttachment' : viewAttachment,
        //     'login': req.session.pisang.user_email
        // });   

    });
});

router.get("/download/:id_file", require('../middleware/auth.js'), function(req,res){
    console.log("MASUK FUNGSI GET /DOWNLOAD");
    console.log(viewAttachment2);

    var path = require('path');
    var mime = require('mime');

    var file = __dirname + '/..' + viewAttachment2.path_file;


    res.download(file);
    // var filename = path.basename(file);
    // var mimetype = mime.lookup(file);
    // console.log(file);
    // res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    // res.setHeader('Content-type', mimetype);

    // var filestream = fs.createReadStream(file);
    // filestream.pipe(res);
});

module.exports = router;
