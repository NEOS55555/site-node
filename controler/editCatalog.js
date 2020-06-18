const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	checkLegal,
	isSuperVip
} = require('./com')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = await isSuperVip(req, res);
	if (!ust) {
		return ;
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