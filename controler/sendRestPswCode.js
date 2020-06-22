const sitedb = require('../model/currentDbs')
const {
	sendMail,
	findOneAndUpdate,
	trim,
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	getCode,
	checkLegal,
} = require('./com')

const { MAIL_MAX_COUNT, RESET_PASSWORD_CODE } = require('./constant');

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let { name } = req.body;
	name = trim(name);
	if (!checkLegal(res, name, '用户名')) {
		return ;
	}
	const [user] = await sitedb.find('users', {$or: [{name}, {email: name}]})
	if (!user) {
		return res.send(failed('', '请检查用户名是否填写正确！'))
	}
	const { email } = user;
	// console.log('send reg mail', email)
	let code = getCode()
	// req.session.regMailCode = code;
	// req.session.regMail = email;
	// sitedb.find('reg_code', {email})
	sendMail(email, '[有趣实用网-更多有趣更多好玩]', `注册验证码：<span style="color: red;">${code}</span>， ${REG_CODE_EXP/60/1000}分钟内有效，请及时使用！`).then(okres => {
		sitedb.findOneAndUpdate('reg_code', {email, type: RESET_PASSWORD_CODE}, {
			$set: {
				code,
			},
			$inc:{times:1}
		}, {
			new: true
		}).then(result => {
			// console.log(res)
			const { value } = result;
			if (value) {
				if (value.times - 1 >= MAIL_MAX_COUNT) {
					return res.json(failed('', `邮件发送失败，今天已超过${MAIL_MAX_COUNT}次数`))
				}
				res.json(success('', '验证码已发送，请注意查收!'))
			} else {
				sitedb.insertOne('reg_code', {
					email,
					code,
					date: new Date(),
					times: 1,
					type: RESET_PASSWORD_CODE
				}).then(r => res.json(success('', '验证码已发送，请注意查收!')))
			}
		})
		
	}).catch(err => {
		console.log('send reg mail', err)
		res.json(failed('', '邮件发送失败，请检查邮箱是否正确!'))
	})
}


/*sitedb.findOneAndUpdate('reg_code', {email: '213'}, {
	$set: {
		code: '2345',
		date: new Date(),
	},
	$inc:{times:1}
}, {
	new: true,
}).then(res => {
	console.log('res', res)
}).catch(res => {
	console.log(res)
})*/