const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	get$rated$val,
} = require('./com')
const {
	trim,
	getClientIP, 
	fromatIOSDate,
} = require('../model/common.js')
const {
	NORMAL_CODE,
} = require('./constant')
const {
	getSiteCollectSql
} = require('../model/comsql')
// user_id可以加上
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}


	// let { site_id } = req.body;
	const user_ip = getClientIP(req);
	let { site_id } = req.query;
	site_id = parseInt(site_id);
	// console.log(req.query)
	// status = status
	
	let conditoin = {
		_id: site_id,
	    status: NORMAL_CODE,
	};
	const $facet = {
		list: [
			{
		        $lookup: {
		            from: "site_rate",
		            localField: "_id",
		            foreignField: "site_id",
		            as: "rate"
		        },
		    }
		],
	}
	// 如果登陆了的话 就获取收藏
	const { user_id } = req.cookies;
	if (user_id) {
		$facet.list.push(getSiteCollectSql(user_id))
	}
	sitedb.aggregate('sites', [
		{ $match: conditoin },
		{
			$facet
		}
	]).then(([result]) => {
		const { list } = result;
		list.forEach(it => {
			it.rate = get$rated$val(it.rate, user_ip);
			it.create_time = fromatIOSDate(it.create_time)
			it.isCollected = (it.collection || []).length > 0
			delete it.cmt_total;
			delete it.collection;
		})
		const [item] = list;
		res.json(success(item))

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