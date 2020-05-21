var crypto = require('crypto');
function md5 (psw) {
	var md5 = crypto.createHash('md5');
	return md5.update(psw).digest('base64');
}
module.exports = function (str='') {
	if (!str) {
		return ''
	}
	str += '';
	let tempStr = '';
	for (let i = 0, len = str.length; i < len; i += 2) {
		tempStr += str[i];
	}
	const a = md5(tempStr + str);
	return md5(a.substr(1, 7) + a)
}

