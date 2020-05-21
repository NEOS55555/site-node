const sitedb = require('../model/currentDbs')
const {
	prevCheck,
	success, 
	failed,
	checkLegal,
} = require('./com')
const {
	getClientIP, 
	getNextSequenceValue,
} = require('../model/common.js');

module.exports = (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const { value, site_id} = req.body;
	if (!checkLegal(res, value, '评分值')) {
		return ;
	}
	getNextSequenceValue(sitedb, 'rateId').then(_id => {
		sitedb.insertOne('site_rate', {
			_id, 
			site_id,
			user_ip: getClientIP(req), 
			value
		}).then(data => {
			res.json(success('ok'))
		}).catch(err => res.json(failed(err)))
	}).catch(err => res.json(failed(err)))
}