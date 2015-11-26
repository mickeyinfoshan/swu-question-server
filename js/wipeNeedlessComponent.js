

/**
 * 精简句子成分
 */

//思路：如果句子成分relate存在A0+HED+A1，则精简掉A1+符号后的句子 && 先一步一步来，判断是否有HED,HED wrap A0 & A1
function wipeNeedlessComponent(sentence) {
    sentence = filterQuestionMark(sentence);
    isNew = false;
    for (var wordIndex = 0; wordIndex < sentence.length; wordIndex++) {
        var word = sentence[wordIndex],
			isA0 = false,
			isHED = false,
			isA1 = false;
        if (word.relate == 'HED' && word.parent == -1) {
            isHED = true;
            var HEDId = word.id;
            //alert('isHED' + HEDId);
            //在HED的arg中查询是否有A0和A1
            if (word.arg.length != 0) {
                for (var componentIndex = 0; componentIndex < word.arg.length; componentIndex++) {
                    var component = word.arg[componentIndex];
                    if (component.type == 'A0') {
                        isA0 = true;
                        var A0_end = component.end;
                    } else {
                        //如果没有A0，检查是否在HED词前有SBV结构，可以充当A0
                        for (var SBVIndex = 0; SBVIndex < wordIndex; SBVIndex++) {
                            var sbv = sentence[SBVIndex];
                            if (sbv.relate == 'SBV' && sbv.parent == HEDId) {
                                isA0 = true;
                            }
                        }
                    }//else
                    if (isA0) {
                        for (var nextComponentIndex = componentIndex + 1; nextComponentIndex < word.arg.length; nextComponentIndex++) {
                            var nextComponent = word.arg[nextComponentIndex];
                            if (nextComponent.type == 'A1') {
                                isA1 = true;
                                var A1Id = nextComponent.end;
                                break;
                            }
                        }//for->nextComponent
                        if (isA1) {
                            break;
                        }
                    }
                }//for->componentIndex
            } else {
                continue;
            }
            if (!isA1) {
                return sentence;
            }
            //当A0和A1都有了的情况下才能执行这里
            for (var wpIndex = wordIndex + 1; wpIndex < sentence.length; wpIndex++) {
                var wpWord = sentence[wpIndex];
                if (wpWord.pos == 'wp' && wpWord.parent == HEDId && wpWord.id > A1Id) {
                    wpWord.cont = '。';
                    var wipeComponent = {
                        beg: wpWord.id + 1,
                        end: sentence.length - 1
                    },
						sentence = JsonReplace(sentence, wipeComponent);
                    isNew = true;
                    break;
                }
            }
        }
        if (isNew) {
            break;
        }
    };//for->wordIndex
    return sentence;
}


function JsonReplace(sentence, component) {
    sentence = sentence.slice(0, component.beg);
    return sentence;
}

