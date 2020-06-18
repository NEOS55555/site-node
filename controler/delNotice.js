const sitedb = require('../model/currentDbs')

const {
	prevCheck,
	success, 
	failed,
	isSuperVip,
	checkLegal
} = require('./com')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = await isSuperVip(req, res);
	if (!ust) {
		return ;
	}
	let { _id, isToCommit } = req.query;
	_id = parseInt(_id);
	if (!checkLegal(res, _id, '_id')) {
		return;
	}
	
	sitedb.findOneAndDelete('notices', {_id}).then(result => {
		const { commit_id } = result.value
		if (commit_id && parseInt(isToCommit) === 1) {
			sitedb.deleteMany('comments', {_id: commit_id})
		}
		res.json(success())
	})
}