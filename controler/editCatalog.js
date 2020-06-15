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
	let { name, _id } = req.body;
	if (!checkLegal(res, name, '分类名')) {
		return;
	}

	const [cat] = await sitedb.find('catalog', {name})
	if (cat) {
		return res.json(failed('', '该分类名已存在！'))
	}
	
	sitedb.updateOne('catalog', { _id }, { $set: { name } }).then(result => {
		res.json(success())
	}).catch(err => {
		console.log(err)
	})
	
}