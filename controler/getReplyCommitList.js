const sitedb = require('../model/currentDbs')
const { replyGetUsersql } = require('../model/comsql')
const {
	prevCheck,
	success, 
	failed,
	recheckReplyList
} = require('./com')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}

	let { site_id, commit_id, pageIndex=1, pageSize=10 } = req.query;
	site_id = parseInt(site_id);
	commit_id = parseInt(commit_id);
	
	const conditoin = { site_id, commit_id, to_user_id: { $exists: true } }
	
	sitedb.aggregate('comments', 
		[
			{ $match: conditoin },
			{ $sort: {create_time: 1} },
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
			replyGetUsersql,
		]
	).then(async list => {
		list = recheckReplyList(list)
		res.json(success({list}))
	})
}