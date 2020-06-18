const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	trim,
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	checkLegal,
	isSuperVip
} = require('./com')
const {
	MAX_COMMIT_LEN
} = require('./constant')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = await isSuperVip(req, res);
	if (!ust) {
		return ;
	}
	let { content, _id, commit_id } = req.body;
	content = trim(content)
	if (!content || content.length > MAX_COMMIT_LEN) {
		return res.json(failed('', 'content eror'))
	}
	if (commit_id) {
		sitedb.updateOne('comments', { _id: commit_id }, { $set: { content } })
	}
	/*if (!checkLegal(res, content, 'content')) {
		return;
	}*/
	
	sitedb.updateOne('notices', { _id }, { $set: { content } }).then(result => {
		res.json(success())
	}).catch(err => {
		console.log(err)
	})
	
}