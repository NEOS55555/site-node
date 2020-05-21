const express = require('express');
const path = require('path')
const fs = require('fs')

const formidable = require("formidable");
const bodyParser = require('body-parser');
const {sitedb} = require('./model/currentDbs')
const {getClientIP , getNextSequenceValue} = require('./model/common.js')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const router = require('./controler/index')

const app = express();

app.use(session({
  name: 'machineCookie',
  secret:"w*yui2.qhiu",		//设置签名秘钥  内容可以任意填写
  // cookie:{maxAge:30 * 1000 * 60},		//设置cookie的过期时间，例：30minutes后session和相应的cookie失效过期
  // cookie:{maxAge: 20 * 1000},		// 测试用
  resave:false,			//强制保存，如果session没有被修改也要重新保存
  saveUninitialized: false		//如果原先没有session那么久设置，否则不设置
}))

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static('./public'));
app.use('/img', express.static('./upload'));

// 每隔一段时间最好，自动修改超级管理员的密码

// 获取网站类型列表
app.post('/getCatalogList', router.getCatalogList)

// 获取网站列表
app.post('/getSiteList', router.getSiteList)


// 添加网站
app.post('/addSite', router.addSite)

// 添加网站
app.post('/editSite', router.editSite)
// 添加分类
app.post('/addCatalog', router.addCatalog)
// 用户注册
app.post('/register', router.register)
// 用户登录
app.post('/login', router.login)

// 删除网站
app.post('/delSite', router.delSite)
app.post('/sendRegMailCode', router.sendRegMailCode)
// 清除图片缓存
app.post('/clearImgCache', router.clearImgCache)
app.get('/getIP', router.getIP)
// 设置评分
app.post('/setRate', router.setRate)
app.post('/addView', router.addView)
app.get('/getsession', (req, res) => {
	console.log(req.cookies)
	console.log(req.session)
	console.log('-----------------------')
	res.send(req.session)
})

// 获取验证码
app.get('/getCaptcha', router.getCaptcha)
app.get('/system', router.enterSystem)
app.get('/', router.getPage)


app.listen(7890, '0.0.0.0')