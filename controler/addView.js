const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
} = require('./com')
// 增加网站点击量也就是浏览量
module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let {_id} = req.query;
	_id = parseInt(_id)

	if (!_id) {
		return res.json(failed('err', 'e.id.n'));
	}
	
	sitedb.findOneAndUpdate('sites',
		{_id},
		{$inc:{views:1, monthViews: 1,}},
		{new:true}
	).then(result => {
		res.json(success(result.value.views+1))
	}).catch(err => {
		res.json(failed(err))
	})
}