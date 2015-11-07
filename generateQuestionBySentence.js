var wipeNeedlessComponent = require("./tools/wipeNeedlessComponent.js");
var srlGenerateQuestionsBySentence = require("./generators/srl.js");
var posGenerateQuestionsBySentence = require("./generators/pos.js");
var lastQuestionsBySentence = require("./generators/last.js")
var mqQuestion = require("./generators/mq.js")
var pushQuestions = require("./tools/pushQuestions.js")

function generateQuestionBySentence(sentence) {
    var questions = [];
    var sentence = wipeNeedlessComponent(sentence);
    var srlQuestions = srlGenerateQuestionsBySentence(sentence);
    var posQuestions = posGenerateQuestionsBySentence(sentence);
    var lastQuestions = lastQuestionsBySentence(sentence);
    var mqQuestions = mqQuestion(sentence);
    for(var i = 0; i<srlQuestions.length; i++){
        questions = pushQuestions(questions,srlQuestions[i]);
    }
    for(i = 0; i<posQuestions.length; i++) {
        questions = pushQuestions(questions,posQuestions[i]);
    }
    for(i = 0; i<lastQuestions.length; i++) {
        questions = pushQuestions(questions,lastQuestions[i]);
    }
    for(i = 0; i<mqQuestions.length; i++) {
        questions = pushQuestions(questions,mqQuestions[i]);
    }
    return questions;
}

module.exports = generateQuestionBySentence;