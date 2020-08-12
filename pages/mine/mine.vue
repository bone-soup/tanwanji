<template>
	<!-- 我的开始 -->
	<view class="content">
		<view class="mine-container">
			<!-- 个人信息 -->
			<view class="mine-msg">
				<view class="box" v-if="token">
					<image :src="userInfo.avatarUrl" mode="aspectFill"></image>
					<view>
						<text class="name">{{ userInfo.name || '' }}</text>
						<text class="point">积分：{{ userInfo.point || '0' }}</text>
					</view>
				</view>
				<view class="box" v-else>
					<!-- #ifdef MP-WEIXIN -->
					<button class="login" open-type="getUserInfo" @getuserinfo="toLogin" lang="zh_CN">
						<image :src="userInfo.avatarUrl" class="img" mode="aspectFit"></image>
						<text>点击登录</text>
					</button>
					<!-- #endif -->
					<!-- #ifdef H5 -->
					<button class="login" @click="toLogin">
						<image :src="userInfo.avatarUrl" class="img" mode="aspectFit"></image>
						<text>点击登录</text>
					</button>
					<!-- #endif -->
				</view>
			</view>

			<!-- 我的盒柜 -->
			<view class="mine-box" @click="navToBox">
				<view class="title-line">
					<text>我的盒柜</text>
					<image src="/static/images/icon-arrow.png" mode="aspectFit"></image>
				</view>
				<view class="box-list" v-if="boxList.length>0">
					<view v-for="item in boxList" :key="item.id" class="item">
						<view class="border">
							<image :src="item.picture" mode="aspectFit"></image>
						</view>
						<view class="dot"></view>
					</view>
				</view>
				<view class="all-data" v-else>{{noBox}}</view>
			</view>

			<!-- 我的订单 -->
			<view class="mine-order">
				<view class="title-line" @click="toOrder(10)">
					<text>我的订单</text>
					<view>
						<text>全部订单</text>
						<image src="/static/images/icon-arrow.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="order-box">
					<view v-for="(item,index) in navList" :key="index" @click="toOrder(item.type)">
						<image :src="item.src" mode=""></image>
						<text>{{item.name}}</text>
					</view>
				</view>
			</view>
			
			<!-- 功能列表 -->
			<view class="mine-list">
				<view class="line" @click="navToCards">
					<text>卡券包</text>
					<image src="/static/images/icon-arrow.png" mode=""></image>
				</view>
				<view class="line" @click="navToAddress">
					<text>收货地址</text>
					<image src="/static/images/icon-arrow.png" mode=""></image>
				</view>
				<view class="border"></view>
				<view class="line" @click="navToProtocol">
					<text>使用协议</text>
					<image src="/static/images/icon-arrow.png" mode=""></image>
				</view>
				<view class="line" @click="navToRules">
					<text>规则</text>
					<image src="/static/images/icon-arrow.png" mode=""></image>
				</view>
				<view class="line">
					<text>音效</text>
					<view class="switch-box" :class="{'on':userInfo.configs.sound}" @click="voiceSwitch">
						<view class="switch-btn"></view>
					</view>
				</view>
				<view class="line">
					<text>弹幕</text>
					<view class="switch-box" :class="{'on':userInfo.configs.bullet}" @click="bulletSwitch">
						<view class="switch-btn"></view>
					</view>
				</view>
				<!-- #ifdef MP-WEIXIN -->
				<view class="line">
					<button type="default" open-type="contact" bindcontact="handleContact">
						<text>在线客服</text>
						<image src="/static/images/icon-arrow.png" mode=""></image>
					</button>
				</view>
				<!-- #endif -->

			</view>
		</view>

		<!-- mine end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 用户信息
				userInfo: {
					name: '',
					avatarUrl: `${this.$PNG}/login.png`,
					configs:{
						sound:true,
						bullet:true
					}
				},
				navList:[
					{
						type:20,
						src:`${this.$PNG}/mine-icona.png`,
						name:'待发货'
					},
					{
						type:30,
						src:`${this.$PNG}/mine-iconb.png`,
						name:'已发货'
					},
					{
						type:40,
						src:`${this.$PNG}/mine-iconc.png`,
						name:'已完成'
					}
				],
				boxList: [],
				token:'', // 是否登录
				noBox:'我的盒柜空空如也~',									// 我的盒柜信息
			};

		},
		onPullDownRefresh() {
			if(uni.getStorageSync('token')){
				this.userInfo = uni.getStorageSync('userInfo');
				this.token = true;
				this.getUserInfo().then((res)=>{
					 this.requestBoxList();
				}).catch((err)=>{
					if (err.code=='9110') {
						this.token = false
						this.userInfo = {
							name: '',
							avatarUrl: `${this.$PNG}/login.png`,
							configs:{
								sound:true,
								bullet:true
							}
						}
					}
				});
			}else{
				this.token = false;
				this.boxList = [];
				this.userInfo = {
					name: '',
					avatarUrl: `${this.$PNG}/login.png`,
					configs:{
						sound:true,
						bullet:true
					}
				}
			}
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1200)
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		onLoad({authorization,hash,msg}) {
			// #ifdef H5
			if (msg) {
				uni.showToast({
					title:msg,
					icon:'none'
				});
			}
			if(authorization && hash){
				uni.setStorageSync('token',{
					"authorization":authorization,
					"hash":hash,
				});
				window.location.replace('/h5/#/pages/mine/mine')
			}
			// #endif
		},
		onShow() {
			if(uni.getStorageSync('token')){
				console.log('有token')
				this.userInfo = uni.getStorageSync('userInfo');
				this.token = true;
				this.getUserInfo().then((res)=>{
					this.requestBoxList();
				}).catch((err)=>{
					console.log(err);
					if (err.code=='9110') {
						this.token = false
						this.userInfo = {
							name: '',
							avatarUrl: `${this.$PNG}/login.png`,
							configs:{
								sound:true,
								bullet:true
							}
						}
					}
				});
			}else{
				console.log('没有token')
				console.log(uni.getStorageSync('token'));
				this.token = false;
				this.boxList = [];
				this.userInfo = {
					name: '',
					avatarUrl: `${this.$PNG}/login.png`,
					configs:{
						sound:true,
						bullet:true
					}
				}
			}
		},

		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 立即登录
			 * ****************************************************************************************************
			 */
			toLogin(e) {
				const that = this;
				console.log(e);
				// #ifdef MP-WEIXIN
				if (e.detail.errMsg == "getUserInfo:ok") {
					uni.login({
						provider: 'weixin',
						success: (loginRes) => {
							console.log(loginRes);
							uni.getUserInfo({
								provider: 'weixin',
								success: function (infoRes) {
									console.log(infoRes);
									that.$RQST({
										url: `${that.$API}/passport/login`,
										data: {
											code: loginRes.code,
											user: JSON.parse(e.detail.rawData),
											iv:uni.getStorageSync('iv')||'',
											wxiv:infoRes.iv,
											encryptedData:infoRes.encryptedData,
											signature:infoRes.signature
										}
									}).then((res) => {
										that.$store.commit('bindPhone',res.is_phone);
										if (res.is_phone) {
											// 如果已经绑定手机号
											that.userInfo = JSON.parse(e.detail.rawData);
											that.token = true;
											that.getUserInfo().then((res)=>{
												that.requestBoxList();
											}).catch((err)=>{
												console.log(err);
											});
											uni.setStorageSync('token',res);
										}else{
											// 如果没有绑定手机号
											uni.removeStorageSync('token');
											uni.setStorageSync('bindMsg',res);
											uni.redirectTo ({
												url:`/pages/login/login?type=1`
											})
										}
									}).catch((err)=>{
										console.log(err);
										if (err.code=='4031') {
											// 如果第一次登录失败，再次login，getUserInfo
											uni.login({
												provider: 'weixin',
												success: (loginRes) => {
													console.log(loginRes);
													uni.getUserInfo({
														provider: 'weixin',
														success: function (infoRes) {
															console.log(infoRes);
															that.$RQST({
																url: `${that.$API}/passport/login`,
																data: {
																	code: loginRes.code,
																	user: JSON.parse(e.detail.rawData),
																	iv:uni.getStorageSync('iv')||'',
																	wxiv:infoRes.iv,
																	encryptedData:infoRes.encryptedData,
																	signature:infoRes.signature
																}
															}).then((res) => {
																that.$store.commit('bindPhone',res.is_phone);
																if (res.is_phone) {
																	// 如果已经绑定手机号
																	that.userInfo = JSON.parse(res.rawData);
																	that.token = true;
																	that.getUserInfo().then((res)=>{
																		that.requestBoxList();
																	}).catch((err)=>{
																		console.log(err);
																	});
																	uni.setStorageSync('token',res);
																}else{
																	// 如果没有绑定手机号
																	uni.removeStorageSync('token');
																	uni.setStorageSync('bindMsg',res);
																	uni.redirectTo ({
																		url:`/pages/login/login?type=1`
																	})
																}
															}).catch((err)=>{
																console.log(err);
																uni.showToast({
																	title:err.msg,
																	icon:'none'
																})															
															})
														}
													})
												},
											});
										}else{
											uni.showToast({
												title:err.msg,
												icon:'none'
											})
										}
									})
								}
							})
						},
					});
				}
				// #endif
				// #ifdef H5
				window.location.href = `${this.$JUMP}/passport/h5/login?iv=${uni.getStorageSync('iv')||''}`;
				// #endif
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 获取用户信息
			 * ****************************************************************************************************
			 */
			getUserInfo() {
				return new Promise((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/users/account`,
					}).then((res) => {
						this.userInfo = res;
						uni.setStorageSync('userInfo',this.userInfo)
						if(this.userInfo.configs.sound){
							this.$store.commit('openMusic')
						}else{
							this.$store.commit('closeMusic')
						}
						resolve(res);
					}).catch((err)=>{
						this.token = false;
						console.log('问题users/account：：：：：：：：：：：：：：：：：：'+JSON.stringify(err));
						this.userInfo = {
							name: '',
							avatarUrl: `${this.$PNG}/login.png`,
							configs:{
								sound:false,
								bullet:false
							}
						}
						reject(err);
					})
				})
			},
			
			// 点击在线客服
			handleContact(e) {
				console.log(e.detail.path);
				console.log(e.detail.query);
			},
			
			// 点击音效开关
			voiceSwitch: function() {
				const that = this;
				that.$RQST({
					url: `${that.$API}/users/configs/sound`,
					data:{
						sound:!that.userInfo.configs.sound
					},
					// loading:false
				}).then((res) => {
					that.userInfo.configs.sound = !that.userInfo.configs.sound;
					if(that.userInfo.configs.sound){
						this.$store.commit('openMusic')
					}else{
						this.$store.commit('closeMusic')
					}
					uni.showToast({
						title: that.userInfo.configs.sound?'已开启音效':'已关闭音效',
						icon: 'none',
						duration: 2000
					});
					this.getUserInfo();
				}).catch((err) => {
					console.log(err);
				})
			},
			
			// 点击弹幕开关
			bulletSwitch: function() {
				const that = this;
				that.$RQST({
					url: `${that.$API}/users/configs/bullet`,
					data:{
						bullet:!that.userInfo.configs.bullet
					},
					// loading:false
				}).then((res) => {
					that.userInfo.configs.bullet = !that.userInfo.configs.bullet;
						uni.showToast({
							title: that.userInfo.configs.bullet?'已开启弹幕':'已关闭弹幕',
							icon: 'none',
							duration: 2000
						});
						this.getUserInfo();
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击卡券包
			navToCards: function() {
				uni.navigateTo({
					url: '/pages/mineCards/mineCards'
				});
			},
			// 点击协议
			navToProtocol: function() {
				uni.navigateTo({
					url: '/pages/mineProtocol/mineProtocol'
				});
			},
			// 点击规则
			navToRules: function() {
				uni.navigateTo({
					url: '/pages/mineRules/mineRules'
				});
			},
			// 点击我的盒柜
			navToBox: function() {
				uni.navigateTo({
					url: '/pages/mineBox/mineBox'
				});
			},
			// 点击收货地址
			navToAddress: function() {
				uni.navigateTo({
					url: '/pages/mineAddress/mineAddress'
				});
			},
			// 点击我的订单
			toOrder: function(e) {
				console.log(e);
				uni.navigateTo({
					url: `/pages/mineOrder/mineOrder?nav=${e}`
				});
			},
			// 请求我的盒柜信息
			requestBoxList:function () {
				const that = this;
				that.$RQST({
					url: `${that.$API}/users/cabinet/home`,
					loading: false,
				}).then((res) => {
					console.log(res);
					that.boxList = res;
					that.noBox = '我的盒柜空空如也~';
				}).catch((err) => {
					console.log('问题cabinet/home：：：：：：：：：：：：：：：：：：'+err);
					that.boxList = [];
				})
			}
		},
	};
</script>

<style lang="scss">
	.mine-container {
		width: 100%;
		position: relative;
	}

	.mine-msg {
		width: 100%;
		height: 420rpx;
		background: $cl-main;

		.box {
			padding: 70rpx 70rpx 0;
			display: flex;
			align-items: center;

			image {
				width: 154rpx;
				height: 154rpx;
				border-radius: 50%;
				margin-right: 20rpx;
				flex-shrink: 0;
				border: 5rpx solid $cl-white;
			}

			.img {
				border: none;
			}
			
			.login{
				margin: 0;
				height: 155rpx;
				width: 100%;
				text-align: left;
				display: flex;
				justify-content: left;
			}

			view {
				.name {
					color: $cl-white;
					font-size: 34rpx;
					width: 100%;
					display: inline-block;
					margin-bottom: 20rpx;
					padding: 0;
				}

				.point {
					display: inline-block;
					color: $cl-white;
					font-size: 26rpx;
					width: 100%;
					padding: 0;
				}
			}

			.imgbox {
				width: 158rpx;
				height: 158rpx;
				background: rgba(255, 255, 255, 1);
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;

				image {
					width: 73rpx;
					height: 73rpx;
					border-radius: 0;
					border: none;
					margin: 0;
				}
			}

			text {
				color: $cl-white;
				font-size: $fs-34;
				padding: 20rpx 20rpx 20rpx 0;
			}
		}
	}

	.mine-box {
		width: 710rpx;
		display: block;
		margin: -132rpx auto 0;
		border-radius: $radius-30;
		background: $cl-white;
		padding: 40rpx;

		.box-list {
			width: 100%;
			display: flex;
			padding: 40rpx 0 10rpx;
			align-items: center;

			.item {
				width: 25%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;

				.border {
					width: 146rpx;
					height: 146rpx;
					border: 1px solid $cl-main;
					border-radius: 50%;
					overflow: hidden;
					display: flex;
					align-items: center;
					justify-content: center;

					image {
						width: 100%;
						height: 100%;
					}
				}

				.dot {
					width: 15rpx;
					height: 15rpx;
					background: $cl-main;
					border-radius: 50%;
					margin-top: 20rpx;
				}
			}
		}
	}

	.title-line {
		display: flex;
		align-items: center;
		justify-content: space-between;

		text {
			font-size: $fs-40;
			color: $cl-black;
		}

		image {
			width: 15rpx;
			height: 22rpx;
		}

		view {
			display: flex;
			align-items: center;

			text {
				color: $cl-gray3;
				font-size: $fs-24;
				margin-right: 12rpx;
			}
		}
	}

	.mine-order {
		width: 710rpx;
		display: block;
		margin: 20rpx auto;
		border-radius: $radius-30;
		background: $cl-white;
		padding: 40rpx;
	}

	.order-box {
		padding: 40rpx 30rpx 0;
		display: flex;
		align-items: center;
		justify-content: space-between;

		view {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			image {
				width: 80rpx;
				height: 80rpx;
				margin-bottom: 20rpx;
			}
		}
	}

	.mine-list {
		width: 710rpx;
		display: block;
		margin: 20rpx auto 50rpx;
		border-radius: $radius-30;
		background: $cl-white;
		padding: 40rpx 20rpx;

		.line {
			padding: 0 20rpx;
			height: 75rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			text {
				color: $cl-black;
				font-size: $fs-34;
			}

			button {
				display: flex;
				align-items: center;
				justify-content: space-between;
				width: 100%;
				background: none;
			}
		}

		image {
			width: 15rpx;
			height: 22rpx;
			margin-right: 10rpx;
		}

		.border {
			border-bottom: 1px solid #efefef;
			margin-bottom: 25rpx;
			padding-bottom: 25rpx;
		}
	}

	.switch-box {
		width: 100rpx;
		height: 60rpx;
		border-radius: 60rpx;
		border: 3rpx solid #eeeeee;
		transition: all .2s ease-out;
		display: flex;
		align-items: center;
		padding-left: 2rpx;

		.switch-btn {
			height: 50rpx;
			width: 50rpx;
			background: $cl-white;
			border-radius: 50%;
			box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, .17);
			transition: all .2s ease-out;
		}
	}

	.switch-box.on {
		background: $cl-main;
		border: 3rpx solid $cl-main;

		.switch-btn {
			transform: translateX(42rpx);
		}
	}
</style>
