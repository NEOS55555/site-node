const sitedb = require('../model/currentDbs')
const {
	deleteFolder,
	// isLegal
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin
} = require('./com')


// 删除网站
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	const { _id } = ust;
	sitedb.updateOne('users', {_id}, { $set: { check_reply_num: 0 } }).then(result => {
		res.json(success())
	})
	
}