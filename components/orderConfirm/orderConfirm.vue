<template>

	<!-- confirm start -->
	<view :class="['confirm-wrap',{'active':show}]">

		<view class="popups" @click="close"></view>

		<view :class="['confirm-content',{'active':show}]">

			<!-- confirm-title start -->
			<view class="confirm-titles">
				<view class="title">订单确认</view>
				<view class="sub-title">抽盒满{{packageSettings.num}}个包邮(0元商品除外)，不足{{packageSettings.num}}个将收取一定运费（港澳台及海外地区无法配送）！</view>
			</view>
			<!-- title end -->

			<!-- confirm-detail start -->
			<view class="confirm-details">
				<view class="title">{{name}}</view>
				<view class="detail">
					<view class="text"><text>￥{{productData.price.toFixed(2)}}</text></view>
					<view class="text">X1</view>
					<view class="text total">合计: <text>{{productData.price*100}}积分</text></view>
				</view>
			</view>
			<!-- confirm-detail end -->

			<!-- confirm-btns start -->
			<view class="confirm-btns">
				<button :class="['btn',{'checked':deduct}]" @click="deduct =!deduct">
					<view>当前积分可抵扣{{productData.integral>productData.price*100?productData.price*100:productData.integral}}积分</view>
					<view class="radio">
						<image :src="checkedImg" mode="aspectFill" v-if="deduct"></image>
					</view>
				</button>

			</view>
			<!-- confirm-btns end -->

			<!-- pay-wrap start -->
			<view class="pay-wrap">
				<view class="text">
					<view class="total">实际支付<text>￥{{actualPayment}}</text></view>
					<view class="deducted">积分已抵扣{{deductPrice}}元</view>
				</view>
				<button class="btn" @click="pay">微信支付</button>
			</view>
			<!-- pay-wrap end -->

		</view>

	</view>
	<!-- specifiaction end -->

</template>

