const svgCaptcha = require('svg-captcha');

module.exports = function(req, res, next){
  /*var captcha = svgCaptcha.create({ 
    inverse: false, // 翻转颜色 
    fontSize: 48, // 字体大小 
    noise: 2, // 噪声线条数 
    width: 100, // 宽度 
    height: 32, // 高度 
    size: 4,// 验证码长度
    color: true,// 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
  });*/
  var captcha = svgCaptcha.createMathExpr({ 
    inverse: false, // 翻转颜色 
    fontSize: 46, // 字体大小 
    noise: 2, // 噪声线条数 
    width: 100, // 宽度 
    height: 32, // 高度 
    size: 4,// 验证码长度
    mathMin: 10,
    mathMax: 99,
    ignoreChars: '0o1i', // 验证码字符中排除 0o1i
    color: true,// 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
    // background: '#e8e3e3'// 验证码图片背景颜色
  }) 
  // 保存到session,忽略大小写 
  req.session.loginCode = captcha.text.toLowerCase(); 
  // console.log(req.session.yzm); //0xtg 生成的验证码
  //保存到cookie 方便前端调用验证
  // res.cookie('captcha', req.session); 
  res.setHeader('Content-Type', 'image/svg+xml');
  res.write(String(captcha.data));
  res.end();
}