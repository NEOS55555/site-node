const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkLegal,
	get$rated$val,
	checkUserLogin
} = require('./com')
const {
	trim,
	getClientIP, 
	fromatIOSDate,
} = require('../model/common.js')
const {
	NORMAL_CODE,
} = require('./constant')

// user_id可以加上
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let { pageIndex, pageSize=5, catalog=-1, isTotal=1 } = req.query;
	catalog = parseInt(catalog)

	if (!checkLegal(res, catalog, 'catalog')) {
		return;
	}
	const ust = checkUserLogin(req, res)
	if (!ust) {
		return;
	}
	const user_ip = getClientIP(req)

	const { _id: user_id } = ust
	const $match = {
		user_id,
	}
	if (catalog !== -1) {
		$match.catalog = { $in: [catalog] }
	}
	
	let $facet = {
		list: [
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
			{ $sort: { create_time: -1 } },
			{
		        $lookup: {
		            from: "sites",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { s_id: "$site_id" },
		            pipeline: [
		               { $match: { $expr: { $and: [{$eq: ['$_id', '$$s_id']}] } } },

		               {
					        $lookup: {
					            from: "site_rate",
					            localField: "_id",
					            foreignField: "site_id",
					            as: "rate"
					        },
					    },
		            ],
		            as: "site"
		        },
		    },
			
		],
	}
	if (isTotal == 1) {
		$facet.total = [{$count: 'list_total'}]
	}
	console.log($match)
	sitedb.aggregate('collections', [
		{ $match },
		{ $facet }
	]).then(([result={}]) => {
		console.log(result)
		
		const { list: tList=[], total: total_temp } = result
		const list = tList.map(it => {
			let temp = it.site[0];
			temp.rate = get$rated$val(temp.rate, user_ip);
			temp.create_time = fromatIOSDate(temp.create_time)
			temp.isCollected = true
			return temp
		})
		
		if (isTotal == 1) {
			const total = (total_temp[0] || {}).list_total || 0
			// sitedb.count('sites', conditoin).then(total => {
			res.json(success({list, total}))
			// }).catch(err => {
				// res.json(failed(err))
			// })
		} else {
			res.json(success({list}))
		}

	})
	/*sitedb.find('sites', conditoin).then(async ([item]) => {
		if (!item) {
			return res.json(failed('', '不存在'))
		}
		const rateList = await sitedb.find('site_rate', {site_id})
		item.create_time = fromatIOSDate(item.create_time)
		// console.log(item)
		res.json(success({...item, rate: get$rated$val(rateList, user_ip)}))
	})*/
}