function sentenceSlimplifer(sentence) {
    var allcentence = new Array();
    var i = 0;
    for (var wordIndex = 0; wordIndex < sentence.length; wordIndex++) {
        var word = sentence[wordIndex];
        var isCOO = false;
        var isHEd = false;
        var str1 = '';//主语的开始的id
        var str2 = '';//主语的结束的id
        var str3 = '';//宾语的开始的id 
        var str4 = '';//宾语的结束的id 

        var past = word.parent;//当前单词的父亲结点
        
        if ((word.relate == 'COO' && (past == -1 || sentence[past].relate == 'HED' || sentence[past].relate == 'COO')) || word.relate == 'HED') {//这样我们找到我们第一个关系为coo的谓语了（取消了第一个为coo 的主语的可能）

            isCOO = true;//在这里就假设所有的关系都是coo成立的
            var centencecoo = word.id;//记录下当前的id
            //	alert("hello world ");
            if (word.relate == 'HED') {
                isHEd = true;//为第一个句子
            }
            //alert(word.arg.length);
            var cooget = false;//标志符 是否找到了主语
            for (var componentIndex = 0; componentIndex < word.arg.length; componentIndex++) {
                var javasc = word.arg[componentIndex];

                if (javasc.type == 'A0') {
                    
                    //这样我们就很轻松的找到了coo句子的主语了。
                    cooget = true;
                    str1 = javasc.beg;//记录开始的id 和结尾的id
                    str2 = javasc.end;
                   
                }
            }
            if (cooget == false) { //没有找到

                var j = word.parent;//找他的父母是否存在主语
                if (isHEd == false) {//在谓语不是第一个的时候才找

                    do {
                        var icontent = sentence[j];
                        //alert(icontent.cont+i);
                        var key = false;


                        for (var cj = 0; cj < icontent.arg.length; cj++) {
                            var com = icontent.arg[cj];
                            
                            if (com.type == 'A0') {
                                key = true;
                                
                                str1 = com.beg;//还是记录在我们的str1和str2中
                                str2 = com.end;
                                

                            }
                        }
                        if (key == true) {
                            break;
                        }
                        else {
                            j = icontent.parent;//这样就一定能找到我们要的数据

                        }
                    } while (1)
                }
                else {
                    //console.log(allcentence);
                    return allcentence;//这里指的是没有主语的情况。
                }
            }

            if (isCOO == true) {
                isCOO = false;
                var binyu = false;
                for (var xj = 0; xj < word.arg.length; xj++) {
                    var c = word.arg[xj];
                    if (c.type == 'A1') {
                        //这样我们就很轻松的找到了coo句子的宾语了。
                        binyu = true;
                        str3 = c.beg;//记录开始的id 和结尾的id
                        str4 = c.end;
                       // alert(sentence[str3].cont);
                    }

                }
                if (binyu == false) {
                    str3 = str4 = -1;
                }
                if (binyu) {
                    binyu = false;
                }
                //                 alert("hello world");

                //                        	 var temper =new Array();


                //   	   if (str1==str2 && str3!=str4)

                //   	     temper.push(sentence[str1],word,sentence[str3],sentence[str4]);



                // 	  if (str1!=str2&&str3!=str4)
                // 	  	temper.push(sentence[str1],sentence[str2],word,sentence[str3],sentence[str4]);



                // 		if (str1!=str2&&str3==str4)
                // 			temper.push(sentence[str1],sentence[str2], word,sentence[str4]);
                // 	if(str1==str2&&str3==str4)
                // 		temper.push(sentence[str1],word,sentence[str4]);

                //   	 allcentence[i++]=temper;


                // 	// for (var j=0;j<temper.length;j++){
                // 	//    	alert(allcentence[i-1][j].cont);

                // 	//    }
                //               temper=null;
                // //	alert(i+allcentence[i-1]);

                if (str1 >= 0 && str2 >= 0 && str3 > 0 && str4 > 0) {
                    //console.log(sentence[str1].cont);
                    if (str1 == str2 && str3 != str4) {

                        allcentence[i] = sentence[str1].cont + word.cont;

                        for (var jax = str3; jax <= str4; jax++) {
                            allcentence[i] += sentence[jax].cont;
                        }
                        jax = 0;
                        i++;
                        //alert(allcentence[i-1]);
                    }
                    if (str1 != str2 && str3 != str4) {
                        allcentence[i] = sentence[str1].cont;
                        for (jax = str1 + 1; jax <= str2; jax++) {
                            allcentence[i] += sentence[jax].cont;
                           
                        }
                        jax = 0;
                        allcentence[i] += word.cont;
                        for (jax = str3; jax <= str4; jax++) {
                            allcentence[i] += sentence[jax].cont;
                        }
                        jax = 0;
                        i++;
                    }

                    if (str1 != str2 && str3 == str4) {

                        allcentence[i] = sentence[str1].cont;
                        for (jax = str1 + 1; jax <= str2; jax++) {
                            allcentence[i] += sentence[jax].cont;
                        }
                        jax = 0;
                        allcentence[i] += word.cont + sentence[str4].cont;
                        i++;
                    }
                    if (str1 == str2 && str3 == str4) {
                        allcentence[i] = sentence[str2].cont + word.cont + sentence[str4].cont;
                        i++;
                        //alert(allcentence[i-1]);
                    }
                    //alert(word.cont);
                    //这还是有问题的 首先 在这里我们的数据是如何进行的整合的 这个才是真正的问题
                    //alert(i+allcentence[i-1]);

                }
            }

        }
        // alert(allcentence[i-1]);
    }

    return allcentence;
}


function temper(allcentence) {

}

