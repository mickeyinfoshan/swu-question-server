
/**
 * 语义角色标注（srl）问题
 */
function srlGenerateQuestionsBySentence(sentence) {
    var questions = [];
    for(var wordIndex = 0; wordIndex<sentence.length; wordIndex++){
        var word = sentence[wordIndex];
        var newQuestions = srlGenrateQuestionsByWord(sentence,word);
        for(var qi = 0;qi<newQuestions.length;qi++){
            questions = pushQuestion(questions,newQuestions[qi]);
        }
    }
    return questions;
}

function srlGenrateQuestionsByWord(sentence,word) {
    var questions = [];
    if(word.arg.length != 0) {
        //先查找是否有component.type=='A0'||'A1'的词，如果有，将这个词赋值给A0|A1
        for(var componentIndex = 0; componentIndex<word.arg.length; componentIndex++){
            var component = word.arg[componentIndex];
            if (component.type=='A0') {
                A0 = component;
            };
            if (component.type=='A1') {
                A1 = component;
            };
        }
        for(var componentIndex = 0; componentIndex<word.arg.length; componentIndex++){
            var component = word.arg[componentIndex];
            var newQuestion = srlGenrateQuestionByComponent(sentence, component);
            if(newQuestion)
                questions = pushQuestion(questions, newQuestion);
        }
    }
    return questions;
}

//component是当前词的arg
function srlGenrateQuestionByComponent(sentence, component) {
    var ruleFactory = function(srl,label,rpc){
        return {
            srl : srl,
            label : label,
            replacement : rpc
        };
    };
    var rules = [
        ruleFactory('LOC','地点状语','在哪里'),
        ruleFactory('TMP','时间状语','什么时候'),
        ruleFactory('A0','动作施事类','谁')
    ];
    for(var i = 0; i<rules.length; i++) {
        var rule = rules[i];
        if(component.type == rule.srl) {
            var replacement = rule.replacement;
            var text = null;
            if(component.type == 'TMP') {
                replacement = getTMPReplacement(sentence,component);
                if(!replacement) {
                  return false;
                }              
            }
            if(component.type == 'A0') {
                A0 = component;
                var currA0pos = sentence[component.end].pos;
                if(/(n|nd|nz|ni)$/.test(currA0pos)) {
                  replacement = '什么';
                }else if(/ns/.test(currA0pos)) {
                  return false;
                }
                text = componentReplace(sentence,component,replacement);
            }
            else{
                // if(A0){
                //     var sentence_ = removeComponent(sentence,component);
                //     replacement = getComponentStr(sentence,A0) + replacement;
                //     console.log(replacement);
                //     text = componentReplace(sentence_,A0,replacement);
                // }
                // else{
                    text = componentReplace(sentence,component,replacement);
                // }
            }
            var question = {
                label : rule.label, 
                text : text
            };
            return question;
        }
    }
}

//根据要替换词的起始位置替换句子，返回被替换后的句子
function componentReplace(sentence,component,replacement){
    var str = "";
    if(component.beg == 0){
        str += replacement;
        for(var i = component.end + 1; i<sentence.length; i++){
            str += sentence[i].cont;
        }
        return str;
    }
    for(var i = 0; i<sentence.length; i++) {
        var word = sentence[i];
        if(word.id<component.beg || word.id>component.end) {
            str += word.cont;
        }
        if(i == component.beg-1){
            str += replacement;
        }
    }
    return str;
}

//得到component对应的词
function getComponentStr(sentence,component) {
    var str = ""
    for (var i = component.beg; i<=component.end; i++) {
        str += sentence[i].cont;
    }
    return str;
}

//得到对时间提问的疑问词
function getTMPReplacement(sentence, component) {
    var componentStr = getComponentStr(sentence, component);
    if(componentStr.indexOf('最近') > -1 || componentStr.indexOf('以前') > -1 || componentStr.indexOf('此时') > -1 || componentStr.indexOf('此刻') > -1 ) {
      return false;
    }
    if(componentStr.indexOf('日')> -1) {
        return '哪一天';
    }
    if(componentStr.indexOf('月')> -1) {
        return '哪个月';
    }
    if(componentStr.indexOf('年')> -1){
        return '哪一年';
    }
    if(componentStr.indexOf('世纪')> -1) {
        return '哪个世纪';
    }
    else
        return '什么时候';
}

//得到去掉component后的句子
function removeComponent(sentence,component) {
    var sent = [];
    for(var i = 0; i<sentence.length; i++) {
        var word = sentence[i];
        if(i<component.beg || i>component.end) {
            sent.push(word);
        }
    }
    return sent;
}
