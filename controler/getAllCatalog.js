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
	

	sitedb.find('catalog', conditoin).then(list => {
		list = list.map(({_id, name}) => ({_id, name}))
		// list.unshift({_id: -1, name: '全部'})
		res.json(success({list}))
	})
}