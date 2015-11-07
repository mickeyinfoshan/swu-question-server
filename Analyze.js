//send the request and get the result

var jsonp = require("jsonp");
var removeBrace = require("./tools/removeBrace.js")
var request = require('request');

module.exports = function(text, fn) {
	text = removeBrace(text);
	var base     = "http://ltpapi.voicecloud.cn/analysis/";
    var api_key  = "r3V2w3W9bXtZNXDIbqqlbY0IOPZpQh2bdhOupgcK";
    var pattern  = 'all';
    var format   = "json";

    request({
        uri : base,
        qs : {
            api_key : api_key,
            pattern :pattern,
            format : format,
            text : text
        }
    }, responseHandler)

    function responseHandler(error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            fn(body);
        }
        else{
            console.log("Analyze failed!!!");
            console.log(body);
        }
    }
};