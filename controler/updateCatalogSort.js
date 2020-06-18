const sitedb = require('../model/currentDbs')
const md5 = require('../model/md5.js')

const {
	prevCheck,
	success, 
	failed,
	checkUserLogin,
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
		return;
	}
	const { _id: user_id } = ust;
	const [user] = await sitedb.find('users', {_id: user_id})
	const { is_super, email } = user;
	if (!is_super || email !== SSVIP_EMAIL) {
		return res.json(failed('', 'Insufficient authority !'));
	}
	let { catalog } = req.body;
	try {
		const len = catalog.length;
		catalog.forEach(async (it, index) => {
			await sitedb.updateOne('catalog', { _id: it._id }, { $set: { sortIndex: len - index - 1 } })/*.then(result => {
				res.json(success())
			}).catch(err => {
				console.log(err)
			})*/
		})
		res.json(success())
	} catch (err) {
		res.json(failed())

	}
	
}