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
	let { site_id, commit_id, to_user_id, content, is_to_commit } = req.body;
	/*if (content.indexOf('<script>') !== -1) {
		res.json(failed('', 'content error !'))
		return false;
	}*/
	if (content.length > MAX_COMMIT_LEN) {
		res.json(failed('', '尽量不要写作文哦，太长了！'))
		return false;
	}

	commit_id = parseInt(commit_id)
	if (!isLegal(commit_id)) {
		return res.json(failed('', 'site error!'))
	}
	site_id = parseInt(site_id)
	const isFeedback = site_id === FEEDBACK_SITEID
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
	// console.log(user)
	if (!user) {
		// console.log(user_id)
		return res.json(failed('', 'user error!'))
	} 
	// 回复数
	let addReplyNum = 1;
	if (user_id === to_user_id) {
		addReplyNum = 0
	}
	const {value: touser} = await sitedb.findOneAndUpdate('users', {_id: to_user_id}, { $inc:{check_reply_num:addReplyNum} }, {
		new: true
	})
		// console.log(touser)
	if (!touser) {
		return res.json(failed('', 'touser error!'))
	}
	const { name: user_name, face: user_face } = user;
	const { name: to_user_name } = touser;

	getNextSequenceValue(sitedb, 'comment').then(_id => {
		const insertData = {
			_id,  
			commit_id,
			site_id, 
			is_to_commit: !!is_to_commit,
			site_name: site.name,
			user_id, 
			// user_name, 
			// user_face, 
			create_time: new Date(),
			to_user_id,
			// to_user_name,
			content
		}
		if (isFeedback) {
			delete insertData.site_name
		}
		sitedb.insertOne('comments_reply', insertData).then(r => res.json(success({
			...insertData, user_name, user_face, to_user_name, 
			create_time: fromatIOSDate(insertData.create_time)
			// to_user_face 
		}, '发表成功！')))
	})
	
	

	
}