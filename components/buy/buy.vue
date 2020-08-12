<template>

	<!-- buy start -->
	<view :class="['confirm-wrap',{'active':show}]">

		<view class="popups" @click="close"></view>

		<view :class="['confirm-content',{'active':show}]">

			<!-- pic-wrap start -->
			<view class="pic-wrap">
				<image :src="productData.detail_header" mode="aspectFill"></image>
				<view class="text">
					<text class="title">{{name}}</text>
					<text class="price">￥{{productData.price}}</text>
					<text class="stock">库存{{productData.total_stock}}件</text>
				</view>
			</view>
			<!-- pic-wrap end -->

			<!-- specifiaction start -->
			<view class="specifiaction" v-if="productData.type==1">
				<view class="title">选择规格</view>
				<view class="list">
					<view :class="['item',{'active':currentSpecification==item.id}]" v-for="(item,index) in specification" :key="index"
					 @click="changeSpecification(item)">{{item.value}}</view>
				</view>
			</view>
			<!-- specifiaction end -->

			<!-- nums start -->
			<view class="nums">
				<view class="title">购买数量</view>
				<view class="change">
					<button class="less" @click="less" @longtap="less2" @touchend="clearTimer"></button>
					<view class="text">{{nums}}</view>
					<button class="add" @click="add" @longtap='add2' @touchend="clearTimer"></button>
				</view>
			</view>
			<!-- nums end -->

			<!-- confirm-detail start -->
			<view class="confirm-details">
				<view class="remarks">抽盒满{{packageSettings.num}}个包邮(0元商品除外)，不足{{packageSettings.num}}个将收取一定运费（港澳台及海外地区无法配送）！</view>
				<view class="detail">
					<view class="total">合计: <text>{{productData.price*nums*100}}积分</text></view>
				</view>
			</view>
			<!-- confirm-detail end -->

			<!-- confirm-btns start -->
			<view class="confirm-btns">
				<button :class="['btn',{'checked':deduct==1}]" @click="changeDeduct">
					<view>当前积分可抵扣{{deductIntegral}}积分</view>
					<view class="radio">
						<image :src="checkedImg" mode="aspectFill" v-if="deduct==1"></image>
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
	<!-- buy end -->

</template>

