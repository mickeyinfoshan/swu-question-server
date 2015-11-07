
/**
 * 精简句子成分
 */

 //思路：如果句子成分relate存在A0+HED+A1，则精简掉A1+符号后的句子 && 先一步一步来，判断是否有HED,HED wrap A0 & A1
 function wipeNeedlessComponent(sentence) {
 	for(var wordIndex = 0; wordIndex < sentence.length; wordIndex++) {
 		var word = sentence[wordIndex],
 			isA0 = false,
 			isHED = false,
 			isA1 = false,
 			isNew = false;
 		if(word.relate == 'HED' && word.parent == -1) {
 			isHED = true;
 			var HEDId = word.id;
 			//console.log('isHED' + HEDId);
 			//在HED的arg中查询是否有A0和A1
 			if(word.arg.length != 0) {
 				for(var componentIndex = 0; componentIndex < word.arg.length; componentIndex++) {
 					var component = word.arg[componentIndex];
 					if(component.type == 'A0') {
 						isA0 = true;
 						var A0_end = component.end;
 					}else {
 						//如果没有A0，检查是否在HED词前有SBV结构，可以充当A0
			 			for(var SBVIndex = 0; SBVIndex < wordIndex; SBVIndex++) {
			 				var sbv = sentence[SBVIndex];
			 				if(sbv.relate == 'SBV' && sbv.parent == HEDId) {
			 					isA0 = true;
			 				}
			 			}
 					}//else
 					if(isA0) {
	 					for(var nextComponentIndex = componentIndex + 1; nextComponentIndex < word.arg.length; nextComponentIndex++) {
	 							var nextComponent = word.arg[nextComponentIndex];
	 							if(nextComponent.type == 'A1') {
	 								isA1 = true;
	 								var A1Id = nextComponent.end;
	 								break;
	 							}
	 					}//for->nextComponent
						if(isA1) {
							break;
						}
					}
 				}//for->componentIndex
 			}else {
 				continue;
 			}
 			if(!isA1) {
 				return sentence;
 			}
	 		//当A0和A1都有了的情况下才能执行这里
	 		for(var wpIndex = wordIndex + 1; wpIndex < sentence.length; wpIndex++) {
	 			var wpWord = sentence[wpIndex];
	 			if(wpWord.pos == 'wp' && wpWord.parent == HEDId && wpWord.id > A1Id) {
	 				wpWord.cont = '。';
	 				var wipeComponent = {
	 					beg : wpWord.id + 1,
	 					end : sentence.length -1
	 				},
	 				sentence = JsonReplace(sentence,wipeComponent);
	 				isNew = true;
	 				break;
	 			}
	 		}
 		}
 		if(isNew) {
 			break;
 		}
 	};//for->wordIndex
 	return sentence;
 }


 function JsonReplace(sentence,component) {
 	sentence = sentence.slice(0, component.beg);
 	return sentence;
 }

 module.exports = wipeNeedlessComponent;