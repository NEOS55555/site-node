const fs = require('fs');


const RET = fs.readFileSync(__dirname + '/private.key').toString();

const DRAFT_CODE = 2;
const DELETE_CODE = 0;
const NORMAL_CODE = 1;
const REVIEW_CODE = 3;	// 待审核

const MAIL_MAX_COUNT = 5;

const REG_CODE_EXP = 30 * 60 * 1000;

// const RET = 'shhhhh';

// 秒
const LOGIN_DURATION = 60 * 120
const SSVIP_EMAIL = '778007921@qq.com'
const superEmail = [SSVIP_EMAIL]
const LOG_OVERDUE_CODE = 233;

module.exports = {
	FEEDBACK_SITEID: 0,	// 用户反馈的评论--对应的网站id
	MAX_SITE_IMG: 2,	// 网站封面图最大2m
	LOG_OVERDUE_CODE,
	OVERDUE_RES: {resultCode: LOG_OVERDUE_CODE},
	SSVIP_EMAIL, 
	DRAFT_CODE,
	DELETE_CODE,
	NORMAL_CODE,
	REVIEW_CODE,
	STATUS_ARR: [DRAFT_CODE, DELETE_CODE, NORMAL_CODE, REVIEW_CODE],
	REG_CODE_EXP,
	RET,
	superEmail,
	MAIL_MAX_COUNT,
	LOGIN_DURATION,
	MAX_COMMIT_LEN: 400,	// 评论最多多少个字，前端校验为400
	// MIN_NAME_CHART: 4,	// 文字最少14个字符
	MAX_NAME_CHART: 14,	// 文字最多14个字符
	MAX_SITE_NAME: 40,	// 文字最多40个字符
	ONE_DAY_MAX_ADD: 5,	// 每日新增最多5条
	MAX_SIT_DESC: 600,		// 文字个数,前端为400，多的200是各种标签
	REGISTER_CODE: 'REGISTER_CODE',
	RESET_PASSWORD_CODE: 'RESET_PASSWORD_CODE'
}