#! /usr/bin/env node

var fs = require("fs");
var path = require("path");
var dir = process.argv[2] || process.cwd()
var mq = require("./makeQuestions.js");

fs.readdir(dir, function(err, files) {
	var output = [];
	function getQuestionsFromFile(index) {
		if(index >= files.length) {
			var outputString = "";
			output.forEach(function(row) {
				outputString += row.join(",");
				outputString += "\n";
			});
			console.log(outputString);
			fs.writeFile("questions.csv", outputString, function(err) {
				if(err) throw err;
			})
			return;
		}
		
		var file = files[index];
		if(!/.txt$/.test(file)) {
			return getQuestionsFromFile(index+1);
		}
		var text = fs.readFileSync(path.join(dir,file)).toString();
		mq(text, function(sentences) {
			sentences.forEach(function(sentence) {
				sentence.questions.forEach(function(question){
					var row = [];
					row[0] = file;
					row[1] = sentence.sentenceContent;
					row[2] = question.text;
					output.push(row);
				})
			});
			getQuestionsFromFile(index+1);
		});
	}
	getQuestionsFromFile(0);
	
});