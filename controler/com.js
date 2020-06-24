const jwt  = require('jsonwebtoken');
const { RET, LOGIN_DURATION, OVERDUE_RES, SSVIP_EMAIL } = require('./constant');
const sitedb = require('../model/currentDbs')

const {
	isLegal,
	isLegalExps,
	getStrChartLen,
	fromatIOSDate
} = require('../model/common.js')

// {_id, name, is_async: is_super}
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
		res.json(failed('', ptn + ' Illegitimate'));
	}
	return ok;
}
exports.checkLegalExps = (res, str, ptn) => {
	const ok = isLegalExps(str)
	if (!ok) {
		res.json(failed('', ptn + ' Illegitimate'));
	}
	return ok;
}


const isUserLogin = (token) => {
	// console.log(token)
	let result = null;
	if (!token) {
		return {}
	}
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
		result = {};

	}
	// console.log(result)
	return result;
	// req.session.user_id === req.cookies.user_id
}
exports.isUserLogin = isUserLogin;
const checkUserLogin = (req, res) => {
	const token = req.headers.authorization;
	const user_id = req.cookies.user_id
	const ust = isUserLogin(token)
	// console.log(ust, user_id)
	if (user_id === undefined || ust._id === undefined || ust._id !== user_id) {
		res.json(failed('', 'token已过期, 请重新登录！', OVERDUE_RES))
		// res.redirect('/')
		return false;
	}
	return ust;
}
exports.checkUserLogin = checkUserLogin
/*exports.setSessionCookie = (req, res) => {
	const sessionCookie = md5(Math.random() + Date.now())
	// const sessionStatus = md5(Math.random() + 2 + Date.now())
	req.session.token = sessionCookie;
	res.cookie('sessionCookie', sessionCookie)
}*/

exports.getCode = (count=6) => {
	let code = '';
	for (let i = 0; i < count; i++) {
		code += Math.floor(Math.random() * 36).toString(36)
	}
	return code;
}

exports.checkPsw = (psw='') => {
	const pswlen = psw.length
	const pswstrlen = getStrChartLen(psw);
	const ok1 = pswstrlen <= 14 && pswstrlen >= 8
	const ok2 = /(?=.*[a-zA-Z0-9])(?=.*[^a-zA-Z0-9]).{2,14}/.test(psw)
	const ok3 = pswlen > 0 && !(/[\s\u4e00-\u9fa5]/.test(psw))
	return ok1 && ok2 && ok3
}

exports.get$rated$val = (list, ip='', user_id='') => {
	let length = list.length;
	let isRated = false;
	let value = 0;
	for (let i = 0; i < length; i++) {
		const item = list[i]
		if (!isRated && (user_id === item.user_id || ip === item.user_ip)) {
			isRated = true;
		}
		value += item.value || 0;
	}
	return {
		isRated,
		value,
		length
	}
}

exports.recheckReplyList = list => {
	list.forEach(rpit => {
		let [user={}, touser={}] = rpit.user
		if (rpit.user_id == touser._id) {
			[touser, user] = [user, touser]
		}
		rpit.create_time = fromatIOSDate(rpit.create_time)

		rpit.user_name = user.name
		rpit.user_face = user.face
		rpit.to_user_name = touser.name
		rpit.to_user_face = touser.face
		delete rpit.user;
	})
	return list
}


exports.isSuperVip = async (req, res) => {
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return false;
	}
	const { _id: user_id } = ust;
	const [user] = await sitedb.find('users', {_id: user_id})
	const { is_super, email } = user;
	if (!is_super || email !== SSVIP_EMAIL) {
		res.json(failed('', 'Insufficient authority !'));
		return false
	}
	return ust;
}