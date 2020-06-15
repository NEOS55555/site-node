// 获取最新评论
const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkLegal,
	recheckReplyList
} = require('./com')
const {
	FEEDBACK_SITEID
} = require('./constant')
const { replyGetUsersql } = require('../model/comsql')

module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const pageSize = 10;
	
	sitedb.aggregate('comments', [
		{$match: { site_id: {$ne: FEEDBACK_SITEID} }},
		{
			$facet: {
				list: [
					{ $sort: {create_time: -1} },
					{ $limit: pageSize },
					replyGetUsersql
				],
			}
		}
	]).then(result => {
		const list = recheckReplyList((result[0] || {}).list)
		res.json(success(list))
	})
}