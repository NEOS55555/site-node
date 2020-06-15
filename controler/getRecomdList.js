const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	prevCheck,
	success, 
	failed,
} = require('./com')
const {
	SSVIP_EMAIL,
	NORMAL_CODE
} = require('./constant')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	let { catalog } = req.query;


	catalog = catalog.split(',').map(n => parseInt(n));

	sitedb.aggregate('sites', 
		[
			{ $match: { status: NORMAL_CODE, catalog: { $in: catalog } } },
			{ $sample: { size: 6 }},
			{ $sort: {create_time: 1} },
			{ $project: { _id: 1, name: 1, img: 1 } }
		]
	).then(async list => {
		res.json(success({list}))
	})
}