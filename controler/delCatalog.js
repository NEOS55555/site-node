const sitedb = require('../model/currentDbs')

const {
	prevCheck,
	success, 
	failed,
	isSuperVip,
	checkLegal
} = require('./com')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = await isSuperVip(req, res);
	if (!ust) {
		return ;
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