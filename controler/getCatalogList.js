const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
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

	const $lookup = {
        from: 'sites',
        let : { c_id: '$_id' },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [ 
                            //{ $eq: ['$status', NORMAL_CODE] },
                            
                            { $in: ['$$c_id', '$catalog'] } 
                        ]
                    }
                }
            },
            {
                $count: 'total'
            }
        ],
        as: 'catalogtotal'
    }
	const { user_id } = req.cookies
    const { type } = req.query
	
	if (user_id && type == 'collect') {	// 获取收藏的右侧列
		$lookup.from = 'collections'
		$lookup.pipeline[0].$match.$expr.$and.unshift({ $eq: [user_id , '$user_id'] })
	} else {
		$lookup.pipeline[0].$match.$expr.$and.unshift({ $eq: ['$status', NORMAL_CODE] })
	}

	sitedb.aggregate('catalog', [{ $sort: {sortIndex: -1} },{ $lookup }]).then((list) => {
		// console.log(list)
		list.forEach(it => {
			it.total = (it.catalogtotal[0] || {}).total || 0
			delete it.catalogtotal;
		})
		res.json(success({list}))

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