<script>
	// #ifdef H5
	import jwx from '../../assets/jweixin.js'
	// #endif
	export default {
		data() {
			return {
				//显示隐藏
				show: false,

				//是否抵扣
				deduct: false,

				//选中图片
				checkedImg: this.$PNG + '/checked.png',

				// 商品信息
				productData: {
					name: '商品名称',
					price: 0,
					integral: 0,

				},
				// 总称
				name: '',

				// 包邮设置
				packageSettings: {
					num: 0,
					postage: 0
				}
			}

		},
		computed: {
			actualPayment() {
				let res;
				if (this.deduct) {
					res = this.productData.integral > this.productData.price * 100 ? 0 : this.productData.price -
						this.productData.integral / 100;
				} else {
					res = this.productData.price;
				}
				return res.toFixed(2);
			},
			deductPrice() {
				let res;
				if (this.deduct) {
					res = this.productData.integral > this.productData.price * 100 ? this.productData.price :
						this.productData.integral / 100;
				} else {
					res = 0;
				}
				return res.toFixed(2);
			}
		},
		methods: {

			/**
			 * ****************************************************************************************************
			 * @description 打开
			 * ****************************************************************************************************
			 */
			async open(productData, packageSettings, name) {
				this.productData = Object.assign({}, this.productData, productData);
				this.packageSettings = packageSettings;
				this.name = name;
				await this.getUserInfo();
				this.show = true;
			},

			/**
			 * ****************************************************************************************************
			 * @description 关闭
			 * ****************************************************************************************************
			 */
			close() {
				this.show = false;
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取用户信息
			 * ****************************************************************************************************
			 */
			getUserInfo() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/users/account`
					}).then((res) => {
						this.productData.integral = res.point;
						resolve(res)
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 微信支付
			 * ****************************************************************************************************
			 */
			pay() {
				if (this.productData.whole_no) {
					this.buyEndBox().then(({
						complete,
						id,
						payment,
						payment_id
					}) => {
						this.close();
						if (complete) {
							uni.redirectTo({
								url: `/pages/lotterySuccess1/lotterySuccess1?id=${id}`
							})
						} else {
							this.uniPay(payment,payment_id).then(res => {
								this.confirmOrder(payment_id).then(() => {
									uni.redirectTo({
										url: `/pages/lotterySuccess1/lotterySuccess1?id=${id}`
									})
								})
							})
						}
					});
				} else {
					this.buySingleBox().then(({
						complete,
						id,
						payment,
						payment_id
					}) => {
						this.close();
						if (complete) {
							uni.redirectTo({
								url: `/pages/lotterySuccess2/lotterySuccess2?id=${id}`
							})
						} else {
							this.uniPay(payment,payment_id).then(res => {
								this.confirmOrder(payment_id).then(() => {
									uni.redirectTo({
										url: `/pages/lotterySuccess2/lotterySuccess2?id=${id}`
									})
								})
							})
						}
					});
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 端盒购买
			 * ****************************************************************************************************
			 */
			buyEndBox() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/shop/pay/whole`,
						data: {
							id: this.productData.series_id,
							deduction: this.deduct ? 1 : 2
						}
					}).then((res) => {
						resolve(res)
					}).catch(err => {
						uni.showModal({
							title: '系统提示',
							content: err.msg
						})
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 单盒购买
			 * ****************************************************************************************************
			 */
			buySingleBox() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/shop/pay/machine`,
						data: {
							id: this.productData.id,
							deduction: this.deduct ? 1 : 2
						}
					}).then((res) => {
						resolve(res)
					}).catch(err => {
						uni.showModal({
							title: '系统提示',
							content: err.msg
						})
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 取消订单
			 * ****************************************************************************************************
			 */
			cancelOrder(paymentId) {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/shop/pay/cancel`,
						data: {
							payment_id: paymentId
						}
					}).then((res) => {
						uni.showToast({
							title: '您已取消订单',
							icon: 'none'
						})
						resolve(res)
					}).catch(err => {
						uni.showModal({
							title: '系统提示',
							content: err.msg
						})
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 调起支付
			 * ****************************************************************************************************
			 */
			uniPay(payment,paymentId) {
				return new Promise((resolve, reject) => {
							// #ifdef MP-WEIXIN
							uni.requestPayment({
								provider: 'wxpay',
								timeStamp: payment.timestamp,
								nonceStr: payment.nonceStr,
								package: payment.package,
								signType: payment.signType,
								paySign: payment.paySign,
								success(res) {
									if (res.errMsg == 'requestPayment:ok') {
										resolve(res)
									} else {
										reject(err)
									}
								},
								fail(err) {
									reject(err)
								}
							})
							// #endif
							// #ifdef H5
							WeixinJSBridge.invoke(
								'getBrandWCPayRequest', {
									"appId": payment.appId, //公众号名称，由商户传入     
									"timeStamp": payment.timestamp, //时间戳，自1970年以来的秒数     
									"nonceStr": payment.nonceStr, //随机串     
									"package": payment.package,
									"signType": payment.signType, //微信签名方式：     
									"paySign": payment.paySign //微信签名 
								}, (res) => {
									if (res.err_msg == "get_brand_wcpay_request:ok") {
										resolve(res)
									}else if (res.err_msg == "get_brand_wcpay_request:cancel") {
										this.cancelOrder(paymentId)
									}else if (res.err_msg == "get_brand_wcpay_request:fail") {
										uni.showToast({
											title: '订单支付失败',
											icon: 'none'
										})
									}
								})
								// #endif
							})
					},
					/**
					 * ****************************************************************************************************
					 * @description 确认订单
					 * ****************************************************************************************************
					 */
					confirmOrder(paymentId) {
						return new Promise((resolve, reject) => {
							this.$RQST({
								url: `${this.$API}/shop/pay/confirm`,
								data: {
									payment_id: paymentId
								}
							}).then((res) => {
								resolve(res)
							}).catch(err => {
								console.log(err)
							})
						})
					},
			}
		}
</script>

<style lang="scss">
	// confirm-wrap
	.confirm-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		line-height: 1;
		pointer-events: none;
		opacity: 0;
		background-color: rgba(0, 0, 0, .5);
		transition: opacity .3s ease;

		&.active {
			opacity: 1;
			pointer-events: all;
		}
	}

	// popups
	.popups {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;

	}

	// confirm-content
	.confirm-content {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		border-top-left-radius: 30rpx;
		border-top-right-radius: 30rpx;
		background-color: #fff;
		box-sizing: border-box;
		transform: translate(0, 100%);
		transition: all .3s ease;

		&.active {
			transform: translate(0, 0);
		}
	}

	// confirm-titles
	.confirm-titles {
		padding: 40rpx;
		border-bottom: 1rpx solid $cl-gray5;

		.title {
			font-size: $fs-36;
			font-family: phM;

		}

		.sub-title {
			font-size: $fs-24;
			color: $cl-red;
			margin-top: 20rpx;
			line-height: 1.5;
		}
	}

	// confirm-details
	.confirm-details {
		padding: 40rpx;
		display: flex;
		justify-content: space-between;
		border-bottom: 1rpx solid $cl-gray5;

		.title {
			font-size: $fs-36;
			font-family: phM;
			flex: 1;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		.detail {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			font-size: $fs-24;
			color: $cl-gray3;

			.text {
				display: flex;
				align-items: center;

				text {
					font-size: $fs-32;
					color: $cl-red;
				}

				&:first-child {
					margin-bottom: 20rpx;
				}

				&:nth-child(2) {
					margin-bottom: 46rpx;
				}

				&:nth-child(3) {
					text {
						font-size: $fs-28;
					}
				}
			}

		}
	}

	// confirm-btns
	.confirm-btns {
		padding: 40rpx;

		.btn {
			height: 100rpx;
			border-radius: 50rpx;
			background-color: $cl-gray5;
			color: $cl-black;
			font-size: $fs-28;
			justify-content: space-between;
			padding: 0 48rpx;
			border: 2rpx solid $cl-gray5;

			.radio {
				width: 42rpx;
				height: 42rpx;
				background-color: $cl-white;
				border: 2rpx solid $cl-gray3;
				border-radius: 50%;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					width: 28rpx;
					height: 28rpx;
				}
			}

			&.checked {
				background-color: #DAFFF0;
				border-color: $cl-main;
				font-family: phM;
				color: $cl-main;

				.radio {
					border-color: $cl-main2;
					background-color: $cl-main2;
				}
			}
		}
	}

	// pay-wrap
	.pay-wrap {
		display: flex;

		.btn {
			width: 260rpx;
			height: 120rpx;
			border-radius: 0;
		}

		.text {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			justify-content: center;
			font-size: $fs-24;
			line-height: 1.5;
			padding: 0 58rpx;
			border-top: 2rpx solid $cl-gray5;

			.total {
				text {
					color: $cl-red;
				}
			}

			.deducted {
				color: $cl-gray3;
			}
		}
	}
</style>
