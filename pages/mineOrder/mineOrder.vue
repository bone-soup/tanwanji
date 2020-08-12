<template>
	<!-- 我的订单 -->
	<view class="content box-container">
		<!-- 页面导航 -->
		<view class="navlist">
			<view :class="{'active':curNav==10}" @click="clickNav(10)">全部</view>
			<view :class="{'active':curNav==20}" @click="clickNav(20)">待发货</view>
			<view :class="{'active':curNav==30}" @click="clickNav(30)">待收货</view>
			<view :class="{'active':curNav==40}" @click="clickNav(40)">已完成</view>
		</view>
		<!-- 商品列表 -->
		<view class="boxlist" v-if="list.length>0">
			<view class="boxitem" v-for="item in list" :key="item.id">
				<view class="state">{{item.status==20?'待发货':(item.status==30?'待收货':'已完成')}}</view>
				<view class="item-top" v-for="el in item.product" :key="el.id">
					<image :src="el.picture" mode=""></image>
					<view class="item-msg">
						<text class="name">{{el.tags==2?'预售|'+el.name:el.name}}</text>
						<view><text class="red">￥{{el.amount|formatPrice}}</text><text>x{{el.number}}</text></view>
					</view>
				</view>
				<text class="text">共{{item.num}}件商品 合计：{{item.amount}}积分</text>
				<view class="item-bot">
					<view v-if="item.status!=30" class="item-btn" @click="operate(item)">{{item.status==20?'提醒发货':'删除订单'}}</view>
					<view class="item-btn" v-if="item.status==30" @click="toLogistics(item.id)">查看物流</view>
					<view class="item-btn" @click="toDetail(item.id)">查看订单</view>
					<view class="item-btn on" v-if="item.status==30" @click="confirmOrder(item.id)">确认收货</view>
				</view>
			</view>
			<view v-if="ifAll" class="all-data">已加载全部</view>
		</view>
		<view class="no-data" v-else>暂无订单数据</view>
		<!-- 提醒发货 -->
		<view class="detail-shadow" :class="{'on':showDetail}">
			<view class="detail-box">
				<image :src="tipPic" mode=""></image>
				<text>已收到您的反馈</text>
			</view>
			<image :src="closePic" mode="aspectFit" @click="showDetail = false"></image>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tipPic:`${this.$PNG}/tipOrder.png`,
				closePic:`${this.$PNG}/close.png`,
				curNav: 10 ,											// 当前页面类型
				showDetail:false,									// 提醒发货
				detail:{},												// 商品详情
				list:[],													// 订单列表
				pageIndex:1,											// 当前页
				ifAll:false,											// 已加载全部
			}
		},
		onLoad(option) {
			console.log(option);
			this.curNav = option.nav || 10;
		},
		onShow() {
			this.requestList();
		},
		filters:{
			// 处理金额
			formatPrice:function (value) {
				return (value/100).toFixed(2);
			},
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.requestList();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		// 触底触发
		onReachBottom() {
			this.requestList();
		},
		methods: {
			// 点击导航
			clickNav: function (e) {
				if (e != this.curNav){
					this.list = [];
				}
				this.curNav = e;
				this.ifAll = false;
				this.pageIndex = 1;
				this.requestList()
			},
			// 点击操作按钮
			operate:function (e) {
				const that = this;
				console.log(e);
				if (e.status==20) {
					that.$RQST({
						url: `${this.$API}/users/orders/remind`,
						data:{
							id:e.id
						}
					}).then((res) => {
						console.log(res);
						that.showDetail = true;
					}).catch((err) => {
						console.log(err);
					})
				}else{
					uni.showModal({
						title:'删除订单',
						content: '确认删除此订单吗？',
						confirmColor:'#00CDA4',
						success: function (res) {
							if (res.confirm) {
								that.$RQST({
									url: `${that.$API}/users/orders/removes`,
									data:{
										id:e
									}
								}).then((res) => {
									uni.showToast({
										title:'删除订单成功',
										icon:'none',
										success() {
											uni.navigateTo({
												url:'/pages/mineOrder/mineOrder'
											})
										}
									})
								}).catch((err) => {
									console.log(err);
								})
							} else if (res.cancel) {
									console.log('用户点击取消');
							}
						}
					});
				}
			},
		
			// 获取订单列表
			requestList:function () {
				const that = this;
				that.$RQST({
					url: `${this.$API}/users/orders/lists`,
					data:{
						status:that.curNav,
						size:10,
						page:that.pageIndex
					}
				}).then((res) => {
					console.log(res);
					that.list = that.list.concat(res);
					if ( that.pageIndex > 1 && res.length == 0 ) {
						that.ifAll = true
					}
					that.pageIndex ++;
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击查看物流
			toLogistics:function (e) {
				uni.navigateTo({url: `/pages/mineOrderLogistics/mineOrderLogistics?order=${e}`});
			},
			// 点击查看订单
			toDetail:function (e) {
				uni.navigateTo({url: `/pages/mineOrderView/mineOrderView?order=${e}`});
			},
			// 点击确认收货
			confirmOrder:function (e) {
				const that = this;
				
				uni.showModal({
					title: '提示',
					content: '是否确认收货',
					success: function (res) {
						if (res.confirm) {
							that.$RQST({
								url: `${that.$API}/users/orders/complete`,
								data:{
									id:e
								}
							}).then((res) => {
								uni.showToast({
									title:'订单确认收货成功！',
									icon:'none',
								})
								setTimeout(()=>{
									that.requestList();
								},1500);
							}).catch((err) => {
								console.log(err);
							})
						} else if (res.cancel) {
							console.log('取消确认收货')
						}
					}
				})
			}
		},
	}
</script>

<style lang="scss">
	.uni-modal__bd{
		font-size: 50rpx !important;
	}
	.navlist {
		width: 100%;
		background: #ffffff;
		height: 108rpx;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 10;
		view{
			color: $cl-black;
			font-size: $fs-30;
			position: relative;
			font-family: 'phM';
			transition: all .3s ease-out;
			width: 25%;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
		}
		view:after{
			content: '';
			position: absolute;
			bottom: 0rpx;
			margin-left:-40rpx;
			left: 50%;
			width:0rpx;
			height:8rpx;
			background:$cl-main;
			transition: all .3s ease-out;
		}
		.active{
			font-size: 38rpx;
		}
		.active:after{
			width:80rpx;
		}
	}
	// 商品列表
	.boxlist{
		width: 100%;
		padding: 20rpx;
		min-height: calc(100% - 320rpx);
		.boxitem{
			width: 100%;
			background: $cl-white;
			border-radius: $radius-30;
			margin-bottom: 20rpx;
			padding: 40rpx;
			display: flex;
			flex-direction: column;
			position: relative;
			.state{
				position: absolute;
				top: 20rpx;
				right: 20rpx;
				width:168rpx;
				height:60rpx;
				background:$cl-main;
				line-height: 60rpx;
				text-align: center;
				color: $cl-white;
				font-size: $fs-26;
				font-family: phM;
				border-radius:$radius-30;
			}
			.text{
				text-align: right;
				display: inline-block;
				width: 100%;
				color: #B3B3B3;
				font-size: $fs-26;
			}
			.item-top{
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 40rpx;
				image{
					width: 168rpx;
					height: 168rpx;
					border-radius: 15rpx;
					margin-right: 40rpx;
					flex-shrink: 0;
				}
				.item-msg{
					width: 66%;
					position: relative;
					font-family: pHm;
					padding-top: 15rpx;
					.name{
						width:	60%;
						display: inline-block;
						color: #252525;
						font-size: $fs-28;
						margin-bottom: 30rpx;
					}
					>view{
						width: 100%;
						display: flex;
						align-items: center;
						justify-content: space-between;
						.red{
							color: #E24E4E;
							font-size: $fs-34;
						}
						text{
							font-size: $fs-24;
							color: #888888;
						}
					}
				}
			}
			.item-bot{
				display: flex;
				align-items: center;
				justify-content: flex-end;
				margin-top: 40rpx;
				width: 100%;
				.item-btn{
					width:158rpx;
					height:60rpx;
					margin-left: 20rpx;
					border:1rpx solid rgba(179,179,179,1);
					border-radius: $radius-30;
					color: #525252;
					font-size: $fs-26;
					font-family: phM;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.on{
					border: 1rpx solid $cl-main;
					color: $cl-main;
				}
			}
		}
	}
	.detail-shadow.on{
		opacity: 1;
		pointer-events: auto;
		.detail-box{
			transform: scale(1);
		}
	}
	.detail-shadow{
		position: fixed;
		opacity: 0;
		pointer-events: none;
		transition: all .3s  ease-in-out;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,.5);
		left: 0;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		.detail-box{
			width:430rpx;
			border-radius: $radius-30;
			padding-bottom: 50rpx;
			background: $cl-white;
			transform: scale(.85);
			transition: all .3s  ease-in-out;
			image{
				width:430rpx;
				height: 400rpx;
				border-radius: 50rpx;
				margin-bottom: 35rpx;
			}
			text{
				width: 100%;
				display: inline-block;
				text-align: center;
				color: #888888;
				font-size: $fs-26;
			}
		}
		image{
			width: 60rpx;
			height: 60rpx;
			margin-top: 30rpx;
		}
	}
</style>
