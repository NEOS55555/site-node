const nodemailer  = require("nodemailer");
const silly = require('silly-datetime')
const fs = require('fs')
/**
 * @getClientIP
 * @desc 获取用户 ip 地址
 * @param {Object} req - 请求
 */
exports.getClientIP = (req) => {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
// id自增长
exports.getNextSequenceValue = (db, sequenceName) => {
	return new Promise((resolve, reject) => {
		db.findOneAndUpdate('counters', 
			{_id: sequenceName},
			{$inc:{value:1}},
			{new:true}
		).then(res => {
			resolve(res.value.value)
		}).catch(err => reject(err))
	})
}
const trim = (str='') => str.replace(/^\s+|\s+$/gm,'')
exports.trim = trim
// 创建文件夹

exports.mkdir =  (filepath) => {
    const arr=filepath.split('/');
    let dir='.';
    let f = false
    for(let i=0;i<arr.length;i++){
        dir += '/'+arr[i];
    		// console.log(dir,i,fs.existsSync(dir), dirCache[dir])
        if(!fs.existsSync(dir)){
            fs.mkdirSync(dir);
            // console.log(dir+'创建成功')
            f = true;
        }
    }
    return f;
}
/*exports.mkdir = (() => {
	const dirCache={};
	return (filepath) => {
	    const arr=filepath.split('/');
	    let dir='.';
	    let f = false
	    for(let i=0;i<arr.length;i++){
	        dir += '/'+arr[i];
	    		// console.log(dir,i,fs.existsSync(dir), dirCache[dir])
	        if(!dirCache[dir]&&!fs.existsSync(dir)){
	            dirCache[dir]=true;
	            fs.mkdirSync(dir);
	            // console.log(dir+'创建成功')
	            f = true;
	        }
	    }
	    return f;
	}
})();*/

exports.deleteFolder = function (path, onlyFile=false) {
	let files = [];
	if( fs.existsSync(path) ) {
	    files = fs.readdirSync(path);
	    files.forEach(function(file,index){
	        let curPath = path + "/" + file;
	        if(fs.statSync(curPath).isDirectory()) {
	            deleteFolder(curPath);
	        } else {
	            fs.unlinkSync(curPath);
	        }
	    });
	    !onlyFile && fs.rmdirSync(path);
	}
}

exports.isLegal = (str='') => {
	if (typeof str === 'number') {
		return !isNaN(str);
	}
	if (str === '' || str === null) {
		return false;
	}
	const reg = /[\s\@\#\$\%\^\&\*\{\}\:\.\"\'\<\>\?\|]/ig
	return !reg.test(str)
}
// 不包含空格
exports.isLegalExps = (str='') => {
	if (typeof str === 'number') {
		return !isNaN(str);
	}
	if (str === '' || str === null) {
		return false;
	}
	const reg = /[\@\#\$\%\^\&\*\{\}\:\.\"\'\<\>\?\|]/ig
	return !reg.test(str)
}
exports.checkMail = (mail='') => {
	if (mail === '' || mail === null) {
		return false;
	}
	const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
	return reg.test(mail)
}
exports.checkUrl = (url='') => {
	if (url === '' || url === null) {
		return false;
	}
	const reg = /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
	return reg.test(url)
}
/*exports.getCookie = (str='') => {
	const arr = str.split(';');
	const map = {};
	arr.forEach(it => {
		const t = it.split('=')
		map[t[0]] = decodeURIComponent(t[1])
	})
	return map;
}*/

exports.sendMail = function (tos, subject, html) {
	return new Promise((resolve, reject) => {
		// const fromm = '778007921@qq.com'
		const fromm = 'starryskydark@foxmail.com'
		const smtpTransport = nodemailer.createTransport({
	        
	        service:"qq",
	        secureConnection: true, // use SSL
	        secure: true,
	        port: 465,
	        auth: {
	            user: fromm,
	            pass: 'llowjcrdgoulbbce',
	            // pass: 'goxzuzorfvqpbeeg',
	        }
	    });
		try {
			smtpTransport.sendMail({
		        //fromm    : '标题别名 <foobar@latelee.org>',
		        from: '好玩实用网<' + fromm + '>',
		        //'li@latelee.org, latelee@163.com',//收件人邮箱，多个邮箱地址间用英文逗号隔开
		        to: tos,
		        subject,//邮件主题
		        //text    : msg,
		        html
		    }, function(err, res) {
		        if (err) {
		        	reject(err)
		        } else {
		        	resolve(res)
		        }
		    });
		} catch (err) {
			reject(err)
		}
	    
	}) 
}
exports.clearRepArr = arr => {
	let map = {};
	for (let i = 0, len = arr.length; i < len; i++) {
		map[arr[i]] = arr[i];
	}
	let a = [];
	for (let i in map) {
		a.push(map[i])
	}
	return a;
}

// 获取文字字符长度
exports.getStrChartLen = (str='') => {  
  let len = 0;  
  for (var i=0; i<str.length; i++) {  
    if (str.charCodeAt(i)>127 || str.charCodeAt(i)==94) {  
       len += 2;  
     } else {  
       len ++;  
     }  
   }  
  return len;  
}

exports.fromatIOSDate = date => silly.format(date, 'YYYY-MM-DD HH:mm:ss')

exports.strSearch = (str='') => {
	str = trim(str);
	if ( /\$\(\)\*\+\.\[\]\?\\\/\^\{\}/ig.test(str)) {
		str = '\\' + str;
	}
	let reg = null
	try {
		reg = new RegExp(str, 'gim')
	} catch (e) {
		reg = new RegExp('')
		console.log('reg err')
	}	
	return reg;
}