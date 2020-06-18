const sitedb = require('../model/currentDbs')
// const silly = require('silly-datetime')

const {
	getNextSequenceValue,
	trim,
} = require('../model/common.js')
const {
	isSuperVip,
	prevCheck,
	success, 
	failed,
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

	let {name} = req.body;
	name = trim(name)
	if (!checkLegal(res, name, '分类名称')) {
		return ;
	}
	const list = await sitedb.find('catalog', {})

	for (let i, len = list.length; i < len; i++) {
		if (list[i].name === name) {
			return res.json(failed('', '该分类名称已存在！'))
		}
	}

	getNextSequenceValue(sitedb, 'catalogId').then(_id => {
		// console.log(_id)
		sitedb.insertOne('catalog', {
			_id, 
			name, 
			sortIndex: list.length,
			create_time: new Date(), 
		}).then(data => {
			res.json(success('ok'))
		})
	}).catch(err => {
		console.log(err)
		res.json(failed(err))
	})

}