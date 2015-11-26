var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require("path");
var dir = process.argv[2] || path.join(process.cwd(), 'text')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('./'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

http.listen(3100, function(){
	console.log('Node.js running at: http://0.0.0.0:3100');
});

app.get('/', function(req, res) {

	res.render('./main.html');
})

io.on('connection', function(socket){

	//读取文件夹内容发给客服端
	socket.on('read file', function(msg){

		fs.readdir(dir, function(err, files) {

			files.forEach(function(file) {
				if(/.txt$/.test(file)) {
					var text = fs.readFileSync(path.join(dir,file), 'utf-8').toString();
					io.emit('read file', text);

				}
			})
			io.emit('read file', {end: true});

		});
	});

	//输出csv文件
	var csv = ''
	socket.on('file quest', function(msg){

		fs.writeFile("questions.csv", '\r\n' + msg, {flag: 'a+', encoding: 'UTF8'}, function(err) {
			if(err) throw err;
		})


	});
});
