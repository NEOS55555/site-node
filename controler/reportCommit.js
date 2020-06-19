// 发表评论
const sitedb = require('../model/currentDbs')
// const silly = require('silly-datetime')
const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
} = require('./com')
const {
	isLegal,
	getNextSequenceValue,
	fromatIOSDate
} = require('../model/common')
const {
	MAX_COMMIT_LEN,
	FEEDBACK_SITEID
} = require('./constant')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	let { site_id, content } = req.body;
	site_id = parseInt(site_id)
	const isFeedback = site_id === FEEDBACK_SITEID
	/*if (content.indexOf('<script>') !== -1) {
		res.json(failed('', 'content error !'))
		return false;
	}*/
	if (content.length > MAX_COMMIT_LEN) {
		res.json(failed('', '尽量不要写作文哦，太长了！'))
		return false;
	}
	let site = {}
	if (!isFeedback) {
		const [item] = await sitedb.find('sites', {_id: site_id})
		if (!item) {
			return res.json(failed('', '该网站不存在！'))
		}
		site = item;
	}

	const { _id: user_id } = ust

	const [user] = await sitedb.find('users', {_id: user_id})
	if (!user) {
		// console.log(user_id)
		return res.json(failed('', '该用户不存在！'))
	} 
	const { name: user_name, face: user_face } = user;
	
	getNextSequenceValue(sitedb, 'comment').then(_id => {
		const insertData = {
			_id,  
			site_id, 
			site_name: site.name,
			user_id, 
			// user_name, 
			// user_face, 
			create_time: new Date(),
			content
		}
		if (isFeedback) {
			delete insertData.site_name
		}

		sitedb.insertOne('comments', insertData).then(r => res.json(success({
			...insertData, user_name, user_face,
			create_time: fromatIOSDate(insertData.create_time)
		}, '发表成功！')))
	})
	
	

	
}