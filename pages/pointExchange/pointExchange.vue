<template>
	<view class="content">
		<!-- 积分兑换 -->
		<view class="point-exchange">
			<view class="top">
				<view class="mine">我的积分：</view>
				<text>{{myPoint}}</text>
				<view @click="toPoint" class="btn">积分明细</view>
			</view>
			<view class="bot">
				<text>兑卡专区</text>
				<view class="card-list box">
					<view class="card-item" v-for="item in cardList" :key="item.id" @click="showBoxFun(item)">
						<view class="card-box">
							<image :src="item.cover" mode=""></image>
							<view class="point" :class="item.title=='提示卡'?'a':'b'">{{item.explain_point}}积分</view>
						</view>
						<text>{{item.explain_msg}}</text>
					</view>
				</view>
			</view>
		</view>
		<!-- 底部弹框 -->
		<exchange @close="closeBox" @buyCards="buyCards" :detail="cardDetail" :showChild="showbox" :myPoint="myPoint"></exchange>
	</view>
</template>

<script>
	import exchange from '@/components/exchange/exchange'
	export default {
		components:{
			exchange
		},
		data() {
			return {
				myPoint:uni.getStorageSync('userInfo').point||0,					// 我的积分
				showbox:false,				// 展示子组件
				cardDetail:{},				// 卡片详情
				cardList:[]
			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		onLoad() {
			this.requestExchange();
		},
		onShow() {
			this.getUserInfo();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.requestExchange();
			this.getUserInfo();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000);
		},
		methods: {
			// 点击积分明细
			toPoint:function () {
				uni.navigateTo({url: '/pages/minePoint/minePoint'});
			},
			// 点击卡片
			showBoxFun:function (item) {
				this.cardDetail = item;
				this.showbox = true;
			},
			// 关闭弹窗
			closeBox:function () {
				this.showbox = false;
			},
			// 点击立即兑换
			buyCards:function (count,item) {
				const that = this;
				console.log(count,item);
				uni.setStorage(
					{
						key: 'cardMsg',
						data: {
							count:count,
							item:item
						},
						success: function () {
							uni.navigateTo({url: '/pages/cardOrder/cardOrder'});
							that.showbox = false;
						}
					}
				)
			},
			// 请求积分兑换专区
			requestExchange:function () {
				const that = this;
				this.$RQST({
					url: `${this.$API}/activity/exchange`,
					data:{
						authorization:uni.getStorageSync('token').authorization,
						hash:uni.getStorageSync('token').hash
					}
				}).then((res) => {
					console.log(res);
					that.cardList = res;
				}).catch((err) => {
					console.log(err);
				})
			},
			// 获取用户信息
			getUserInfo() {
				this.$RQST({
					url: `${this.$API}/users/account`
				}).then((res) => {
					this.userInfo = res;
					uni.setStorageSync('userInfo',this.userInfo)
				})
			},
		},
	}
</script>

<style lang="scss">
	.point-exchange{
		width: 100%;
		.top{
			width: 100%;
			background: $cl-main;
			height: 600rpx;
			padding-top: 70rpx;
			position: relative;
			overflow: visible;
			border-radius: 0 0 25% 25%;
			.mine{
				text-align: center;
				color: $cl-white;
				font-size: $fs-38;
				font-family: phM;
			}
			text{
				font-size: $fs-120;
				color: $cl-white;
				text-align: center;
				display: inline-block;
				width: 100%;
				margin-top: 20rpx;
			}
			.btn{
				width:160rpx;
				height:50rpx;
				background:$cl-white;
				line-height: 50rpx;
				text-align: center;
				color: $cl-main;
				border-radius:25rpx;
				margin: 25rpx auto 0;
			}
		}
	}
	.bot{
		width: 670rpx;
		margin: -200rpx auto 0;
		background: #FFFFFF;
		border-radius: $radius-30;
		padding: 70rpx 0 50rpx;
		position: relative;
		z-index: 10;
		>text{
			color: $cl-main;
			text-align: center;
			display: inline-block;
			width: 100%;
			font-size: $fs-40;
			margin-bottom: 20rpx;
		}
	}
	.card-list{
		width: 100%;
		.card-item{
			width:100%;
			margin-bottom: 20rpx;
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
