<template>
	<!-- 确认订单 -->
	<view class="content card-confirm">
		<!-- 收货地址 -->
		<view class="address box" @click="toAddress">
			<view v-if="defaultAddress!=''">
				<view>{{defaultName}}<text>{{defaultPhone}}</text></view>
				<text>{{defaultAddress}}</text>
			</view>
			<view v-else>请填写收货地址</view>
			<text class="arr"></text>
		</view>
		<!-- 商品详情 -->
		<view class="order-list">
			<view class="order-item box" v-for="item in order" :key="item.id">
				<image :src="item.picture" mode=""></image>
				<view>
					<view>{{item.tags==2?'预售|'+item.name:item.name}}</view>
					<text>下单时间：{{item.created_at}}</text>
					<text v-if="item.tags==2">发货时间：{{item.advance_date}}后</text>
				</view>
			</view>
		</view>
		<!-- 邮费 -->
		<view class="poster box">
			<view>邮费</view>
			<view>￥{{posterPoint}}</view>
		</view>
		<!-- 抵扣 -->
		<view class="depoint box">
			<view class="select" @click="selectExchange" :class="{'active':selectPoint}"></view>
			<text>当前积分可抵扣{{dePrice}}元</text>
		</view>
		<view class="bot-btn">
			<view>
				<view>实际支付: <text>￥{{actPrice}}</text></view>
				<text>积分已抵扣{{hasDePrice}}元</text>
			</view>
			<text @click="wxPay">微信支付</text>
		</view>
	</view>
</template>