<script>
	// #ifdef H5
	import jwx from '../../assets/jweixin.js'
	// #endif
	export default {
		data() {
			return {
				// 总称
				name: '',

				//显示隐藏
				show: false,

				//是否抵扣
				deduct: 2,

				//当前规格
				currentSpecification: 0,

				//商品数量
				nums: 1,

				//删减数量定时器
				lessTimer: null,

				//删减数量定时器
				addTimer: null,

				//选中图片
				checkedImg: this.$PNG + '/checked.png',

				// 商品信息
				productData: {
					title: '商品名称',
					price: 0,
					sales_num: 0,
					integral: 0
				},

				//单盒
				product: {
					title: '商品名称',
					price: 0,
					sales_num: 0,
					integral: 0
				},

				//端盒
				whole: {
					title: '商品名称',
					price: 0,
					sales_num: 0,
					integral: 0
				},


				//规格
				specification: [{
						value: '单盒',
						id: 0
					},
					{
						value: '端盒',
						id: 1
					}
				],

				// 包邮设置
				packageSettings: {
					num: 0,
					postage: 0
				}
			}

		},
		computed: {
			/**
			 * ****************************************************************************************************
			 * @description 实际支付价格
			 * ****************************************************************************************************
			 */
			actualPayment() {
				let res;
				if (this.deduct == 1) {
					res = this.productData.integral > this.productData.price * this.nums * 100 ? 0 : this.productData.price * this.nums -
						this.productData.integral / 100;
				} else {
					res = this.productData.price * this.nums;
				}
				return res.toFixed(2);
			},
			/**
			 * ****************************************************************************************************
			 * @description 抵扣价格
			 * ****************************************************************************************************
			 */
			deductPrice() {
				let res;
				if (this.deduct == 1) {
					res = this.productData.integral > this.productData.price * this.nums * 100 ? this.productData.price * this.nums :
						this.productData.integral / 100;
				} else {
					res = 0;
				}
				return res.toFixed(2);
			},
			/**
			 * ****************************************************************************************************
			 * @description 可抵扣积分
			 * ****************************************************************************************************
			 */
			deductIntegral() {
				let res;
				res = this.productData.integral > this.productData.price * this.nums * 100 ? this.productData.price * this.nums *
					100 :
					this.productData.integral;
				return res;
			}
		},
		methods: {

			/**
			 * ****************************************************************************************************
			 * @description 打开
			 * ****************************************************************************************************
			 */
			async open(productData, packageSettings, whole, name) {
				this.name = name;
				this.product = Object.assign({}, this.product, productData);
				this.whole = Object.assign({}, this.whole, whole);
				if (this.currentSpecification == 0) {
					this.productData = this.product;
				} else {
					this.productData = this.whole;
				}
				this.packageSettings = packageSettings;
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
			 * @description 改变规格
			 * ****************************************************************************************************
			 */
			changeSpecification(item) {
				this.currentSpecification = item.id;
				if (item.id == 0) {
					this.productData = this.product;
				} else {
					this.productData = this.whole;
				}
				this.nums = 1;
				this.getUserInfo();
			},

			/**
			 * ****************************************************************************************************
			 * @description 添加数量
			 * ****************************************************************************************************
			 */
			add() {
				this.nums < 99 && this.nums < this.productData.total_stock && this.nums++;
			},

			/**
			 * ****************************************************************************************************
			 * @description 长按添加数量
			 * ****************************************************************************************************
			 */
			add2() {
				this.addTimer = setInterval(() => {
					this.add()
				}, 100)
			},

			/**
			 * ****************************************************************************************************
			 * @description 删减数量
			 * ****************************************************************************************************
			 */
			less() {
				this.nums > 1 && this.nums--;
			},

			/**
			 * ****************************************************************************************************
			 * @description 长按删减数量
			 * ****************************************************************************************************
			 */
			less2() {
				this.lessTimer = setInterval(() => {
					this.less()
				}, 100);
			},

			/**
			 * ****************************************************************************************************
			 * @description 清楚定时器
			 * ****************************************************************************************************
			 */
			clearTimer() {
				clearInterval(this.addTimer);
				clearInterval(this.lessTimer);
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
			 * @description 端盒购买
			 * ****************************************************************************************************
			 */
			buyEndBox() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/shop/wholePay`,
						data: {
							id: this.productData.id,
							number: this.nums,
							type: this.productData.type,
							deduction: this.deduct
						}
					}).then((res) => {
						this.afterPay(res)
					}).catch((err) => {
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
						url: `${this.$API}/shop/pay`,
						data: {
							id: this.productData.id,
							type: this.productData.type,
							number: this.nums,
							deduction: this.deduct
						}
					}).then((res) => {
						this.afterPay(res)
					}).catch((err) => {
						uni.showModal({
							title: '系统提示',
							content: err.msg
						})
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 购买回调
			 * ****************************************************************************************************
			 */
			afterPay({
				complete,
				payment,
				payment_id
			}) {
				this.close();
				if (complete) {
					uni.navigateTo({
						url: '/pages/recycleSuccess/recycleSuccess?type=1&shop=1'
					})
				} else {
					// #ifdef MP-WEIXIN
					uni.requestPayment({
						provider: 'wxpay',
						timeStamp: payment.timestamp,
						nonceStr: payment.nonceStr,
						package: payment.package,
						signType: payment.signType,
						paySign: payment.paySign,
						success: res => {
							if (res.errMsg == 'requestPayment:ok') {
								this.confirmOrder(payment_id).then(()=>{
									uni.navigateTo({
										url: '/pages/recycleSuccess/recycleSuccess?type=1&shop=1'
									})
								})
							}else{
								this.cancelOrder(payment_id)
							}
						},
						fail: err => {
							this.cancelOrder(payment_id)
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
								this.confirmOrder(payment_id).then(()=>{
									uni.navigateTo({
										url: '/pages/recycleSuccess/recycleSuccess?type=1&shop=1'
									})
								})
							}else if (res.err_msg == "get_brand_wcpay_request:cancel") {
								this.cancelOrder(payment_id)
							}else if (res.err_msg == "get_brand_wcpay_request:fail") {
								uni.showToast({
									title: '订单支付失败',
									icon: 'none'
								})
							}
						})
					// #endif
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 微信支付
			 * ****************************************************************************************************
			 */
			pay() {
				if (this.productData.type == 1) {
					if (this.currentSpecification == 0) {
						this.buySingleBox();
					} else {
						if (this.productData.total_stock > 0) {
							this.buyEndBox();
						} else {
							uni.showToast({
								title: '库存不足',
								icon: 'none'
							})
						}

					}
				} else {
					this.buySingleBox();
				}

			},

			/**
			 * ****************************************************************************************************
			 * @description 改变抵扣状态
			 * ****************************************************************************************************
			 */
			changeDeduct() {
				if (this.deduct == 1) {
					this.deduct = 2
				} else {
					this.deduct = 1
				}
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
						console.log(err)
					})
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
		z-index: 999;

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

	// .pic-wrap
	.pic-wrap {
		display: flex;
		align-items: center;
		padding: 40rpx;

		image {
			width: 156rpx;
			height: 156rpx;
			background: rgba(178, 178, 178, 1);
			border-radius: 15px;
			margin-right: 30rpx;
		}

		.text {
			display: flex;
			flex-direction: column;
			font-size: 24rpx;
			flex: 1;
			overflow: hidden;

			.title {
				font-size: $fs-36;
				font-family: phM;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			.stock {
				color: $cl-gray1;
				margin-top: 28rpx;
			}

			.price {
				font-size: 36rpx;
				color: $cl-main;
				margin-top: 13rpx;
			}
		}
	}

	// specifiaction
	.specifiaction {
		padding: 0 40rpx;

		.title {
			font-size: $fs-28;
			font-family: phM;
		}

		.list {
			display: flex;
			flex-wrap: wrap;
			padding: 36rpx 0;

			.item {
				width: 190rpx;
				height: 50rpx;
				border-radius: 25rpx;
				background-color: $cl-gray4;
				font-size: 24rpx;
				color: $cl-gray3;
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 20rpx;
				border: 2rpx solid $cl-gray4;
				font-family: phM;
				margin-right: 20rpx;

				&:nth-child(-n+3) {
					margin-top: 0;
				}

				&.active {
					background-color: #91E7D6;
					border-color: $cl-main;
					color: $cl-black;
				}
			}
		}
	}


	// nums
	.nums {
		padding: 0 40rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.title {
			font-size: $fs-28;
			font-family: phM;
		}

		.change {
			display: flex;
			align-items: center;

			button {
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				background-color: $cl-gray4;
				position: relative;

				&::after {
					display: block;
					content: '';
					width: 26rpx;
					height: 6rpx;
					background-color: #fff;
					border: none;
					border-radius: 0;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);

				}

				&.button-hover {
					background-color: #e0e0e0 !important;
				}

				&.add::before {
					content: '';
					position: absolute;
					width: 6rpx;
					height: 26rpx;
					background-color: #fff;
					border: none;
					border-radius: 0;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);

				}
			}

			.text {
				margin: 0 20rpx;
				font-size: $fs-28;
			}
		}
	}

	// confirm-details
	.confirm-details {
		padding: 40rpx 40rpx 24rpx;
		display: flex;
		flex-direction: column;
		border-bottom: 1rpx solid $cl-gray5;

		.remarks {
			font-size: $fs-22;
			color: $cl-gray3;
			line-height: 1.5;
		}

		.detail {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			font-size: $fs-24;
			color: $cl-gray3;
			margin-top: 80rpx;

			.total text {
				color: $cl-red;
				font-size: $fs-28;
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

				;
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
