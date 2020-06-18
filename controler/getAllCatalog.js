const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
} = require('./com')

// 获取分类列表
module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	// const {catalog, status, pageIndex, pageSize, isTotal} = req.body;
	let conditoin = {
		
	};
	

	sitedb.find('catalog', conditoin, {}, {sortIndex: -1}).then(list => {
		list = list.map(({_id, name, sortIndex}) => ({_id, name, sortIndex}))
		res.json(success({list}))
	})
}