<script>
	import recycle from '@/components/recycle/recycle.vue';
	let that;
	export default {
		data() {
			return {
				myPoint:'',										// 剩余积分
				posterPoint:'',								// 邮费积分
				dePrice:0,										// 抵扣费用
				defaultName:'',								// 默认收货人
				defaultPhone:'',							// 默认收货电话
				defaultAddress:'',						// 默认收货地址
				defaultAddressId:'',					// 默认收货地址id
				poster:'',										// 邮费
				selectPoint:false,							// 是否勾选抵扣积分
				orderNum:'',						// 订单编号
				order:[],											// 订单列表
				hasDePrice:0,									// 已抵扣积分
				closeOrder:'',								// 取消订单id
				actPrice:0,									// 实际支付
			}
		},
		onLoad() {
			that = this;
		},
		onShow() {
			this.requestDefault();
			this.requestPostRule().then(()=>{
				this.requestPoint();
			}).catch((err)=>{
				console.log(err);
			});
			uni.getStorage({
				key: 'payList',
				success: function (res) {
					that.order = res.data;
				}
			})
		},
		methods: {
			// 点击微信支付
			wxPay:function () {
				if (!this.defaultAddressId) {
					uni.showToast({title:'请选择收货地址',icon:'none'});
					return false;
				}
				let arr = []; 
				this.order.forEach((item)=>{
					arr.push(item.id);
				})
				arr = arr.join(',');
				uni.showToast({
					title:'starts',
					icon:'none'
				})
				this.$RQST({
					url: `${this.$API}/users/cabinet/orders`,
					data:{
						ids:arr,
						address_id:this.defaultAddressId,
						deduction:this.selectPoint
					}
				}).then((res) => {
					console.log(res);
					uni.showToast({
						title:'orders',
						icon:'none'
					})
					that.closeOrder = res.payment_id;
					if (res.complete) {
						uni.redirectTo({
							url:'/pages/recycleSuccess/recycleSuccess?type=4'
						})
					} else {
						this.pay(res.payment,res.payment_id).then((res)=>{
							this.$RQST({
								url: `${this.$API}/users/cabinet/orders/confirm`,
								data:{
									payment_id:that.closeOrder
								}
							}).then((res) => {
								console.log(res);
								uni.showToast({
									title:'fin',
									icon:'none'
								})
								uni.redirectTo({
									url:'/pages/recycleSuccess/recycleSuccess?type=4'
								})
							}).catch((err) => {
								uni.showToast({
									title:err.errMsg,
									icon:'none'
								})
								console.log(err);
							})
						}).catch((err)=>{
							console.log(err);
							uni.showToast({
								title:err.errMsg,
								icon:'none'
							})
							// 取消订单
							that.cancelOrder();
						});
					}
				}).catch((err) => {
					console.log(err);
					uni.showToast({
						title:err.errMsg,
						icon:'none'
					})
				})
			},
			// 跳转我的收货地址
			toAddress:function () {
				uni.navigateTo({url: `/pages/mineAddress/mineAddress`})
			},
			// 下拉刷新
			async onPullDownRefresh(){
				try {
					await this.requestDefault();
					await this.requestPostRule().then(()=>{
						this.requestPoint();
					}).catch((err)=>{
						console.log(err);
					});
					uni.getStorage({
						key: 'payList',
						success: function (res) {
							that.order = res.data;
						}
					})
					uni.stopPullDownRefresh();
				} catch (err) {
					console.log('下拉刷新错误：'+err);
				}		
			},
			// 取消订单接口
			cancelOrder:function () {
				const that = this;
				this.$RQST({
					url: `${this.$API}/users/cabinet/orders`,
					data:{
						payment_id:that.closeOrder
					}
				}).then((res) => {
					console.log(res);
					uni.showToast({
						title:'error',
						icon:'none'
					})
				}).catch((err) => {
					console.log(err);
					uni.showToast({
						title:err.errMsg,
						icon:'none'
					})
				})
			},
			// 勾选积分抵扣
			selectExchange:function () {
				this.selectPoint = !this.selectPoint;
				this.hasDePrice = this.selectPoint ? (this.poster=='免邮费'? 0:this.dePrice) : 0;
				this.actPrice = this.poster == '免邮费' ? 0:(this.selectPoint ? (this.poster - this.hasDePrice).toFixed(2) : (this.poster).toFixed(2));
			},
			// 支付函数
			pay:function (payMsg,payId) {
				const that = this;
				return new Promise((resolve,reject)=>{
					// #ifdef MP-WEIXIN
					uni.requestPayment({
						provider:'wxpay',
						timeStamp:payMsg.timestamp,
						nonceStr:payMsg.nonceStr,
						package:payMsg.package,
						signType:payMsg.signType,
						paySign:payMsg.paySign,
						success(res) {
							if(res.errMsg=='requestPayment:ok'){
								resolve(res)
							}else{
								uni.showToast({
									title:'支付失败',
									icon:'icon'
								})
							}
						},
						fail(err){
							uni.showToast({
								title:'订单支付失败',
								icon:'none'
							})
							reject(err);
						}
					})
					// #endif
					// #ifdef H5
					WeixinJSBridge.invoke(
						'getBrandWCPayRequest', {
							"appId": payMsg.appId, //公众号名称，由商户传入     
							"timeStamp": payMsg.timestamp, //时间戳，自1970年以来的秒数     
							"nonceStr": payMsg.nonceStr, //随机串     
							"package": payMsg.package,
							"signType": payMsg.signType, //微信签名方式：     
							"paySign": payMsg.paySign //微信签名 
						}, (res) => {
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								resolve(res)
							}else if (res.err_msg == "get_brand_wcpay_request:cancel") {
								that.cancelOrder();
							}else if (res.err_msg == "get_brand_wcpay_request:fail") {
								uni.showToast({
									title: '订单支失败',
									icon: 'none'
								})
							}
						})
						// #endif
				})
			},
			// 请求默认收货地址
			requestDefault:function () {
				return new Promise ((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/users/address/getDefault`,
					}).then((res) => {
						this.defaultName = res.name;
						this.defaultPhone = res.telephone;
						this.defaultAddress = `${res.region[0]}${res.region[1]}${res.region[2]}${res.address}`;
						this.defaultAddressId = res.id;
						resolve(res);
					}).catch((err) => {
						console.log(err);
						reject(err);
					})
				})
			},
			// 请求包邮规则
			requestPostRule:function () {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/moduledetail`,
						data:{
							tables:'packageSettings'
						}
					}).then((res) => {
						if (this.order.length >= res.values.num) {
							this.poster = '免邮费';
							this.posterPoint = '0';
						}else{
							this.poster = parseInt(res.values.postage);
							this.posterPoint = parseInt(res.values.postage).toFixed(2);
						}
						resolve(res);
					}).catch((err) => {
						console.log(err);
						reject(err);
					})
				})
			},
			// 请求当前积分
			requestPoint:function () {
				this.$RQST({
					url: `${this.$API}/users/account`
				}).then((res) => {
					this.myPoint = res.point;
					if (this.poster=='免邮费') {
						this.dePrice = 0;
					}else{
						this.dePrice = parseInt(this.myPoint) - parseInt(this.poster)*100 >= 0 ? (this.poster).toFixed(2) : ((this.myPoint)/100).toFixed(2);
					}
					this.hasDePrice = this.selectPoint ? this.dePrice : 0;
					this.actPrice = this.poster == '免邮费' ? 0:(this.selectPoint ? this.poster - this. hasDePrice : (this.poster).toFixed(2));
				}).catch((err) => {
					console.log(err);
				})
			}
		},
	}
