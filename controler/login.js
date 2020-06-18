const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	checkLegal,
	success, 
	failed,
	checkPsw,
	jwtSign
} = require('./com')
const { 
	MAX_NAME_CHART,
	MIN_NAME_CHART
} = require('./constant');
const {
	trim,
	getStrChartLen
} = require('../model/common.js')

const md5 = require('../model/md5.js')


// 用户登录
module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	// const ip = getClientIP(req);
	let {name='', password: psw='', code} = req.body;
	name = trim(name);
	if (!checkLegal(res, name, '用户名')) {
		return ;
	}
	const nameChartLen = getStrChartLen(name)
	if (nameChartLen > MAX_NAME_CHART || nameChartLen < MIN_NAME_CHART) {
		return res.send(failed('', '用户名不符合要求！'))
	}
	// psw = trim(psw);
	if (!checkPsw(psw)) {
		return res.send(failed('', '密码不正确'));
	}
	if (code != req.session.loginCode) {
		return res.json(failed('', '验证码不正确!', {resultCode: 133}))
	}
	const password = md5(psw);
	sitedb.findOneAndUpdate('users', 
		{$or: [{name}, {email: name}]}, 
		{$set: {last_login_time: new Date()}}, 
		{new: true}
	).then(result => {
		const item = result.value;
		if (!item) {
			return res.json(failed('', '该用户不存在!'))
		}
		const { _id, name, password: curpsw, is_super, check_reply_num } = item;
		if (password !== curpsw ) {
			return res.json(failed('', '密码不正确!'))
		}
		res.cookie('user_id', _id)
		// req.session.user_id = _id;
		const token = jwtSign({_id, name, is_async: is_super})
		res.json(success({_id, name, token, is_async: is_super, check_reply_num}, '登录成功！'))
	})
}