var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = require('../database.js');
var xxtea        = require('../xxtea/xxtea.js');

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
    console.log("MASUK FUNGSI GET /VIEWOUTBOX 1");

    var viewOutbox = [];

    var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
    var table = ["message", "msg_id", req.params.msg_id,"key_sender",req.params.key_sender];
    query     = mysql.format(query,table);
    console.log(query);
    console.log(req.params);

    connection.query(query,function(err,rows,fields){
        if(err) {
            return res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {  
            console.log("MASUK FUNGSI GET /VIEWOUTBOX 2");



            // const request_params_key = decodeURI(req.params.key_sender);
            const db_message_plain = rows[0].msg_plain;
            //console.log(rows);
            /*Modul For Decrypt By Key*/
            const key_from_recepient_url = req.params.key_sender;
            const key_from_sender_db = rows[0].key_sender;
            console.log("COMPARE KEY_URL :: >>>> "+key_from_recepient_url);
            console.log("COMPARE KEY_DB :: >>>> "+key_from_sender_db);
            console.log("COMPARE DB_MSG_PLAIN :: >>>> "+db_message_plain);
            
            var flagComparationBetweenURLandDB = false;
            
            if(key_from_recepient_url === key_from_sender_db){
                flagComparationBetweenURLandDB=true;
            }
            //var cipher_config = rc4('arc4', String(key_from_recepient_url));
            //var e = cipher_config.decodeString(db_message_plain);
            //var e = cipher.decodeString(d);
            key=req.params.key_sender;
            console.log("keynya adalah "+key);
            var e = xxtea.decryptToString(db_message_plain,key);
            /*End Of Modul*/

            console.log("COMPARE E :: >>>> "+e);







            //return res.json({"Error" : false, "Message" : "Success", "users" : rows});
            var getTime = '' + rows[0].msg_time;
            var time = getTime.substr(0,24);
            global.viewOutbox2 = {
                'msg_id'     : rows[0].msg_id,
                'msg_source' : rows[0].msg_source,
                'msg_plain'  : e,
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
