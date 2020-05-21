const md5 = require('../model/md5.js')
const {
	getClientIP, 
} = require('../model/common.js')

module.exports = async (req, res, next) => {
	// req.session.destroy()
	const sessionCookie = md5(Math.random() + Date.now())
	// const sessionStatus = md5(Math.random() + 2 + Date.now())
	req.session.token = sessionCookie;
	res.cookie('sessionCookie', sessionCookie)
	// res.cookie('sessionStatus', sessionStatus)
	res.json((getClientIP(req)))

}