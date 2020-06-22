const sitedb = require('../model/currentDbs')
const {
	checkMail,
	sendMail,
	findOneAndUpdate,
	// getCookie
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	getCode,
} = require('./com')

const { MAIL_MAX_COUNT, REGISTER_CODE, REG_CODE_EXP } = require('./constant');

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const { email } = req.body;
	if (!checkMail(email)) {
		res.send(failed('', '邮箱不合法！'))
		return ;
	}
	const siteList = await sitedb.find('users', {email})
	if (siteList.length > 0) {
		return res.send(failed('', '该邮箱已被注册！'))
	}
	// console.log('send reg mail', email)
	let code = getCode();
	// req.session.regMailCode = code;
	// req.session.regMail = email;
	// sitedb.find('reg_code', {email})
	sendMail(email, '[有趣实用网-更多有趣更多好玩]', `注册验证码：<span style="color: red;">${code}</span>， ${REG_CODE_EXP/60/1000}分钟内有效，请及时注册！`).then(okres => {
		sitedb.findOneAndUpdate('reg_code', {email, type: REGISTER_CODE}, {
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
					type: REGISTER_CODE
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