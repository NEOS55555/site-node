const sitedb = require('../model/currentDbs')
const { REG_CODE_EXP, RESET_PASSWORD_CODE } = require('./constant');
const {
	prevCheck,
	success, 
	failed,
	checkLegal,
} = require('./com')

const {
	trim,
} = require('../model/common.js')

const md5 = require('../model/md5.js')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let {name='', password: psw='', code} = req.body;
	name = trim(name);
	psw = trim(psw);
	if (!checkLegal(res, name, '用户名')) {
		return ;
	}
	if (!psw) {
		return res.send(failed('', '密码不能为空！'));
	}
	const password = md5(psw);

	const [user] = await sitedb.find('users', {$or: [{name}, {email: name}]})
	if (!user) {
		return res.send(failed('', '该用户不存在！'))
	}
	const { email, name: t_name } = user;
	const [codeItem] = await sitedb.find('reg_code', {email, code, type: RESET_PASSWORD_CODE})
	// console.log(email, t_name, code, codeItem)
	if (!codeItem) {
		// if ()
		return res.json(failed('', '验证码不正确！'))
	}
	const { date } = codeItem;
	if (Date.now() - date.getTime() > REG_CODE_EXP) {
		return res.json(failed('', '验证码已过期！'))
	}

	sitedb.updateOne('users', {
		name: t_name,
		email,
	}, {
		$set: {
			psw,
			password
		}
	}).then(r => res.json(success(r.result, '密码修改成功！')))
}