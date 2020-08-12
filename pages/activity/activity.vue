<template>
	<!-- 活动页面 -->
	<view class="content activity-container">
		<view class="total">
			<view>
				<text>我的积分：</text>
				<view :class="{'large':userInfo.point.length>6||userInfo.point>999999}">{{ userInfo.point }}</view>
			</view>
			<navigator url="/pages/minePoint/minePoint" type="default">积分明细</navigator>
		</view>

		<view class="limited-time">
			<view class="module-title">限时活动</view>
			<view @click="toMini" class="activity-list box"><image :src="activityPic" mode=""></image></view>
		</view>

		<view class="activity-wrap">
			<view class="module-title">积分活动</view>
			<view class="activity box">
				<view class="activity-item" v-for="(item,index) in activityList" :key="index" >
					<view class="text">
						<view>{{ item.title }}</view>
						<text>{{ item.msg }}</text>
					</view>
					<view :class="['state',{ 'has': item.status == true, 'not': item.status == false }]" @click="toFinish(item)" >{{ item.status ? '已完成' : '去完成' }}</view>
				</view>
			</view>
		</view>

		<view class="exchange-wrap" @click="toPoint">
			<view class="module-title">积分兑换专区</view>
			<view class="card-list box">
				<view class="card-item" v-for="item in cardList" :key="item.id">
					<view class="card-box">
						<image :src="item.cover" mode=""></image>
						<view class="point" :class="item.title=='提示卡'?'a':'b'">{{item.explain_point}}积分</view>
					</view>
					<text>{{item.explain_msg}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo:{
				point:0
			},
			activityPic:`${this.$PNG}/activity-bga.png`,
			activityList: [],
			cardList:[],
			token:uni.getStorageSync('token')
		};
	},
	onShareAppMessage() {
		return {
			title: this.$store.state.shareTitle,
			path: this.$store.state.sharePath,
			imageUrl: this.$store.state.shareImage,
		}
	},
	onLoad() {
		// #ifdef H5
		let script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://res.wx.qq.com/open/js/jweixin-1.3.2.js';
		document.body.appendChild(script);
		// #endif
	},
	onShow() {
		uni.getStorageSync('token') && this.getUserInfo();
		this.requestActivity();
		this.requestExchange();
	},
	async onPullDownRefresh(){
		try {
			uni.getStorageSync('token') && this.getUserInfo();
			await this.requestActivity();
			await this.requestExchange();
			uni.stopPullDownRefresh();
		} catch (err) {
			console.log('下拉刷新错误：'+err);
		}		
	},
	methods: {
		/**
		 * ****************************************************************************************************
		 * @description 跳转到其他小程序
		 * ****************************************************************************************************
		 */
		toMini() {
			// #ifdef H5
			uni.navigateTo({
				url: '/pages/webView/webView?src=https://m.modian.com/unihd/pages/detail/index?id=34'
			})
			// #endif
			// #ifdef MP-WEIXIN
			uni.navigateToMiniProgram({
				appId: 'wx1a3af9f1e4466abc',
				path: 'pages/detail/index?id=34',
				extraData:{
					'platform_program':'toijoi'
				},
				success(res) {
					console.log('打开成功')
				}
			})
			// #endif
		},
		// 请求积分活动数据
		requestActivity:function () {
			const that = this;
			return new Promise((resolve,reject)=>{
				that.$RQST({
					url: `${this.$API}/activity/lists`,
					data:{
						is_login:that.token?1:2
					},
				}).then((res) => {
					console.log(res);
					that.activityList = res;
					resolve(res);
				}).catch((err) => {
					console.log(err);
					reject(res);
				})
			})
		},
		// 请求积分兑换专区
		requestExchange:function () {
			const that = this;
			return new Promise((resolve,reject)=>{
				that.$RQST({
					url: `${this.$API}/activity/exchange`,
					loading: false,
				}).then((res) => {
					console.log(res);
					that.cardList = res;
					resolve(res);
				}).catch((err) => {
					console.log(err);
					reject(res);
				})
			})
		},
		// 点击积分兑换
		toPoint:function () {
			uni.navigateTo({url: '/pages/pointExchange/pointExchange'});
		},
		// 点击去完成
		toFinish:function (item) {
			if (uni.getStorageSync('token')){
				if (!item.status) {
					if (item.page.indexOf('index') >= 0) {
						uni.switchTab({url: item.page })
					}else{
						uni.navigateTo({url: item.page })
					}
				}
			}else{
				uni.showModal({
					title: '未登录',
					content: '登录后可进行下一步操作',
					success(suc) {
						uni.switchTab({
							url: '/pages/mine/mine'
						})
					}
				})
			}
		},
		// 获取用户信息
		getUserInfo:function () {
			this.$RQST({
				url: `${this.$API}/users/account`,
				loading: false,
			}).then((res) => {
				this.userInfo = res;
				uni.setStorageSync('userInfo',this.userInfo)
			})
		},
	},
};
</script>

