const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	jwtSign
} = require('./com')
const md5 = require('../model/md5.js')


// 用户登录
module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	// const ip = getClientIP(req);
	const {name='', password: psw='', email='', code} = req.body;
	if (code != req.session.loginCode) {
		return res.json(failed('', '验证码不正确!', {resultCode: 133}))
	}
	const password = md5(psw);
	sitedb.find('users', {$or: [{name}, {email}]}).then(([item]) => {
		if (!item) {
			return res.json(failed('', '该用户不存在!'))
		}
		const { _id, name, password: curpsw } = item;
		if (password !== curpsw ) {
			return res.json(failed('', '密码不正确!'))
		}
		// req.session.user_id = _id;
		const token = jwtSign({_id, name})
		res.json(success({_id, name, token}, '登录成功！'))
	})
}