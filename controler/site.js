const sitedb = require('../model/currentDbs')
const path = require('path')
const fs = require('fs');
// const formidable = require('formidable');
const multiparty = require('multiparty');
const imgsType = ['.jpg', '.jpeg', '.png', '.gif', ]
const silly = require('silly-datetime')
const {
	prevCheck,
	checkLegal,
	success, 
	failed,
	checkUserLogin,
} = require('./com')
const {
	getNextSequenceValue, 
	deleteFolder,
	mkdir,
	checkUrl,
	trim,
} = require('../model/common.js')

const {
	DRAFT_CODE,
	DELETE_CODE,
	NORMAL_CODE,
	REVIEW_CODE
} = require('./constant')

// 检查网站新增以及编辑的参数是否正确
async function checkSiteParam (req, res, fields, _id) {
	let {_id: t_id, name: [name=''], url: [url=''], desc: [desc=''], catalog=[], status: [tStatus=NORMAL_CODE], img, tags=[]} = fields
	name = trim(name);
	url = trim(url);
	desc = trim(desc);

	// console.log(fields, tCagalog)
	// const catalog = tCagalog ? tCagalog.split(',').map(num => parseInt(num)) : [];

	const status = parseInt(tStatus)
	// console.log(status)
	// console.log(catalog)
	// return res.json(failed(fields, 'ttt'))
	if (isNaN(status)) {
		res.json(failed('', 'status code error!'))
		return false;
	}
	// 所有状态-至少要有名字
	if (!checkLegal(res, name, '网站名称')) {
		return false;
	}
	/*if (!name) {
		res.json(failed('', '请填写！'))
		return false;
	}*/
	if (!checkUrl(url)) {
		res.json(failed('', '网站地址不合法！'))
		return false;
	}
	/*if (status == NORMAL_CODE && !checkLegal(res, url, '网站地址')) {
		// res.json(failed('', '请填写网站地址！'))
		return false;
	}*/
	// if (status == NORMAL_CODE && !checkLegal(res, desc, '网站描述')) {
	if (status == NORMAL_CODE && !desc) {
		// res.json(failed('', '请填写网站描述！'))
		return false;
	}
	
	if (status == NORMAL_CODE && !catalog.length > 0) {
		res.json(failed('', '请选择网站所属分类！'))
		return false;
	}
	if (status == NORMAL_CODE && !tags.length > 0) {
		res.json(failed('', '请添加网站标签！'))
		return false;
	}
	/*if (status == NORMAL_CODE && !checkLegal(res, tCagalog, '网站所属分类')) {
		// res.json(failed('', '请选择网站所属分类！'))
		return false;
	}*/
	/*if (status == NORMAL_CODE && !checkLegal(res, tTags, '网站标签')) {
		// res.json(failed('', '请选择网站所属分类！'))
		return false;
	}*/
	if (catalog.length > 3) {
		res.json(failed('', '最多选择3个分类！'))
		return false;
	}
	if (tags.length > 5) {
		res.json(failed('', '最多添加5个标签！'))
		return false;
	}

	const conditoin = _id !== undefined ? { _id: {$ne: _id}, url, status: NORMAL_CODE} : {url, status: NORMAL_CODE}
	const siteList = await sitedb.find('sites', conditoin)
	if (siteList.length > 0) {
		res.json(failed('', '该网站已存在！'))
		return false;
	}
	return true;
}

function checkSiteImg (req, res, fields, files, _id) {
	const {img} = fields
	let imgsrc, fileurl, tname
	const { status: [tStatus=NORMAL_CODE] } = fields
	// console.log('site', files.img)
	// const catalog = tCagalog ? tCagalog.split(',').map(num => parseInt(num)) : [];

	const status = parseInt(tStatus)

	if (files.img) {
		const extname = path.extname(files.img[0].originalFilename).toLowerCase();
		if (imgsType.indexOf(extname) == -1) {
			res.json(failed('', '图片格式不对！'))
			return false;
		} 

		const oldpath = files.img[0].path;
		// 判断文件尺寸
		var size = parseInt(files.img[0].size);
		if (size > 1024 * 1024) {
			// 删除图片
			// 这个path是图片存入的地址
			fs.unlink(oldpath);
			res.json(failed('', '图片尺寸大于1M！'))
			return false;
		}

		// 重新命名并转存 
		var ttt = silly.format(new Date(), 'YYYYMMDDHHmmss')
		tname = ttt + parseInt(Math.random() * 99999) + extname
		
		fileurl = `/upload/${_id}/${tname}`
		// 如果图片改变了就先删除图片,但并不删除文件夹
		deleteFolder(path.join(__dirname,`../upload/${_id}`), true)
		mkdir(`/upload/${_id}`)
		const newpath = path.resolve(__dirname+'/../' + fileurl)
		try {
			fs.renameSync(oldpath, newpath)
		} catch (err) {
			console.log('checkSiteImg', err)
			fs.unlink(oldpath);
			res.json(failed('', '图片重命名出错!'))
			return false;
		}
	} else if (img) {
		imgsrc = img[0];
		
	} else if (status == NORMAL_CODE) {
		res.json(failed('', '请选择网站展示图片！'))
		return false;
	}
	return {
		imgsrc, fileurl, tname
	}
}

