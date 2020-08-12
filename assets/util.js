import {
	$API,
	$PNG,
	$JUMP,
	myRequest
} from '../assets/http.js'
// #ifdef H5
import jwx from '../assets/jweixin.js'
// #endif
class utils {
	constructor(arg) {
		this.name = 'util';
		this.SystemInfo = {};
		this.getSystemInfo();
	}
	getSystemInfo() {
		uni.getSystemInfo({
			success: res => {
				this.SystemInfo = res;
			}
		})
	}
	timeChange(timestamp, type) {
		timestamp = timestamp + '';
		timestamp = timestamp.length == 10 ? timestamp * 1000 : timestamp;
		var date = new Date(timestamp);
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		m = m < 10 ? ('0' + m) : m;
		var d = date.getDate();
		d = d < 10 ? ('0' + d) : d;
		var h = date.getHours();
		h = h < 10 ? ('0' + h) : h;
		var minute = date.getMinutes();
		var second = date.getSeconds();
		minute = minute < 10 ? ('0' + minute) : minute;
		second = second < 10 ? ('0' + second) : second;
		return type ? y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second : y + '-' + m + '-' + d;
	}
	
	// #ifdef H5
	getSDK(title="贪玩集", path="/pages/index/index",desc="贪玩集",imageUrl=$PNG + '/logo.png', callback) {
		let API = `${$JUMP}/h5/#`
		myRequest({
			url: `${$API}/wechat/jssdk`,
			data: {
				url: window.location.href
			},
			loading: false
		}).then(({
			appId,
			timestamp,
			nonceStr,
			signature,
			jsApiList
		}) => {
			jwx.config({
				appId,
				timestamp,
				nonceStr,
				signature,
				jsApiList,
			});
			jwx.ready(function() {
				jwx.onMenuShareTimeline({
					title: title, // 分享标题
					link: API + path, // 分享链接
					imgUrl: imageUrl, // 分享图标
					success: function() {
						callback()
					}
				});
				jwx.onMenuShareAppMessage({
					title: title, // 分享标题
					desc: desc, // 分享描述
					link: API + path, // 分享链接
					imgUrl: imageUrl, // 分享图标
					type: 'link', // 分享类型,music、video或link，不填默认为link
					success: function() {
						callback()
					},
					cancel: function() {
						// 用户取消分享后执行的回调函数
					}
				});
			});
		}).catch((err) => {
			console.log(err);
		})
	}
	// #endif
}

let util = new utils();

export default util
