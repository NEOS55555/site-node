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
const getAllCatalog = require('./getAllCatalog')
const setRate = require('./setRate')
const addCatalog = require('./addCatalog')
const getCaptcha = require('./getCaptcha')
const sendRestPswCode = require('./sendRestPswCode')
const resetPassword = require('./resetPassword')
const getSiteDetail = require('./getSiteDetail')
const reportCommit = require('./reportCommit')
const getReportCommitList = require('./getReportCommitList')
const getReplyCommitList = require('./getReplyCommitList')
const replyCommit = require('./replyCommit')
const getReplyMeList = require('./getReplyMeList')
const saveportrait = require('./saveportrait')
const clearreplynum = require('./clearreplynum')
const getNewestCommit = require('./getNewestCommit')
const getUserportrait = require('./getUserportrait')
const checkName = require('./checkName')
const editCatalog = require('./editCatalog')
const delCatalog = require('./delCatalog')
const getRecomdList = require('./getRecomdList')
const collectSite = require('./collectSite')
const getCatalogList = require('./getCatalogList')
const getCollectList = require('./getCollectList')
const updateCatalogSort = require('./updateCatalogSort')
const addNotice = require('./addNotice')
const getNoticeList = require('./getNoticeList')
const delNotice = require('./delNotice')
const editNotice = require('./editNotice')

const {
	addSite,
	editSite,
} = require('./site')
const {
	getPage,
	enterLoginPage,
} = require('./router')


const { REG_CODE_EXP } = require('./constant');

const schedule = require('node-schedule');

// 每天，

schedule.scheduleJob('0 30 1 * * *', async function () {
	// await clearExpCode();
	// 定期清除过期验证码
	sitedb.deleteMany('reg_code', {
		date: {
			$lt: new Date(Date.now() - REG_CODE_EXP)
		}
	})
    console.log('现在是凌晨:' + new Date() + '，清除过期验证码。');
    // 修改验证码未过期的次数
    sitedb.updateOne('reg_code', {
    	date: {
    		$gt: new Date(Date.now() - REG_CODE_EXP)
    	}
    }, {
    	$set: {
    		times: 0,
    	}
    })
    // 修改用户的每日新增
    sitedb.updateOne('users', {
    	today_add: {
    		$gt: 0
    	}
    }, {
    	$set: {
    		today_add: 0,
    	}
    })
});
// 每个月，定期清零月点击
schedule.scheduleJob('0 30 1 1 * *', async function () {
	// await clearExpCode();
	sitedb.updateMany('sites', {
		monthViews: {
	        $gt: 0
	    }
	}, {
		$set: {
			monthViews: 0
		}
	})
    console.log('现在是凌晨:' + new Date() + '，清零月点击量。');
});


// 获取ip
exports.getIP = getIP
exports.register = register

// 用户登录
exports.login = login

// 增加网站点击量也就是浏览量
exports.addView = addView
// 获取分类列表
exports.getAllCatalog = getAllCatalog

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

exports.enterLoginPage = enterLoginPage;
exports.getPage = getPage;
exports.getCaptcha = getCaptcha;
exports.getCaptcha = getCaptcha;
exports.sendRegMailCode = sendRegMailCode
exports.sendRestPswCode = sendRestPswCode
exports.resetPassword = resetPassword
exports.getSiteDetail = getSiteDetail
exports.reportCommit = reportCommit
exports.getReportCommit = getReportCommitList
exports.getReplyCommit = getReplyCommitList
exports.replyCommit = replyCommit
exports.getReplyMeList = getReplyMeList
exports.saveportrait = saveportrait
exports.clearreplynum = clearreplynum
exports.getNewestCommit = getNewestCommit
exports.getUserportrait = getUserportrait
exports.checkName = checkName
exports.editCatalog = editCatalog
exports.delCatalog = delCatalog
exports.getRecomdList = getRecomdList
exports.collectSite = collectSite
exports.getCatalogList = getCatalogList
exports.getCollectList = getCollectList
exports.updateCatalogSort = updateCatalogSort
exports.addNotice = addNotice
exports.getNoticeList = getNoticeList
exports.delNotice = delNotice
exports.editNotice = editNotice


