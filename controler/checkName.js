const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	prevCheck,
	success, 
	failed,
	checkUserLogin
} = require('./com')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let { name } = req.query;
	
	const [user] = await sitedb.find('users', {name})
	
	res.json(success(!!user))
}