</script>

<style lang="scss">
	.card-confirm{
		padding: 20rpx 20rpx 150rpx;
		.box{
			width: 100%;
			border-radius: $fs-30;
			background: $cl-white;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 40rpx;
			margin-bottom: 20rpx;
		}
		.address{
			min-height: 120rpx;
			view{
				color: #252525;
				font-size: $fs-28;
				view{
					font-size: $fs-34;
					color: #525252;
					margin-bottom: 15rpx;
					text{
						color: #B3B3B3;
						font-size: $fs-24;
						margin-left: 20rpx;
					}
				}
				text{
					color: #888888;
					font-size: $fs-26;
				}
			}
			.arr{
				width: 20rpx;
				height: 20rpx;
				border-top: 4rpx solid #B3B3B3;
				border-right: 4rpx solid #B3B3B3;
				transform: rotate(45deg);
			}
		}
		.poster{
			height: 120rpx;
			view{
				color: #252525;
				font-size: $fs-28;
			}
		}
		.depoint{
			height: 120rpx;
			justify-content: left;
			padding-left: 70rpx;
			font-size: $fs-28;
			color: #B3B3B3;
			.select{
				width:38rpx;
				height:38rpx;
				border:2rpx solid $cl-main;
				border-radius:50%;
				margin-right: 40rpx;
			}
			.select.active{
				background: $cl-main;
			}
		}
		.order-list{
			width: 100%;
			.order-item{
				display: flex;
				align-items: center;
				padding: 44rpx;
				justify-content: left;
				image{
					width: 168rpx;
					height: 168rpx;
					margin-right: 38rpx;
					border-radius: 15rpx;
				}
				view{
					view{
						color: #252525;
						font-size: $fs-36;
						margin-bottom: 40rpx;
					}
					text{
						color: #B3B3B3;
						font-size: $fs-28;
						display: block;
						line-height: 1.5;
					}
				}
			}
		}

		.bot-btn{
			position: fixed;
			width: 100%;
			height: 120rpx;
			left: 0;
			bottom: 0;
			display: flex;
			align-items: center;
			justify-content: space-between;
			>view{
				background: $cl-white;
				padding-right: 60rpx;
				height: 100%;
				width: 100%;
				display: flex;
				align-items: center;
				flex-direction: column;
				justify-content: center;
				>view{
					color: #353535;
					font-size: $fs-24;
					width: 100%;
					text-align: right;
					margin-bottom: 22rpx;
					text{
						color: #E24E4E;
						font-size: $fs-28;
						margin-left: 10rpx;
						display: inline-block;
					}
				}
				>text{
					width: 100%;
					text-align: right;
					color: #B3B3B3;
					font-size: $fs-24;
				}
			}
			>text{
				width: 262rpx;
				background: $cl-main;
				color: $cl-white;
				text-align: center;
				line-height: 120rpx;
				font-size: $fs-34;
				flex-shrink: 0;
			}
		}
	}
</style>
