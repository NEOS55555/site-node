const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	isUserLogin,
	get$rated$val
} = require('./com')
const {
	getClientIP, 
	clearRepArr,
	trim,
	fromatIOSDate,
} = require('../model/common.js')
const {
	getSiteCollectSql
} = require('../model/comsql')
const {
	DRAFT_CODE,
	DELETE_CODE,
	NORMAL_CODE,
	REVIEW_CODE,
	OVERDUE_RES,
} = require('./constant')



function strSearch (str='') {
	return new RegExp(str, 'gim')
}

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const orderMap = {
		'create_time': true,
		'views': true,
		'monthViews': true,
	}

	const user_ip = getClientIP(req);
	let { catalog, status, pageIndex=1, pageSize=10, isTotal, is_edit, tag_name, orderBy="create_time", search } = req.body;
	tag_name = trim(tag_name);
	search = trim(search);
	catalog = parseInt(catalog) || -1;
	status = parseInt(status);

	// status = status
	
	const { user_id } = req.cookies
	let conditoin = {
		catalog: {
	        $elemMatch: {$eq: catalog}
	    },
	    // catalog: catalog+'',
	    status,
	    create_user_id: user_id,
	    tags: { $in: [strSearch(tag_name)] },
	    $or: [{name: strSearch(search)}, {desc: strSearch(search)}, {tags: { $in: [strSearch(search)] }}]
	};
	// console.log(req.cookies);
	(catalog === undefined || catalog === -1) && delete conditoin.catalog;
	(status === undefined || status === -1) && delete conditoin.status;
	!tag_name && delete conditoin.tags;
	!search && delete conditoin.$or;

	if (is_edit) {
		if (user_id) {
			// 如果传过来的id跟 之前的那个id不一致
			const ust = checkUserLogin(req, res);
			if (!ust) {
				return;
			}
			// console.log(usid , user_id)
			if (ust._id !== user_id) {
				return res.json(failed('', '该用户未登录或登录已失效!', OVERDUE_RES))
			}
			
			const [user] = await sitedb.find('users', {_id: user_id})
			if (user) {
				if (user.is_super && status !== DRAFT_CODE) {
					delete conditoin.create_user_id
				}/* else {
					// 编辑状态，非super不可 获取其他状态
					if (status === NORMAL_CODE) {
						// conditoin.status = -2
						// return res.json(success({list: []}))
					} else if (status === -1) {
						// conditoin.status = {$ne: NORMAL_CODE}
					}
				}*/
			} else {
				return res.json(failed('', '该用户不存在!'))
			}
		} else {
			return res.json(failed('', '请先登录!', OVERDUE_RES))
		}
	} else {
		conditoin.status = 1;
		delete conditoin.create_user_id
	}
	
	

 	const sortOrder = {}
	sortOrder[(orderMap[orderBy] ? orderBy : 'create_time')] = -1;
	const $facet = {
		list: [
			{ $sort: sortOrder },
			{ $skip: pageSize * (pageIndex - 1) },
			{ $limit: pageSize },
			{
		        $lookup: {
		            from: "site_rate",
		            localField: "_id",
		            foreignField: "site_id",
		            as: "rate"
		        },
		    },
			{
		        $lookup: {
		            from: "comments",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { s_id: "$_id" },
		            pipeline: [
		               { $match: { $expr: { $and: [{$eq: ['$site_id', '$$s_id']}] } } },
		               { $count: 'total' }
		            ],
		            as: "cmt_total"
		        },
		    },
			{
		        $lookup: {
		            from: "comments_reply",
		            // localField: "_id",
		            // foreignField: "commit_id",
		            let: { s_id: "$_id" },
		            pipeline: [
		               { $match: { $expr: { $and: [{$eq: ['$site_id', '$$s_id']}] } } },
		               { $count: 'total' }
		            ],
		            as: "reply_total"
		        },
		    }
		],
	}
	// 如果登陆了的话 就获取收藏信息
	if (user_id) {
		/*const ust = checkUserLogin(req, res)
		if (!ust) {
			return;
		}
		const { _id: user_id } = ust;*/
		// console.log(user_id)
		$facet.list.push(getSiteCollectSql(user_id))
	}
	if (isTotal) {
		$facet.total = [{$count: 'list_total'}]
	}
	// console.log(conditoin, orderBy)
	sitedb.aggregate('sites', [
		{ $match: conditoin },
		{
			$facet
		}
	]).then(result => {
		const { list, total: total_temp } = result[0] || {};
		// console.log(list)
		list.forEach(it => {
			it.rate = get$rated$val(it.rate, user_ip);
			it.create_time = fromatIOSDate(it.create_time)
			it.commit_total = ((it.cmt_total[0] || {}).total || 0) + ((it.reply_total[0] || {}).total || 0)
			it.isCollected = (it.collection || []).length > 0
			delete it.cmt_total;
			delete it.reply_total;
			delete it.collection;
		})
		if (isTotal) {
			const total = (total_temp[0] || {}).list_total || 0
			// sitedb.count('sites', conditoin).then(total => {
			res.json(success({list, total}))
			// }).catch(err => {
				// res.json(failed(err))
			// })
		} else {
			res.json(success({list}))
		}
	}).catch(err => console.log(err))
	// console.log(conditoin)
	/*sitedb.find('sites', conditoin, {pageIndex, pageSize}, sortOrder).then(async list => {
		let ratelist= [];
		// let userlist = [];
		let cataloglist = [];

		// 这里可以一起查询 节约查询时间，但是可能会给系统造成负担
		if (list.length != 0) {
			ratelist = await sitedb.find('site_rate', {$or: list.map(({_id}) => ({site_id: _id}))})
			// userlist = await sitedb.find('users', {$or: list.map(({create_user_id}) => ({_id: create_user_id}))})

			// 将多个二维数组变为一维数组
			// const ctga = list.map(({catalog}) => catalog).reduce((prev, cur) => cur.concat(prev))
			// 去重遍历
			// cataloglist = await sitedb.find('catalog', {$or: clearRepArr(ctga).map(_id => ({_id}))})
		}
	
		const rateMap = {};
		ratelist.forEach(({_id, site_id, user_id, user_ip, value}) => {
			rateMap[site_id] = rateMap[site_id] || [];
			rateMap[site_id].push({
				user_id,
				user_ip,
				value
			})
		})
		// const userMap = {};
		// userlist.forEach(({_id, name}) => userMap[_id] = name)

		// const catalogMap = {};
		// cataloglist.forEach(({_id, name}) => catalogMap[_id] = name)
		// console.log(cataloglist, catalogMap)

		list.forEach(it => {
			const list = rateMap[it._id] || []
			it.rate = get$rated$val(list, user_ip, user_id);
			// it.create_user_name = userMap[it.create_user_id];
			// it.catalog_name = it.catalog.map(id => catalogMap[id])
		})
		// setTimeout(() => {

		if (isTotal) {
			sitedb.count('sites', conditoin).then(total => {
				res.json(success({list, total}))
			}).catch(err => {
				res.json(failed(err))
			})
		} else {
			res.json(success({list}))
		}
		// }, 3999)
	})*/
}