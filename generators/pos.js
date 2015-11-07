
/**
 * 词性标注（pos）问题 || 这段是依存句法（ne）问题
 */

var pushQuestions = require("../tools/pushQuestions.js");
var componentReplace = require("../tools/componentReplace.js")

module.exports = posGenerateQuestionsBySentence;
function posGenerateQuestionsBySentence(sentence) {
    var questions = [];
    for(var i = 0; i<sentence.length; i++) {
        var word = sentence[i];
        if(word.ne == 'O')
            continue;
        newQuestion = posGenerateQuestionByWord(sentence,word);
        if(newQuestion)
            questions = pushQuestions(questions,newQuestion);
    }
    return questions;
}

function posGenerateQuestionByWord(sentence,word) {
    var rpcLbl = posGetReplacementAndLabel(word);
    if(!rpcLbl)
        return null;
    var question = {
        label : rpcLbl.label,
        text : replaceNode(sentence,word,rpcLbl.replacement)
    };
    return question;
}

function posGetReplacementAndLabel (word) {
    var rpcLblFactory = function(rpc,lbl){
        return {
            replacement : rpc,
            label : lbl
        }  ;
    };
    var rpcLblArray = [
        rpcLblFactory('谁', '人名'),
        rpcLblFactory('哪家机构', '机构名'),
        rpcLblFactory('哪里', '地点')
    ];
    var rpcLbl = null;
    //Nh:人名 Ni:机构名 Ns:地名
    var posArray = ['S-Nh','S-Ni','S-Nl','S-Ns'];
    var posArray2 = ['E-Nh','E-Ni','E-Nl','E-Ns'];
    for(var i = 0; i<posArray.length; i++) {
        if(word.ne.indexOf(posArray[i])>=0) {
            rpcLbl =  rpcLblArray[i];
            if(i == 3){
                rpcLbl = rpcLblArray[2];
            }
            break;
        }
    }
    for(var i = 0; i<posArray.length; i++) {
        if(word.ne.indexOf(posArray2[i])>=0) {
            rpcLbl =  rpcLblArray[i];
            if(i == 3){
                rpcLbl = rpcLblArray[2];
            }
            break;
        }
    }
    if(!rpcLbl)
        return null;
    if(word.relate=="ATT") {
        rpcLbl.replacement += "的";
    }
    return rpcLbl;
}

function replaceNode(sentence,word,replacement) {
    var isReplaced = false;
    var str = "";
    for(var wordIndex = 0; wordIndex<sentence.length; wordIndex++){
        var thisWord = sentence[wordIndex];
        if(thisWord == word || isAncestor(sentence,word,thisWord)){
            if(!isReplaced){
                str += replacement;
                isReplaced = true;
            }
        }
        else{
            str += thisWord.cont;
        }
    }
    return str;
}

//判断当前词和关键词是否存在可替换的依存关系
function isAncestor(sentence,word1,word2){
    if(word2.parent == word1.id/* || (word1.parent == -1 && word2.parent != -1)*/){
        return true;
    }
    else if (word2.parent == -1){
        return false;
    }else{
        return isAncestor(sentence,word1,sentence[word2.parent]);
    }
}
