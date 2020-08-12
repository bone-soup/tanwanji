<template>
	<!-- 订单详情 -->
	<view class="content order">
		<view class="order-state">
			<view>
				<view>{{order.status==20?'待发货':(order.status==30?'待收货':'已完成')}}</view>
				<text>{{order.status==20?'正在进行物流调配请耐心等待':(order.status==30?'请留意物流信息变化':'订单已完成，祝您生活愉快！')}}</text>
			</view>
			<image :src="order.status==20?ordera:(order.status==30?orderb:orderc)" mode=""></image>
		</view>
		
		<view class="order-time box" v-if="order.status!=20">
			<view>
				<view>{{express.result.list[0].status}}</view>
				<text>{{express.result.updateTime}}</text>
			</view>
		</view>
		
		<view class="order-address box">
			<view>{{order.name}} {{order.telephone}}</view>
			<text>{{order.province}}{{order.city}}{{order.district}}{{order.address}}</text>
		</view>
		
		<view class="order-view box">
			<view>订单编号：{{order.lading_no}}</view>
			<view>下单时间：{{$util.timeChange(order.created_at)}}</view>
			<view v-if="order.status>20">承运物流：{{express.result.expName||'暂无物流信息'}}</view>
			<view>运费价格：{{order.is_postage==2?'￥'+((order.postage/100).toFixed(2)):'免运费'}}{{order.postage_point>0?` (积分已抵扣￥${(parseInt(order.postage_point)/100).toFixed(2)})`:``}}</view>
			<view class="btnbox">
				<view class="contact" v-if="order.status==40" @click="deleteOrder(order.id)">删除订单</view>
				<!-- #ifdef MP-WEIXIN -->
				<button class="contact" type="default" open-type="contact" bindcontact="handleContact">联系客服</button>
				<!-- #endif -->
			</view>
		</view>
		
		<view class="order-detail box" v-for="item in productList" :key="item.id">
			<view class="order-msg">
				<image :src="item.picture" mode=""></image>
				<view class="item-msg">
					<text class="name">{{item.tags==2?'预售|'+item.name:item.name}}</text>
					<view><text class="red">￥{{item.amount|formatMount}}</text><text>x{{item.number}}</text></view>
				</view>
			</view>
			<view class="order-con">
				<view v-if="item.type==3">大盒编号：{{item.product_no}}</view>
				<view v-if="item.type==3">小盒编号：{{item.index_no}}</view>
				<view v-if="item.type==2">端盒编号：{{item.product_no}}</view>
				<view v-if="item.type==1||item.type==4">商品编号：{{item.product_no}}</view>
				<view>支付时间：{{item.created_at}}</view>
				<view v-if="item.tags=='2'">发货时间：{{item.advance_date}}后</view>
			</view>
			<view class="order-price">
				<view class="actPrice">
					<view class="price">实际支付：<text>￥{{item.real_amount|formatMount}}</text></view>
					<text>总价：￥{{item.amount|formatMount}}，&nbsp;积分抵扣 ￥{{item.point|formatMount}}</text>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				ordera:`${this.$PNG}/ordera.png`,
				orderb:`${this.$PNG}/orderb.png`,
				orderc:`${this.$PNG}/orderc.png`,
				order:{},
				productList:[],
				express:{},
				id:'',						// 订单编号
			}
		},
		onLoad(option) {
			this.id = option;
			this.requestDetail(option);
		},
		filters: {
		  formatMount: function (value) {
		    return (value/100).toFixed(2);
		  }
		},
		onPullDownRefresh() {
			this.requestDetail(this.id);;
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		methods: {
			// 请求订单详情
			requestDetail:function (id) {
				const that = this;
				that.$RQST({
					url: `${that.$API}/users/orders/details`,
					data:{
						id:id
					}
				}).then((res) => {
					console.log(res);
					this.order = res.orders;
					this.productList = res.product;
					if (res.express.result) {
						this.express = res.express
					}else{
						this.express = {result:{updateTime:'暂无最新消息',list:[{status:'暂无物流信息'}]}};
					}
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击删除订单
			deleteOrder:function (e) {
				console.log(e);
				const that = this;
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
											uni.reLaunch({
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
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef MP-WEIXIN */
	page{height: 100%;}
	/* #endif */
	uni-page-body{
		height: 100%;
	}
.order{
	background: $cl-main;
	width: 100%;
	height: 100%;
	padding: 80rpx 20rpx;
	overflow-y: auto;
	.order-state{
		width: 100%;
		padding: 0 40rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 50rpx;
		view{
			font-family: phM;
			color: $cl-white;
			view{
				font-size: 48rpx;
				margin-bottom: 20rpx;
			}
			text{
				font-size: 30rpx;
			}
		}
		image{
			width: 156rpx;
			height: 154rpx;
		}
	}
	.order-view{
		view{
			color: #252525;
			font-size: $fs-28;
			margin-bottom: 20rpx;
			font-family: phR;
		}
		.btnbox{
			display: flex;
			align-items: center;
			justify-content: flex-end;
			margin-bottom: 0;
			.contact{
				width:168rpx;
				height:60rpx;
				border:1rpx solid rgba(179,179,179,1);
				border-radius:$radius-30;
				color: #B3B3B3;
				font-size: $fs-26;
				margin: 0;
				margin-left: 20rpx;
				background: transparent;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
	.box{
		width: 100%;
		background: $cl-white;
		border-radius: $radius-30;
		font-family: phM;
		padding: 40rpx;
		margin-bottom: 20rpx;
		.arr{
			width: 20rpx;
			height: 20rpx;
			border-top: 4rpx solid #B3B3B3;
			border-right: 4rpx solid #B3B3B3;
			transform: rotate(45deg);
		}
	}
	.order-time{
		display: flex;
		align-items: center;
		justify-content: space-between;
		>view{
			font-size: $fs-28;
			view{
				color: #252525;
				margin-bottom: 23rpx;
				line-height: 1.6;
			}
			text{
				color: #B3B3B3;
			}
		}
	}
	.order-address{
		view{
			font-size: $fs-28;
			color: #252525;
			margin-bottom: 23rpx;
		}
		text{
			color: #B3B3B3;
		}
	}
	.order-detail{
		padding: 40rpx 0 0;
		overflow: hidden;
		.order-msg{
			display: flex;
			padding: 0 40rpx;
			align-items: center;
			justify-content: space-between;
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
				.name{
					width:	75%;
					display: inline-block;
					color: #252525;
					font-size: $fs-34;
					margin-bottom: 45rpx;
				}
				>view{
					width: 100%;
					display: flex;
					align-items: center;
					font-size: $fs-34;
					justify-content: space-between;
					.red{
						color: #E24E4E;
					}
					text{
						color: #252525;
					}
				}
			}
		}
	}
	.order-con{
		padding: 30rpx 40rpx;
		view{
			color: #B3B3B3;
			font-size: $fs-28;
			line-height: 2;
			font-family: phR;
		}
	}
	.order-price{
		background: #F9F9F9;
		width: 100%;
		padding: 40rpx;
		.actPrice{
			display: flex;
			align-items: flex-end;
			flex-direction: column;
			justify-content: right;
			.price{
				color: #353535;
				font-size: $fs-28;
				font-family: phR;
				margin-bottom: 15rpx;
				text{
					color: #E24E4E;
					font-size: $fs-36;
					font-family: phR;
				}
			}
			>text{
				color: #888888;
				font-size: $fs-22;
				font-family: phR;
			}
		}
	}
}
</style>
