/*jshint node:true, eqeqeq:true */
'use strict';

var xxtea        = require("./xxtea.js");

var str = "Hello World!";
var key = "1234567890";
var encrypt_data = xxtea.encryptToString(str, key);
console.log(encrypt_data);
var decrypt_data = xxtea.decryptToString(encrypt_data, key);
console.assert(str === decrypt_data);
console.log(decrypt_data);
