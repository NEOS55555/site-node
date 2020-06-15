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
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	const { _id } = ust;
	const [user] = await sitedb.find('users', {_id})
	if (!user) {
		return res.json(failed('', 'user error!'))
	}
	res.json(success(user.face))
}