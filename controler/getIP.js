const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')
const {
	// getClientIP, 
	getNextSequenceValue, 
} = require('../model/common.js')
const {
	isUserLogin,
	success, 
	failed,
} = require('./com')

module.exports = async (req, res, next) => {
	// req.session.destroy()
	const sessionCookie = md5(Math.random() + Date.now())
	// const sessionStatus = md5(Math.random() + 2 + Date.now())
	req.session.token = sessionCookie;
	// console.log(sessionCookie)
	res.cookie('sessionCookie', sessionCookie)
	getNextSequenceValue(sitedb, 'site_views')
	const {_id, name, is_async} = isUserLogin(req.headers.authorization)
	let o = {}
	if (_id) {
		const [user] = await sitedb.find('users', {_id})
		o = {
			is_async,
			check_reply_num: user.check_reply_num
		}
	}
	res.json(success(o))
	// res.cookie('sessionStatus', sessionStatus)
	// res.json((getClientIP(req)))
}