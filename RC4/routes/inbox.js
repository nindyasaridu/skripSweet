var express     = require('express');
var mysql       = require('mysql');
var router      = express.Router();
var connection  = require('../database.js');
var CryptoJS    = require("crypto-js");
var rc4         = require('../encrypt/RC4Cipher.js');
var utf8        = require('utf8');
// var rc4 = require('arc4');

// var globalInbox = [inbox = {
//                     'msg_source':msg_source,
//                     'msg_time':msg_time,
//                     }];

router.get("/", require('../middleware/auth.js'), function(req,res){
    console.log("MASUK FUNGSI GET /INBOX");
    var loginList = [];
    global.inboxList = [];
    var query = "SELECT * FROM ?? WHERE ?? = ? ORDER BY ?? DESC";
    var table = ["message", "msg_target", req.session.pisang.user_email, "msg_time"];
    query = mysql.format(query,table);
    console.log(query);

    connection.query(query,function(err,rows,fields){
        // console.log("masuk sini ga?");
        if(err) {
            return res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {
            // console.log("masuk sini ga");
            //res.json({"Error" : false, "Message" : "Success", "Users" : rows});
            for (var i = 0; i < rows.length; i++) {
                // console.log("row length: ", rows.length);
                // console.log("i: ", i);
                // Create an object to save current row's data
                var login = req.session.pisang.user_email;
                var getTime = '' + rows[i].msg_time;
                var time = getTime.substr(0,24);
                console.log(login);
                global.inbox = {
                    'msg_id'        : rows[i].msg_id,
                    'msg_source'    : rows[i].msg_source,
                    'msg_plain'     : rows[i].msg_plain,
                    'msg_time'      : time,
                    'msg_target'    : rows[i].msg_target,
                    'key_recepient' : rows[i].key_recepient,
                    'key_sender'    : rows[i].key_sender,
                    'login'         : login
                }
            // Add object into array
            inboxList.push(inbox);
            }
        }
        res.render('inbox', {
            'inboxList': inboxList,
            'login'    : req.session.pisang.user_email,
            'loginList': loginList
        });

        // console.log(inbox);
    });
});
//WOI baca console lognya, harusnya kan direstart baru bisa. gimana sih. kalo engga masih running code yang lama. Sikodok
//apasih orang nodemon, sekali di svae ngrestart sendiri
//jangan pake nodemon. ngikut gue.
router.get('/viewInbox/:msg_id/:key_sender', require('../middleware/auth.js'), function(req, res, next) {
    console.log(req.params.key_sender);
    // const request_params_key = decodeURI(req.params.key_sender);

    console.log("MASUK FUNGSI GET /VIEWINBOX");
    var viewInbox = [];

    var query = "SELECT * FROM ?? WHERE ?? = ?";
    var table = ["message", "msg_id", req.params.msg_id];
    query     = mysql.format(query,table);
    console.log(query);
    console.log(req.params.msg_id);
    console.log("batas atas");
    console.log(req.params);
    console.log("batas bawah");

    // console.log(viewInbox);

    connection.query(query,function(err, rows, fields){
        if(err) {
            return res.json({"Error" : true, "Message" : "Error executing MySQL query"});
        } else {    
            // const request_params_key = decodeURI(req.params.key_sender);
            const db_message_plain       = rows[0].msg_plain;
            //console.log(rows);
            /*Modul For Decrypt By Key*/
            const key_from_recepient_url = req.params.key_sender;
            const key_from_sender_db     = rows[0].key_sender;
            console.log("COMPARE KEY FROM URL :: >>>> "+key_from_recepient_url);
            console.log("COMPARE KEY FROM DB  :: >>>> "+key_from_sender_db);
            var flagComparationBetweenURLandDB = false;

            if(key_from_recepient_url == key_from_sender_db) {
                flagComparationBetweenURLandDB=true;
                console.log("MASUK SINI");
            }

            console.log("MASUK SINI bawah if");

            var cipher_config = key_from_recepient_url;

            if(flagComparationBetweenURLandDB){
                var plaintext     = CryptoJS.RC4.decrypt(db_message_plain.toString(), cipher_config.toString()).toString(CryptoJS.enc.Utf8);
            }
            else {
                var plaintext     = CryptoJS.RC4.decrypt(db_message_plain.toString(), cipher_config.toString()).toString();
            }

            console.log("MASUK SINI bawah dekrip");
            // var e = cipher_config.decodeString(db_message_plain);
            //var e = cipher.decodeString(d);

            /*End Of Modul*/
            var getTime = '' + rows[0].msg_time;
            var time = getTime.substr(0,24);
            global.viewInbox2 = {
                    'msg_id'     : rows[0].msg_id,
                    'msg_source' : rows[0].msg_source,
                    'msg_plain'  : plaintext,
                    'msg_time'   : time,
                    'msg_target' : rows[0].msg_target
            }       
            viewInbox.push(viewInbox2);
            console.log(viewInbox);

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

                    if(rows[0]){
                        if(flagComparationBetweenURLandDB===true){
                            console.log("trueeeeee");
                            global.viewAttachment2 = {
                            'id_file'    : rows[0].id_file,
                            'path_file'  : rows[0].path_file,
                            'size_file'  : rows[0].size_file
                            }
                        } else{
                            console.log("falseee");
                            global.viewAttachment2 = {
                            'id_file'    : '',
                            'path_file'  : '',
                            'size_file'  : ''
                            }
                        }
                        // global.viewAttachment2 = {
                        //     'id_file'    : rows[0].id_file,
                        //     'path_file'  : rows[0].path_file,
                        //     'size_file'  : rows[0].size_file
                        // }
                        viewAttachment.push(viewAttachment2);

                        console.log(viewAttachment2);

                        res.render('viewInbox', {
                            'viewInbox': viewInbox,
                            'viewAttachment' : viewAttachment,
                            'login': req.session.pisang.user_email
                        }); 
                    } 

                    res.render('viewInbox', {
                        'viewInbox': viewInbox,
                        'viewAttachment' : viewAttachment,
                        'login': req.session.pisang.user_email
                    });    
                }
            });
        }
    
        // res.render('viewInbox', {
        //     'viewInbox': viewInbox,
        //     'viewAttachment' : viewAttachment,
        //     'login': req.session.pisang.user_email
        // });   
    });

}).post("/viewInbox", require('../middleware/auth.js'), function(req, res, next){

    var source    = req.session.pisang.user_email;
    var target    = viewInbox2.msg_source;
    var pesan     = req.body.msg_plain; 

    var query  = "INSERT INTO ??(??,??,??) VALUES (?,?,?)";
    var table  = ["message","msg_source","msg_target","msg_plain",source,target,pesan];
    
    query  = mysql.format(query,table);
    console.log(query);

    connection.query(query,function(err,rows,fields){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            console.log(rows);
        } else {
            res.redirect("/inbox");
        }
    });

}).post("/inputKey", require('../middleware/auth.js'), function(req, res, next){

    // var source    = req.session.pisang.user_email;
    // var target    = viewInbox2.msg_source;
    // var pesan     = req.body.msg_plain; 

    console.log("MASUK FUNGSI PUT /VIEWINBOX");

    var query  = "SELECT * FROM ?? WHERE ?? = ?";
    var table  = ["message","key_sender",req.body.key_sender, "msg_id", req.body.msg_id];

    // var query  = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    // var table  = ["message","key_recepient",req.body.key_sender, "msg_id", req.body.msg_id];
    
    query  = mysql.format(query,table);
    console.log(query);
    console.log("inikuncinya");
    console.log(req.body.key_sender);

    connection.query(query,function(err,rows,fields){
        if(err) {
            res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            console.log(rows);
        } else{
            res.redirect("/inbox/viewInbox/" + req.body.msg_id + "/" + req.body.key_sender);
        }
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