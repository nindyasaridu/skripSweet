var express    = require("express");
var mysql      = require('mysql');

var connection = mysql.createConnection({
	connectionLimit : 100000,
	host     : '10.151.36.30',
	user     : 'pisang',
	password : 'pisanggoreng',
	database : 'restful_api_demo'
 });
 
 connection.connect();


 module.exports = connection;