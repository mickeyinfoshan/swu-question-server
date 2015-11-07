var http = require("http");
var mq = require("./makeQuestions.js")
var port = process.argv[2] || 8100;
var Qs = require('qs');

http.createServer(function(req, res) {
	if(req.method.toLowerCase() != "post") {
		res.end("POST only");
	}
	var reqBody = "";
	req.on("data", function(chunk) {
		reqBody += chunk.toString();
	});
	req.on("end", function() {
		reqBody = Qs.parse(reqBody);
		if(reqBody.api_key != "158978305" || !reqBody.api_key){
			res.end("wrong api_key")
		}
		if(!reqBody.text) {
			res.end("no text found");
		}
		mq(reqBody.text, function(questions) {
			res.end(JSON.stringify(questions))
		});

	});
}).listen(port);

console.log("swu-server is running!")