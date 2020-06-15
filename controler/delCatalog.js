const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	checkLegal
} = require('./com')
const {
	SSVIP_EMAIL
} = require('./constant')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return;
	}
	const { _id: user_id } = ust;
	const [user] = await sitedb.find('users', {_id: user_id})
	const { is_super, email } = user;
	if (!is_super || email !== SSVIP_EMAIL) {
		return res.json(failed('', 'Insufficient authority !'));
	}
	let { _id } = req.query;
	_id = parseInt(_id);
	if (!checkLegal(res, _id, '_id')) {
		return;
	}
	
	const clist = await sitedb.find('sites', {catalog: { $in: [_id] }})
	if (clist.length > 0) {
		return res.json(failed('', '该分类存在网站，建议修改分类名称!'))
	}
	sitedb.deleteMany('catalog', {_id}).then(result => {
		res.json(success())
	})
}