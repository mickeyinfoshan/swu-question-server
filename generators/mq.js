
/**
 * 对数字类问题提问
 */

var pushQuestions = require("../tools/pushQuestions.js");
var componentReplace = require("../tools/componentReplace.js")

function mqQuestion(sentence){
	var mqs = [];
	for(var wordIndex = 0; wordIndex<sentence.length-1;){
		var word = sentence[wordIndex];
		var nextWord = sentence[wordIndex+1];
		var mqList = [];
		if(word.pos == 'm'){
			mqList = [word];
			for(var wi = wordIndex+1;wi<sentence.length-1;wi=wi+1){
				var wi_next = wi + 1;
				if(sentence[wi].pos == 'm'){
					mqList.push(sentence[wi]);
				}else if(sentence[wi].pos=='q'){
					var lastQId = sentence[wi_next].id;
					mqList.push(sentence[wi]);
				}
				if(sentence[wi].pos == 'm' && sentence[wi_next].pos != 'q' && sentence[wi_next].pos != 'm') {
					break;
				}
				if(sentence[wi].pos == 'q' && sentence[wi_next].pos != 'm') {
					lastQId = sentence[wi_next].id;
					break;
				}
			}
			//mqs里存放多组数字类关键字
			mqs.push(mqList);
			wordIndex = wordIndex + mqList.length;
		}
		else{
			wordIndex++;
		}
	}
	var questions = [];
	for(var mqIndex = 0; mqIndex<mqs.length; mqIndex++){
		var mq = mqs[mqIndex];
		var text = "";
		for(var wordIndex = 0; wordIndex<sentence.length; wordIndex++){		
			var word = sentence[wordIndex];
			var indexOfWord = mq.indexOf(word);
			var lastIndexOfWord = mq.lastIndexOf(word)
			if(indexOfWord<0 || word.id == lastQId-1){
				text = text + word.cont;
				//console.log(text);
			}
			if(indexOfWord==0){
				text = text + '多少';
			}
		}
		var newQuestion = {
			text : text,
			label : 'mq'
		};
		questions = pushQuestions(questions,newQuestion);
	}
	return questions;
}

module.exports = mqQuestion;