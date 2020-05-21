const jwt  = require('jsonwebtoken');
const { RET, LOGIN_DURATION } = require('./constant');
const sitedb = require('../model/currentDbs')

const {
	getNextSequenceValue, 
	isLegal
} = require('../model/common.js')

const jwtSign = params => jwt.sign({ ...params, iat: Math.floor(Date.now() / 1000) },  RET, { expiresIn: LOGIN_DURATION })
const jwtVerify = token => jwt.verify(token, RET)
exports.jwtSign = jwtSign;
exports.jwtVerify = jwtVerify;

const success = (result, msg='success', params={}) => {
	return {
		resultCode: 200,
		resultMessage: msg,
		result,
		...params
	}
}
const failed = (result, msg='failed', params={}) => {
	// result && console.log(result);
	return {
		resultCode: 111,
		resultMessage: msg,
		result,
		...params
	}
}
exports.success = success;
exports.failed = failed;

const checkToken = (req, res) => {
	// console.log(req.session.token, ',', req.cookies.sessionCookie)
	const isOk = req.session.token === req.cookies.sessionCookie
	if (!isOk) {
		res.json(failed('', 'token失效, 请刷新页面！'))
	}
	return isOk;
}

// 用回调的形式，看是否
exports.prevCheck = (req, res) => {
	if (!checkToken(req, res)) {
		return false;
	}
	// sitedb.response = res;
	return true;
}
exports.checkLegal = (res, str, ptn) => {
	const ok = isLegal(str)
	if (!ok) {
		res.json(failed('', ptn + '不合法！'));
	}
	return ok;
}


const isUserLogin = (token) => {
	// console.log(token)
	let result = null;
	try {
		const res = jwtVerify(token)
		const { exp } = res, current = Math.floor(Date.now() / 1000);
		// console.log(res, current <= exp)
		// result._id
		if (current <= exp) {
			// res = result.data || {};
			result = res;
		}
	} catch (err) {
		// console.log(err)
		result = null;

	}
	// console.log(result)
	return result;
	// req.session.user_id === req.cookies.user_id
}
exports.isUserLogin = isUserLogin;
exports.checkUserLogin = (req, res) => {
	const token = req.headers.authorization;
	const user_id = req.cookies.user_id
	const ust = isUserLogin(token)
	if (ust._id !== user_id ) {
		res.json(failed('', 'token已过期, 请重新登录！', {resultCode: 233}))
		return false;
	}
	return ust;
}

/*exports.setSessionCookie = (req, res) => {
	const sessionCookie = md5(Math.random() + Date.now())
	// const sessionStatus = md5(Math.random() + 2 + Date.now())
	req.session.token = sessionCookie;
	res.cookie('sessionCookie', sessionCookie)
}*/

