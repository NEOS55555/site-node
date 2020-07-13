// test
const express = require('express');

const formidable = require("formidable");
const bodyParser = require('body-parser');
const session = require('express-session')
const cookieParser = require('cookie-parser')

const router = require('./controler')

const app = express();

app.use(session({
  name: 'machineCookie',
  secret:"MIIEpAIBAAKCAQEAs4nNSQfaORLb4yL49jcPI+LN+UshKX+gWcqBATwKepN2BvG+",		//设置签名秘钥  内容可以任意填写
  // cookie:{maxAge:30 * 1000 * 60},		//设置cookie的过期时间，例：30minutes后session和相应的cookie失效过期
  // cookie:{maxAge: 20 * 1000},		// 测试用
  resave:false,			//强制保存，如果session没有被修改也要重新保存
  saveUninitialized: false		//如果原先没有session那么久设置，否则不设置
}))

app.use(cookieParser());
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb', extended:false}));
app.use(express.static('./public'));
app.use('/img', express.static('./upload'));

// 每隔一段时间最好，自动修改超级管理员的密码

// 获取网站类型列表
app.get('/getAllCatalog', router.getAllCatalog)
// 分类+总数
app.get('/getCatalogList', router.getCatalogList)

// 获取网站列表
app.post('/getSiteList', router.getSiteList)


// 添加网站
app.post('/addSite', router.addSite)

// 添加网站
app.post('/editSite', router.editSite)
// 添加分类
app.post('/addCatalog', router.addCatalog)
// 新增公告
app.post('/addNotice', router.addNotice)
// 发表评论
app.post('/reportCommit', router.reportCommit)
// 用户注册
app.post('/register', router.register)
// 用户登录
app.post('/login', router.login)

// 删除网站
app.post('/delSite', router.delSite)
app.post('/sendRegMailCode', router.sendRegMailCode)
app.post('/sendRestPswCode', router.sendRestPswCode)
// 重置密码
app.post('/resetPassword', router.resetPassword)
app.get('/getSiteDetail', router.getSiteDetail)
app.get('/getReportCommit', router.getReportCommit)
// 清除图片缓存
app.post('/clearImgCache', router.clearImgCache)
app.get('/getIP', router.getIP)
app.get('/getNoticeList', router.getNoticeList)
// 删除公告
app.get('/delNotice', router.delNotice)
app.post('/editNotice', router.editNotice)
// 设置评分
app.post('/setRate', router.setRate)
app.post('/addView', router.addView)
app.get('/getsession', (req, res) => {
	console.log(req.cookies)
	console.log(req.session)
	console.log('-----------------------')
	res.send(req.session)
})
app.get('/getReplyCommit', router.getReplyCommit)

// 获取验证码
app.get('/getCaptcha', router.getCaptcha)
// 发表回复
app.post('/replyCommit', router.replyCommit)
// 消息
app.get('/getReplyMeList', router.getReplyMeList)
// 保存头像
app.post('/saveportrait', router.saveportrait)
app.get('/clearreplynum', router.clearreplynum)
app.get('/getNewestCommit', router.getNewestCommit)
app.post('/getUserportrait', router.getUserportrait)
app.post('/editCatalog', router.editCatalog)
app.get('/delCatalog', router.delCatalog)
app.get('/checkName', router.checkName)
app.get('/getRecomdList', router.getRecomdList)
app.get('/collectSite', router.collectSite)
// 获取收藏列表
app.get('/getCollectList', router.getCollectList)
// 跟新分类的顺序
app.post('/updateCatalogSort', router.updateCatalogSort)

// 路由
// 进入需要登录验证的页面
app.get('/account/portrait', router.enterLoginPage)
app.get('/catalogmng', router.enterLoginPage)
app.get('/noticemng', router.enterLoginPage)
app.get('/collect', router.enterLoginPage)
app.get('/collect/:catalog', router.enterLoginPage)
app.get('/system/:catalog/:search', router.enterLoginPage)
app.get('/system/:catalog', router.enterLoginPage)
app.get('/system', router.enterLoginPage)
// 进入其他页面
app.get('*', router.getPage)

app.listen(7890, '0.0.0.0')