<style lang="scss">
.activity-container{
	padding-bottom: 60rpx;
}
.content {
	background: #f7f7f7;
}
.total {
	display: flex;
	align-items: center;
	justify-content: left;
	box-sizing: border-box;
	width: 670rpx;
	background: rgba(0, 205, 164, 1);
	border-radius: $radius-30;
	color: #fff;
	margin: 40rpx auto 0;
	padding: 35rpx;
	position: relative;
	navigator {
		position: absolute;
		width: 160rpx;
		height: 50rpx;
		background: rgba(247, 247, 247, 1);
		border-radius: 24rpx;
		right: 30rpx;
		bottom: 40rpx;
		text-align: center;
		line-height: 50rpx;
		color: $cl-main;
		font-family: phM;
	}
}
.total > view > text {
	font-size: $fs-24;
	color: #ffffff;
}
.total > view > view {
	margin-top: 10rpx;
	font-size: 120rpx;
	line-height: 1;
	color: #ffffff;
}
.total > view > view.large{
	font-size: 80rpx;
}

.module-title {
	font-size: $fs-40;
	color: #262626;
	display: flex;
	font-family: phM;
	align-items: center;
	justify-content: space-between;
	padding-left: 20rpx;
	margin-top: 40rpx;
}

.module-title navigator {
	font-size: 24rpx;
}

/* limited-time */
.limited-time .banner {
	width: 100%;
	height: 200rpx;
	background-color: #666;
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20rpx;
}

.activity-container .box {
	padding: 0 40rpx;
	margin-top: 40rpx;
}
.activity-container .box image {
	width: 100%;
	height: 230rpx;
}

/* activity */

.activity.box {
	border-radius: $radius-30;
	background-color: #ffffff;
	padding: 60rpx 60rpx 20rpx;
	width: 670rpx;
	margin: 40rpx auto 0;
}
.activity-box {
	padding: 60rpx;
}
.activity-item {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 50rpx;
	padding-left: 60rpx;
	.state{
		width:130rpx;
		height:50rpx;
		line-height: 50rpx;
		border-radius:25rpx;
		font-size: 26rpx;
		text-align: center;
		flex-shrink: 0;
	}
	.has{
		background: #D9D9D9;
		color: #888888;
	}
	.not{
		background: #00CDA4;
		color: $cl-white;
	}
}
.activity-item .text {
	position: relative;
	margin-right: 20rpx;
}
.activity-item .text view{
	color: $cl-black;
	font-size: $fs-28;
	margin-bottom: 12rpx;
}
.activity-item .text text{
	color: #888888;
	font-size: 24rpx;
}
.activity-item .text:before {
	content: '';
	position: absolute;
	width: 20rpx;
	height: 20rpx;
	background: rgba(0, 205, 164, 1);
	border-radius: 50%;
	left: -60rpx;
	top: 50%;
	margin-top: -10rpx;
}
.card-list{
	width: 100%;
	.card-item{
		width:100%;
		margin-bottom: 40rpx;
		padding: 20rpx 25rpx;
		position: relative;
		border-radius: $radius-30;
		overflow: hidden;
		background: #FFFFFF;
		.card-box{
			position: relative;
			image{
				height: 200rpx;
				width: 100%;
				border-radius: $fs-30;
			}
			.point{
				font-size: $fs-22;
				position: absolute;
				right: 20rpx;
				bottom: 20rpx;
				height: 30rpx;
				line-height: 30rpx;
				text-align: center;
				border-radius: 15rpx;
				padding: 0 12rpx;
				background: $cl-white;
			}
			.a{
				color: #BB605F;
			}
			.b{
				color: #687998;
			}
		}
		text{
			color: #B3B3B3;
			font-size: $fs-22;
			width: 100%;
			text-align: center;
			margin-top: 20rpx;
			display: inline-block;
		}
	}
}

</style>
