// 删除的时候，记得删除评论
const sitedb = require('../model/currentDbs')
const path = require('path')
const {
	deleteFolder,
	// isLegal
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
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	const {_id, status} = req.body;
	/*if (!isLegal(_id) || !isLegal(status)) {
		return res.json(failed('', '该网站不存在！'))
	}*/

	const { _id: user_id } = ust

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
			if (!user.is_super) {
				return res.json(failed('', '权限不足，不可下架！'))
			}
			sitedb.updateOne('sites', condition, {$set: {status: 0}}).then(result => {
				console.log('delsite', result.result)
				res.json(success(result.result))
			})
		} else {		// 下架状态或草稿状态的删除就是真正的删除
			await sitedb.deleteMany('sites', condition)
			await sitedb.deleteMany('site_rate', {site_id: _id})
			await sitedb.deleteMany('comments', {site_id: _id})
			await sitedb.deleteMany('comments_reply', {site_id: _id})

			deleteFolder(path.join(__dirname,`../upload/sites/${_id}`))
			res.json(success())
			
		}
	} catch (err) {
		console.log('delsite', err)
		res.json(failed('', '该网站不存在！'))
	}

	
}