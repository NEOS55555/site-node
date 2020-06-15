const {
	prevCheck,
	isUserLogin,
} = require('./com')
const fs = require('fs')
const path = require('path')
const getPage = (req, res, next) => {
	// console.log(req.cookies, req.headers.cookie)
	fs.readFile(path.resolve(__dirname, '../public/index.html'), (err, result) => {
		if (err) {
			return next();
		}
		res.writeHead(200, {
			'Content-Type': 'text/html'
		})
		res.end(result)
	})
}
exports.enterLoginPage = (req, res, next) => {
	// const user_id = getCookie(req.headers.cookie).user_id
	/*if (!prevCheck(req, res)) {
		return;
	}*/
	const user_token = req.cookies.user_token
	const user_id = isUserLogin(user_token)._id;
	if (user_id) {
		return getPage(req, res, next)
	}
	res.redirect('/')
	/*sitedb.find('users', {_id: user_id}).then(([item={}]) => {
		if (item.is_super) {
			return getPage(req, res, next)
		}
		res.redirect('/')
	})*/
}

exports.getPage = getPage;