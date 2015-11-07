//将新问题放入questions数组中
function pushQuestions(questions, newQuestion) {
    if(questions.length == 0){
        questions.push(newQuestion);
        return questions;
    }
    for (var questionIndex = 0; questionIndex<questions.length; questionIndex++) {
        question = questions[questionIndex];
        //console.log(newQuestion);
        if(newQuestion.text == question.text 
            && newQuestion.label == question.label) {
            /*if(newQuestion.label != question.label)
                question.label += (" | " + newQuestion.label);*/
            break;
        }
        if(questionIndex == questions.length - 1)
            questions.push(newQuestion);
    }
    return questions;
}

module.exports = pushQuestions;