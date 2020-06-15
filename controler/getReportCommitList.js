const sitedb = require('../model/currentDbs')
const { replyGetUsersql, user$project } = require('../model/comsql')
const {
	prevCheck,
	success, 
	failed,
	recheckReplyList
	// checkUserLogin,
	// get$rated$val
} = require('./com')
const {
	fromatIOSDate
} = require('../model/common.js')




module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}


	// const user_ip = getClientIP(req);
	let { site_id, pageIndex=1, isTotal } = req.query;
	site_id = parseInt(site_id);
	const pageSize = 10;
	
	const conditoin = { site_id }

	const commentReplyCdt = {
        $expr: {
            $and: [
                {
                    $eq: ['$commit_id', '$$cmt_id']
                }
            ]
        }
        
    }

	const $facet = {
		list: [
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
			{ $sort: {create_time: 1} },
			{
		        $lookup: {
		            from: "users",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { user_id: "$user_id" },
		            pipeline: [
		                { $match: {
	                        $expr: {
	                            $and: [
	                                {
	                                    $eq: ['$_id', '$$user_id']
	                                }
	                            ]
	                        }
	                        
	                    } },
		               	{ $project: user$project }
		            ],
		            as: "user"
		        },
		    },
			{
		        $lookup: {
		            from: "comments_reply",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { cmt_id: "$_id" },
		            pipeline: [
		               { $match: commentReplyCdt },
		               { $count: 'total' }
		            ],
		            as: "reply_total"
		        }
		    },
		    {
		        $lookup: {
		            from: "comments_reply",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { cmt_id: "$_id" },
		            pipeline: [
		                { $match: commentReplyCdt },
						{ $sort: {create_time: 1} },
		                { $limit: pageSize },
		                replyGetUsersql
		            ],
		            as: "reply_arr"
		        },
		    }
		]
	}
	if (isTotal) {
		$facet.total = [{$count: 'list_total'}]
	}
	// console.log(site_id)
	sitedb.aggregate('comments', [
		{ $match: conditoin },
		{ $facet }
	], {create_time: 1}).then(result => {
		const { list=[], total: total_temp } = result[0] || {};
		list.forEach(it => {
			it.reply_total = (it.reply_total[0] || {}).total || 0
			it.create_time = fromatIOSDate(it.create_time)

			const [user] = it.user;
			it.user_name = user.name;
			it.user_face = user.face;
			delete it.user;

			it.reply_arr = recheckReplyList(it.reply_arr)
		})
		if (isTotal) {
			const total = (total_temp[0] || {}).list_total || 0
			res.json(success({list, total}))
		} else {
			res.json(success({list}))
		}
   })
	/*sitedb.find('comments', conditoin, {pageIndex, pageSize: 10}, {create_time: 1}).then(async list => {

		if (isTotal) {
			sitedb.count('comments', conditoin).then(total => {
				res.json(success({list, total}))
			}).catch(err => {
				res.json(failed(err))
			})
		} else {
			res.json(success({list}))
		}
		// res.json(success(list, 'ok'))
	})*/
}