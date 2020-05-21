const Content = require('./db');

const sitedb = new Content('sites')
sitedb.setkey('response', null);
sitedb.setReject(err => {
	sitedb.response && sitedb.response.json(failed(err, 'db error'))
})


module.exports = sitedb

