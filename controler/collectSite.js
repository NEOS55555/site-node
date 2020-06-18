const sitedb = require('../model/currentDbs')

const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
	checkLegal,
} = require('./com')
const {
	getNextSequenceValue, 
} = require('../model/common.js')

module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const ust = checkUserLogin(req, res);
	if (!ust) {
		return ;
	}
	const { _id: user_id } = ust;
	let { _id: site_id } = req.query;
	site_id = parseInt(site_id);
	if (!checkLegal(res, site_id, 'id')) {
		return;
	}
	// console.log(site_id)
	try {
		const [item] = await sitedb.find('collections', {user_id, site_id})
		// console.log(item)
		if (item) {
			await sitedb.deleteMany('collections', { _id: item._id })
			res.json(success())
			// await sitedb.updateOne('collections', { user_id }, { $pull: { collection: site_id } })
		} else {
			// await sitedb.updateOne('collections', { user_id }, { $addToSet: { collection: site_id } })
			const [oneSite] = await sitedb.find('sites', { _id: site_id })
			getNextSequenceValue(sitedb, 'siteCollectId').then(_id => {
				sitedb.insertOne('collections', {
					_id,
					user_id,
					site_id,
					catalog: oneSite.catalog
				}).then(result => {
					res.json(success())
					/*setTimeout(() => {

					}, 3000)*/
				})
			}).catch(err => {
				console.log(err)
				res.json(failed(err, 'getNextSequenceValue error'))
			})
		}
	} catch (err) {
		res.json(failed('', 'error'))
	}
	
	
}