
/**
 * 语义角色标注（srl）问题
 */

var pushQuestions = require("../tools/pushQuestions.js");
var componentReplace = require("../tools/componentReplace.js")

module.exports = srlGenerateQuestionsBySentence;

function srlGenerateQuestionsBySentence(sentence) {
    var questions = [];
    for(var wordIndex = 0; wordIndex<sentence.length; wordIndex++){
        var word = sentence[wordIndex];
        var newQuestions = srlGenrateQuestionsByWord(sentence,word);
        for(var qi = 0;qi<newQuestions.length;qi++){
            questions = pushQuestions(questions,newQuestions[qi]);
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
                questions = pushQuestions(questions, newQuestion);
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
        ruleFactory('NP','名词短语','什么'),
        ruleFactory('A0','动作施事类','什么')
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
            if (component.type == 'A0') {
                A0 = component;
                var currA0pos = sentence[component.end].pos;
               var currA0beginpos=sentence[component.beg].pos;
                if (/nz$/.test(currA0pos)) {    
                    replacement = '什么';
                     text = componentReplace(sentence, component, replacement);
                }
                else {
                   if (/n/.test(currA0pos)) {
                      
                
                     for(var j=component.beg;j<=component.end;j++)
                        {
                               
                           if (/u/.test(sentence[j].pos)){   
                             if(/n/.test(sentence[++j].pos)){
                                var rule=rules[2];
                                 replacement = rule.replacement;
                                    var text=null;  
                                       component=sentence[j];   
                                        }   
                                         text = componentReplaceU(sentence, component, replacement); 
                                  }
                           else{    
                              if(/SBV/.test(sentence[j].relate)){
                                     component=sentence[j];
                                    
                        
                                          replacement = '什么';
                                          
                                   text = componentReplaceU(sentence, component, replacement);
                                }   
                              else{ var componentStr = getComponentStr(sentence, component);
                                   if(componentStr.indexOf('人') > -1 || componentStr.indexOf('们') > -1 || componentStr.indexOf('警察') > -1 || componentStr.indexOf('农民') > -1                                     || componentStr.indexOf('果农')> -1) {
                          
                                     replacement='谁';
                                      text = componentReplace(sentence, component, replacement);
                                       }
                                       else{
                               replacement = '什么';
                                text = componentReplace(sentence, component, replacement);
                                }
                              }
                         }  
                     }  
                     
                    
                }
                  else{
                   if (/r/.test(currA0pos)) {
                         replacement = getReplacement(sentence,component);
                         if(!replacement) {
                               return false;
                              }              
                    
                   text = componentReplace(sentence, component, replacement);
                    }
                    else
                    return false;
               
                    
                }
             
               
            }
            }
            else {
               
                text = componentReplace(sentence, component, replacement);
        
            }
           var question = {
                label : rule.label, 
                text : text
            };
            return question;
        }
    }
}



//得到component对应的词
function getComponentStr(sentence,component) {
    var str = ""
    for (var i = component.beg; i<=component.end; i++) {
        str += sentence[i].cont;
    }
    return str;
}

function getReplacement(sentence, component) {
    var componentStr = getComponentStr(sentence, component);
    if(componentStr.indexOf('这') > -1 || componentStr.indexOf('那') > -1 || componentStr.indexOf('这里') > -1 || componentStr.indexOf('那里') > -1 || componentStr.indexOf('有的')> -1) {
      return false;
    }
    else
        return '谁';
}

function componentReplaceU(sentence,component,replacement){
    var str = "";
    for(var i = 0; i<sentence.length; i++) {
        var word = sentence[i];
        if(word.id<component.id || word.id>component.id) {
            str += word.cont;
        }
        if(i == component.id){
            str += replacement;
        }
    }
    return str;
}


//得到对时间提问的疑问词
function getTMPReplacement(sentence, component) {
    var componentStr = getComponentStr(sentence, component);
    if(componentStr.indexOf('日')>0) {
        return '哪一天';
    }
    if(componentStr.indexOf('月')>0) {
        return '几月份';
    }
    if(componentStr.indexOf('年')>0){
        return '哪一年';
    }
    if(componentStr.indexOf('世纪')>0) {
        return '几世纪';
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
