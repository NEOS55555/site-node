const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	recheckReplyList
} = require('./com')
const {
	fromatIOSDate,
} = require('../model/common.js');
const { replyGetUsersql } = require('../model/comsql')

const {
	NORMAL_CODE,
} = require('./constant')

// user_id可以加上
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	let { pageIndex=1, isTotal, pageSize=10 } = req.query;
	const { _id: user_id } = ust;

	const $facet = {
		list: [
			{ $sort: {create_time: -1} },
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
			replyGetUsersql
		],
	}
	if (isTotal) {
		$facet.total = [{$count: 'list_total'}]
	}
	sitedb.aggregate('comments', [
		// 把自己回复自己排除掉
		{ $match: { to_user_id: user_id, user_id: { $ne: user_id } } },
		{ $facet }
	]).then(result => {

		let { list, total: total_temp } = result[0] || {};

		list = recheckReplyList(list)
		if (isTotal) {
			const total = (total_temp[0] || {}).list_total || 0
			res.json(success({list, total}))
		} else {
			res.json(success({list}))
		}
	}).catch(err => {console.log(err);res.json(failed('', 'error'))})
	/*sitedb.aggregate('sites', [
		{ $match: { create_user_id: user_id, status: NORMAL_CODE } },
		{ $skip: pageSize * (pageIndex - 1) },
		{ $limit: pageSize },
	    {
	        $lookup: {
	            from: "comments",
	            let: { site_id: "$_id" },
	            pipeline: [
	                { $match: {  } },
	                { $limit: pageSize }
	            ],
	            as: "reply_arr"
	        },
	    }
	])*/
}