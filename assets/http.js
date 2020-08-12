//定义全局API

// const $API = 'https://manghe.biaofun.com.cn/app';
// const $PNG = 'http://q9y6apjl5.bkt.clouddn.com/miniProgram';
// const $JUMP = 'https://manghe.biaofun.com.cn/';
const $API = 'https://toijoi-api.modian.com/app';
const $PNG = 'https://toijoi-box.modian.com/miniProgram';
const $JUMP = 'https://toijoi.modian.com/app';

//定义全局请求
const myRequest = setting => {
	// 创建异步请求
	return new Promise((resolve, reject) => {

		//定义默认配置
		let defaults = {

			//请求url
			url: $API,

			//请求数据
			data: {},

			//请求头
			header: {
				"Content-Type": "application/json",
				"authorization": uni.getStorageSync('token').authorization || '',
				"hash": uni.getStorageSync('token').hash || '',
				// #ifdef H5
				"ifh5" : 1,
				// #endif
			},

			//请求时间
			timeout: 15000,

			//请求方式
			method: 'post',

			//数据类型
			dataType: 'json',

			//响应类型
			responseType: 'text',

			//是否开启loading
			loading: true,

			//loading标题
			loadingTitle: '加载中',

			//是否开启提示
			toast: false,

			//提示标题
			toastTitle: '请求',

			//请求成功
			success(res) {
				if (res.header.authorization||res.header.Authorization) {
					// uni.setStorageSync('token', {
					// 	authorization: res.header.authorization||res.header.Authorization,
					// 	hash: res.header.hash
					// })
					if (res.header.authorization) {
						uni.setStorageSync('token', {
							authorization: res.header.authorization,
							hash: res.header.hash
						})
					} else {
						uni.setStorageSync('token', {
							authorization: res.header.Authorization,
							hash: res.header.hash
						})
					}
				}
				config.loading && uni.hideLoading();
				if (res.data.code == 200) {
					config.toast && uni.showToast({
						title: `${config.toastTitle}成功`
					})
					resolve(res.data.data);
				} else if (res.data.code == 9110) {
					uni.clearStorageSync();
					reject(res.data)
					uni.showModal({
						title: '系统提示',
						content: '身份已过期，请重新登录',
						success(suc) {
							if (suc.confirm) {
								if(res.data.special){
									uni.navigateTo({
										url: '/pages/login/login'
									})
								}else{
									uni.switchTab({
										url: '/pages/mine/mine'
									})
								}
							}
						}
					})
					return false;
				} else if (res.data.code == 9901) {
					uni.clearStorageSync();
					reject(res.data)
					uni.showModal({
						title: '未登录',
						content: '登录后可进行下一步操作',
						success(suc) {
							if (suc.confirm) {
								if(res.data.special){
									reject(res)
								}else{
									uni.switchTab({
										url: '/pages/mine/mine'
									})
								}
							}
						}
					})
					return false;
				} else {
					reject(res.data)
				}
			},

			//请求失败
			fail(err) {
				config.loading && uni.hideLoading();
				config.toast && uni.showToast({
					title: `${config.toastTitle}失败`,
					icon: 'none'
				})
				if(err.errMsg==="request:fail timeout"){
					uni.showToast({
						title:'请求超时，请稍后再试',
						icon:'none'
					})
				}
				console.log(err)
			},

		};
		//合并配置
		let config = Object.assign({}, defaults, setting);

		//loading
		config.loading && (uni.showLoading({
			title: config.loadingTitle,
			mask: true
		}))

		//微信请求
		uni.request(config)

	})
}

export {$API, $PNG, $JUMP, myRequest}
