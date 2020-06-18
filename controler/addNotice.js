const sitedb = require('../model/currentDbs')
// const silly = require('silly-datetime')

const {
	getNextSequenceValue,
	trim,
} = require('../model/common.js')
const {
	prevCheck,
	success, 
	failed,
	checkLegal,
	isSuperVip
} = require('./com')
const {
	FEEDBACK_SITEID,
	MAX_COMMIT_LEN
} = require('./constant')


module.exports = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	
	const ust = await isSuperVip(req, res);
	if (!ust) {
		return ;
	}
	

	let { content, isToCommit } = req.body;
	content = trim(content)
	if (!content || content.length > MAX_COMMIT_LEN) {
		return res.json(failed('', 'content eror'))
	}
	if (isToCommit) {
		getNextSequenceValue(sitedb, 'common').then(_id => {
			sitedb.insertOne('comments', {
				_id,  
				site_id: FEEDBACK_SITEID, 
				user_id: ust._id, 
				create_time: new Date(),
				content
			})
			const commit_id = _id;
			getNextSequenceValue(sitedb, 'notice_id').then(_id => {
				// console.log(_id)
				sitedb.insertOne('notices', {
					_id, 
					content, 
					commit_id,
					create_time: new Date(), 
				}).then(data => {
					res.json(success('ok'))
				})
			}).catch(err => {
				console.log(err)
				res.json(failed(err))
			})
		})
	} else {
		getNextSequenceValue(sitedb, 'notice_id').then(_id => {
			// console.log(_id)
			sitedb.insertOne('notices', {
				_id, 
				content, 
				create_time: new Date(), 
			}).then(data => {
				res.json(success('ok'))
			})
		}).catch(err => {
			console.log(err)
			res.json(failed(err))
		})
	}

	

}