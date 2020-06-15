const sitedb = require('../model/currentDbs')
// const silly = require('silly-datetime')

const {
	checkUserLogin,
	getNextSequenceValue,
	trim,
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
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
		return ;
	}
	const { _id: user_id } = ust;
	const [user] = await sitedb.find('users', {_id: user_id})
	const { is_super, email } = user;
	if (!is_super || email !== SSVIP_EMAIL) {
		return res.json(failed('', 'Insufficient authority !'));
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
				create_time: new Date(), 
			}).then(data => {
				res.json(success('ok'))
			})
		}).catch(err => {
			console.log(err)
			res.json(failed(err))
		})
	})

}