async function getStatus (user_id, tStatus) {
	let status = parseInt(tStatus)
	const [user] = await sitedb.find('users', {_id: user_id})
	// 不是管理员，但是想上架, 直接改为待审核状态
	if (!user.is_super && status == NORMAL_CODE) {
		status = REVIEW_CODE
	}

	return status;
}
// 新增网站-两种状态-草稿和正常都是用这个接口
exports.addSite = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const { _id: user_id } = checkUserLogin(req, res)
	if (!user_id) {
		return ;
	}
	// 设置上传到的哪个文件夹
	var form = new multiparty.Form();
	// var form = new formidable.IncomingForm();
	form.uploadDir = path.resolve(__dirname+'/../tempup/')
	form.parse(req, async function (err, fields, files) {
		if (err) {
			console.log('addSite', err)
			return res.json(failed(err))
		}
		const { name: [name=''], url: [url=''], desc: [desc=''], catalog=[], status: [tStatus=NORMAL_CODE], tags } = fields

		// return res.json(failed(fields, 'ttt'))
		if (!await checkSiteParam(req, res, fields)) {
			return ;
		}

		let status = await getStatus(user_id, tStatus)
		// 保存网站
		getNextSequenceValue(sitedb, 'siteId').then(_id => {
			const isImgOk = checkSiteImg(req, res, fields, files, _id);
			if (!isImgOk) {
				return;
			}
			const {imgsrc, fileurl, tname} = isImgOk;
			
			const time = silly.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
			sitedb.insertOne('sites', {
				_id, 
				name, 
				url, 
				desc, 
				img: fileurl ? `/img/${_id}/${tname}` : imgsrc ? imgsrc : '', 
				catalog: catalog.map(n => parseInt(n)), 
				create_time: time, 
				update_time: time, 
				views: 0,
				status,
				tags,
				create_user_id: user_id,
				update_user_id: user_id,
			}).then(data => {
				res.json(success('ok'))
			})
		}).catch(err => res.json(failed(err)))
	})
}
// 新增网站-两种状态-草稿和正常都是用这个接口
exports.editSite = async (req, res, next) => {
	if (!prevCheck(req, res)) {
		return;
	}
	const { _id: user_id } = checkUserLogin(req, res)
	if (!user_id) {
		return ;
	}
	// 设置上传到的哪个文件夹
	var form = new multiparty.Form();
	form.uploadDir = path.resolve(__dirname+'/../tempup/')
	form.parse(req, async function (err, fields, files) {
		if (err) {
			console.log('editSite', err)
			return res.json(failed(err))
		}
		const {_id: [t_id], name: [name=''], url: [url=''], desc: [desc=''], catalog=[], status: [tStatus=NORMAL_CODE], tags=[], orgStatus: [orgStatus]} = fields



		const _id = parseInt(t_id)
		// return res.json(failed(fields, 'ttt'))
		// 所有状态-至少要有名字
		if (!_id) {
			return res.json(failed('', 'user code error!'))
		}
		if (!await checkSiteParam(req, res, fields, _id)) {
			return ;
		}
		
		let status = await getStatus(user_id, tStatus)
		console.log(orgStatus, status)
		// YOU WEN TI
		if (parseInt(orgStatus) === NORMAL_CODE && status === DRAFT_CODE) {
			return res.json(failed('', '权限不足！'))
		}
		if (parseInt(orgStatus) === NORMAL_CODE && status === REVIEW_CODE) {
			return res.json(failed('', '已上架，不可重复提交！'))
		}

		const isImgOk = checkSiteImg(req, res, fields, files, _id);
		if (!isImgOk) {
			return;
		}
		const {imgsrc, fileurl, tname} = isImgOk;
		
		// 保存网站
		const time = silly.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
		sitedb.updateOne('sites', {_id}, {
			$set: {
				update_user_id: user_id,
				name, 
				url, 
				desc, 
				img: fileurl ? `/img/${_id}/${tname}` : imgsrc ? imgsrc : '', 
				catalog: catalog.map(n => parseInt(n)), 
				// create_time: time, 
				update_time: time, 
				// views: 0,
				status,
				tags,
			}
		}).then(data => {
			res.json(success('ok'))
		})
	})
}