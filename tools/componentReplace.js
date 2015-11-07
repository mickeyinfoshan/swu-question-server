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

module.exports = componentReplace;