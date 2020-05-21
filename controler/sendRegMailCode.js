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
} = require('./com')

const { MAIL_MAX_COUNT } = require('./constant');

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
	console.log('send reg mail', email)
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += Math.floor(Math.random() * 36).toString(36)
	}
	// req.session.regMailCode = code;
	// req.session.regMail = email;
	// sitedb.find('reg_code', {email})
	sendMail(email, '验证码', `验证码${code}`).then(okres => {
		sitedb.findOneAndUpdate('reg_code', {email}, {
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
					return res.json(failed('', `邮件发送失败，已超过${MAIL_MAX_COUNT}次数`))
				}
				res.json(success('', '验证码已发送，请注意查收!'))
			} else {
				sitedb.insertOne('reg_code', {
					email,
					code,
					date: new Date(),
					times: 1
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