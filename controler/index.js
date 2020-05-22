const sitedb = require('../model/currentDbs')

const {
	success, 
	failed,
} = require('./com')

const {
	deleteFolder, 
} = require('../model/common.js')

// 网页
const register = require('./register')
const login = require('./login')
const getSiteList = require('./getSiteList')
const sendRegMailCode = require('./sendRegMailCode')
const delSite = require('./delSite')
const getIP = require('./getIP')
const addView = require('./addView')
const getCatalogList = require('./getCatalogList')
const setRate = require('./setRate')
const addCatalog = require('./addCatalog')
const getCaptcha = require('./getCaptcha')
const {
	addSite,
	editSite,
} = require('./site')
const {
	getPage,
	enterSystem,
} = require('./router')


const { REG_CODE_EXP } = require('./constant');

const schedule = require('node-schedule');

// 每天，定期清除过期验证码
schedule.scheduleJob('0 30 1 * * *', async function () {
	// await clearExpCode();
	console.log('现在是凌晨:' + new Date() + '。开始清除过期验证码。');
	await sitedb.deleteMany('reg_code', {
		date: {
			$lt: new Date(Date.now() - REG_CODE_EXP)
		}
	})
    console.log('现在是凌晨:' + new Date() + '。已经清除过期验证码。');
});
// 每个月，定期清零月点击
schedule.scheduleJob('0 30 1 1 * *', async function () {
	// await clearExpCode();
	console.log('现在是凌晨:' + new Date() + '。开始清零。');
	await sitedb.updateMany('sites', {
		monthViews: {
	        $gt: 0
	    }
	}, {
		$set: {
			monthViews: 0
		}
	})
    console.log('现在是凌晨:' + new Date() + '。已经清零。');
});


// 获取ip
exports.getIP = getIP
exports.register = register

// 用户登录
exports.login = login

// 增加网站点击量也就是浏览量
exports.addView = addView
// 获取分类列表
exports.getCatalogList = getCatalogList

// *************************************************
// 这个接口待优化，有多个表查询，应该用表连接查询
// *************************************************
// 获取网站列表
exports.getSiteList = getSiteList
// 删除网站
exports.delSite = delSite


// 新增分类
exports.addCatalog = addCatalog

exports.addSite = addSite;
exports.editSite = editSite;

// 设置评分
exports.setRate = setRate

exports.clearImgCache = (req, res, next) => {
	deleteFolder(path.join(__dirname,`../tempup`), true)
	res.send(success())
}

exports.enterSystem = enterSystem;
exports.getPage = getPage;
exports.getCaptcha = getCaptcha;
exports.getCaptcha = getCaptcha;
exports.sendRegMailCode = sendRegMailCode

