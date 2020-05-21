const sitedb = require('../model/currentDbs')
const path = require('path')
const {
	deleteFolder,
	isLegal
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin
} = require('./com')
const {
	DRAFT_CODE,
	DELETE_CODE,
	NORMAL_CODE
} = require('./constant')

// 删除网站
module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	if (!checkUserLogin(req, res)) {
		return ;
	}
	const {_id, status} = req.body;
	if (!isLegal(_id) || !isLegal(status)) {
		return res.json(failed('', '该网站不存在！'))
	}

	const { user_id } = req.cookies

	try {
		const [user] = await sitedb.find('users', {_id: user_id})
		if (!user) {
			// console.log(user_id)
			return res.json(failed('', '该用户不存在！'))
		} 
		const condition = {
			_id,
			create_user_id: user_id,
		}
		
		if (user.is_super) {
			delete condition.create_user_id
		}
		if (status == NORMAL_CODE) {	
			sitedb.updateOne('sites', condition, {$set: {status: 0}}).then(result => {
				console.log('delsite', result.result)
				res.json(success(result.result))
			})
		} else {		// 下架状态或草稿状态的删除就是真正的删除
			await sitedb.deleteMany('sites', condition)
			await sitedb.deleteMany('site_rate', {site_id: _id})

			deleteFolder(path.join(__dirname,`../upload/${_id}`))
			res.json(success())
			
		}
	} catch (err) {
		console.log('delsite', err)
		res.json(failed('', '该网站不存在！'))
	}

	
}