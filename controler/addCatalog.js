const sitedb = require('../model/currentDbs')
const silly = require('silly-datetime')

const {
	getNextSequenceValue,
	trim,
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	checkLegal
} = require('./com')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let {name} = req.body;
	name = trim(name)
	if (!checkLegal(res, name, '分类名称')) {
		return ;
	}
	sitedb.find('catalog', {name}).then(list => {
		if (list.length > 0) {
			res.json(failed('', '该分类已存在！'))
		}

		getNextSequenceValue(sitedb, 'catalogId').then(_id => {
			// console.log(_id)
			sitedb.insertOne('catalog', {
				_id, 
				name, 
				create_time: silly.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), 
			}).then(data => {
				res.json(success('ok'))
			})
		}).catch(err => {
			console.log(err)
			res.json(failed(err))
		})
	})

}