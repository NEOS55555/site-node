const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin
} = require('./com')
const {
	getClientIP, 
	clearRepArr,
	trim,
} = require('../model/common.js')
// 编辑状态，非super不可 获取其他状态

function get$rated$val (list, ip, id) {
	let length = list.length;
	let isRated = false;
	let value = 0;
	for (let i = 0; i < length; i++) {
		const item = list[i]
		if (!isRated && (id == item.user_id || ip == item.user_ip)) {
			isRated = true;
		}
		value += item.value || 0;
	}
	return {
		isRated,
		value,
		length
	}
}

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
	let { catalog, status, pageIndex, pageSize, isTotal, is_edit, tag_name, orderBy, search } = req.body;
	tag_name = trim(tag_name);
	search = trim(search);


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
				return res.json(failed('', '该用户未登录或登录已失效!'))
			}
			
			const [user] = await sitedb.find('users', {_id: user_id})
			if (user) {
				if (user.is_super) {
					delete conditoin.create_user_id
				}
			} else {
				return res.json(failed('', '该用户不存在!'))
			}
		} else {
			return res.json(failed('', '请先登录!'))
		}
	} else {
		delete conditoin.create_user_id
	}
	const sortOrder = {}
	sortOrder[(orderMap[orderBy] ? orderBy : 'create_time')] = -1;
	// console.log(conditoin)
	sitedb.find('sites', conditoin, {pageIndex, pageSize}, sortOrder).then(async list => {
		let ratelist= [];
		let userlist = [];
		let cataloglist = [];

		// 这里可以一起查询 节约查询时间，但是可能会给系统造成负担
		if (list.length != 0) {
			ratelist = await sitedb.find('site_rate', {$or: list.map(({_id}) => ({site_id: _id}))})
			userlist = await sitedb.find('users', {$or: list.map(({create_user_id}) => ({_id: create_user_id}))})

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
		const userMap = {};
		userlist.forEach(({_id, name}) => userMap[_id] = name)

		// const catalogMap = {};
		// cataloglist.forEach(({_id, name}) => catalogMap[_id] = name)
		// console.log(cataloglist, catalogMap)

		list.forEach(it => {
			const list = rateMap[it._id] || []
			it.rate = get$rated$val(list);
			it.create_user_name = userMap[it.create_user_id];
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
	})
}