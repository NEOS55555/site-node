const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	isUserLogin
} = require('./com')
const {
	getClientIP, 
	clearRepArr,
} = require('../model/common.js')


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


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}

	const user_ip = getClientIP(req);
	const {catalog, status, pageIndex, pageSize, isTotal, is_edit, tag_name} = req.body;
	const { user_id } = req.cookies
	let conditoin = {
		catalog: {
	        $elemMatch: {$eq: catalog}
	    },
	    // catalog: catalog+'',
	    status,
	    create_user_id: user_id,
	    tags: { $in: [new RegExp(tag_name, 'gim')] }
	};
	(catalog === undefined || catalog === -1) && delete conditoin.catalog;
	(status === undefined || status === -1) && delete conditoin.status;
	!tag_name && delete tags
	if (is_edit) {
		if (user_id) {
			const ust = isUserLogin(req.cookies.user_token) || {};
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

	sitedb.find('sites', conditoin, {pageIndex, pageSize}, {create_time: -1}).then(async list => {
		let ratelist= [];
		let userlist = [];
		let cataloglist = [];

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
		if (isTotal) {
			sitedb.count('sites', conditoin).then(total => {
				res.json(success({list, total}))
			}).catch(err => {
				res.json(failed(err))
			})
		} else {
			res.json(success({list}))
		}
	})
}