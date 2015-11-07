module.exports = function(text) {

	var t = text.replace(/^\([^]*\)$/g, '');
	t = t.replace(/^（[^]*）$/g, '');
	return t;

	var lbz = text.indexOf('（');
    var lby = text.indexOf('(');
    while(lbz>=0 || lby>=0) {
        if(lbz>=0) {
            var rb = text.indexOf('）');
            var lb = lbz;
        }else {
            rb = text.indexOf(')');
            lb = lby;
        }
        text = text.substring(0,lb) + text.substring(rb+1);
        lbz = text.indexOf('（');
        lby = text.indexOf('(');
    }
    return text;
}