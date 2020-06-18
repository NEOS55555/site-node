const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
} = require('./com')
const {
	fromatIOSDate,
} = require('../model/common.js')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let { pageIndex, pageSize=10, isTotal=1 } = req.query;
	pageIndex = parseInt(pageIndex)
	pageSize = parseInt(pageSize)
	
	let $facet = {
		list: [
			{ $sort: { create_time: -1 } },
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
		],
	}
	if (isTotal == 1) {
		$facet.total = [{$count: 'list_total'}]
	}
	sitedb.aggregate('notices', [
		{ $facet }
	]).then(([result={}]) => {
		// console.log(result)
		
		const { list: tList=[], total: total_temp } = result
		const list = tList.map(it => {
			it.create_time = fromatIOSDate(it.create_time)
			return it
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