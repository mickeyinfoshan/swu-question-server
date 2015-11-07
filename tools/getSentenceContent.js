module.exports = function(sentence) {

	return sentence.reduce(function(prev, cur){
		return prev + cur.cont
	},"");
};