const sitedb = require('../model/currentDbs')
const { superEmail, REG_CODE_EXP, RET, LOGIN_DURATION } = require('./constant');
const {
	prevCheck,
	checkLegal,
	success, 
	failed,
	jwtSign
} = require('./com')
const md5 = require('../model/md5.js')

const {
	getClientIP, 
	getNextSequenceValue, 
	checkMail,
	trim,
} = require('../model/common.js')
// 注册用户
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}

	const ip = getClientIP(req);
	let {name='', password: psw='', email='', code} = req.body;
	name = trim(name);
	psw = trim(psw);
	email = trim(email);

	if (!checkLegal(res, name, '用户名')) {
		return ;
	}
	if (!psw) {
		return res.send(failed('', '密码不能为空！'));
	}
	if (!checkMail(email)) {
		res.send(failed('', '邮箱不合法！'))
		return ;
	}
	const password = md5(psw);
	/*if (!checkMail(email)) {
		res.send(failed('', '邮箱不合法！'))
		return ;
	}*/
	const siteList = await sitedb.find('users', {$or: [{name}, {email}]})
	if (siteList.length > 0) {
		let errorInfo = '';
		if (siteList.find(it => it.name === name)) {
			errorInfo = '用户名已存在！';
		} else {
			errorInfo = '该邮箱已被注册！';
		}
		return res.send(failed('', errorInfo))
	}
	const [codeItem] = await sitedb.find('reg_code', {email, code})

	if (!codeItem) {
		// if ()
		return res.json(failed('', '验证码不正确！'))
	}
	// REG_CODE_EXP
	const { date } = codeItem;
	if (Date.now() - date.getTime() > REG_CODE_EXP) {
		return res.json(failed('', '验证码已过期！'))
	}

	getNextSequenceValue(sitedb, 'userId').then(async t_id => {
		const _id = md5(t_id);
		const is_super = superEmail.indexOf(email) > -1
		sitedb.insertOne('users', {
			_id,
			name,
			psw,
			password,
			email,
			ip,
			is_super
		}).then(result => {
			// 
			const token = jwtSign({_id, name, is_async: is_super})
			res.json(success({_id, name, token}, '注册成功！'))
		}).catch(err => {
			res.json(failed(err))
		})
	}).catch(err => {
		res.json(failed(err))
	})
}