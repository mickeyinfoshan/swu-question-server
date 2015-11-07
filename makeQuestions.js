var analyze = require("./Analyze.js");
var generateQuestionBySentence = require("./generateQuestionBySentence.js");
var getSentenceContent = require("./tools/getSentenceContent");

module.exports = function(text, done) {
	analyze(text, function(paragraphs) {
		var result = [];
		paragraphs.forEach(function(paragraph) {
			paragraph.forEach(function(sentence) {
				result.push({
					sentence : sentence,
					sentenceContent : getSentenceContent(sentence),
					questions : generateQuestionBySentence(sentence),
				});
			});
		});
		done(result);
	});
};