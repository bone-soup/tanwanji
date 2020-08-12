<template>
	<!-- 确认订单 -->
	<view class="content card-order">
		<view class="order-detail">
			<image :src="order.item.picture" mode="aspectFill"></image>
			<view>
				<view>{{order.item.title}}</view>
				<text>{{order.item.explain_point}}积分</text>
			</view>
			<text>x{{order.count}}</text>
		</view>
		<view class="bot-btn">
			<view><view>应付款：</view><text>{{tolPrice}}积分</text></view>
			<text @click="exchangeNow">立即兑换</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tolPrice:'',
				order:{}
			}
		},
		onLoad() {

		},
		onShow() {
			const that = this;
			uni.getStorage({
				key: 'cardMsg',
				success: function (res) {
					that.order = res.data;
					that.tolPrice = res.data.item.explain_point * res.data.count;
				}
			})
		},
		methods: {
			// 点击立即兑换
			exchangeNow:function () {
				const that = this;
				that.$RQST({
					url: `${this.$API}/activity/exchange/submit`,
					data:{
						authorization:uni.getStorageSync('token').authorization,
						hash:uni.getStorageSync('token').hash,
						id:that.order.item.id,
						number:that.order.count,
					}
				}).then((res) => {
					console.log(res);
					uni.showToast({
						title:'兑换成功',
						icon:'none',
						success:()=>{
							uni.redirectTo({
								url: `/pages/recycleSuccess/recycleSuccess?type=3&point=${that.tolPrice}`
							})
						}
					})
				}).catch((err) => {
					console.log(err);
				})
			},
		},
	}
</script>

<style lang="scss">
	.card-order{
		padding: 20rpx;
		.order-detail{
			width: 100%;
			background: $cl-white;
			border-radius: $radius-30;
			padding: 40rpx;
			display: flex;
			align-items: center;
			position: relative;
			image{
				width: 180rpx;
				height: 180rpx;
				border-radius: $radius-15;
				margin-right: 40rpx;
				flex-shrink: 0;
			}
			>text{
				color: $cl-black;
				font-size: $fs-36;
				position: absolute;
				bottom: 40rpx;
				right: 40rpx;
			}
			view{
				view{
					color: $cl-black;
					font-size: $fs-34;
					margin-bottom: 40rpx;
				}
				text{
					color: #888888;
					font-size: 28rpx;
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
				padding-left: 60rpx;
				width: 100%;
				line-height: 120rpx;
				display: flex;
				align-items: center;
				font-family: phR;
				>view{
					color: #888888;
					font-size: $fs-34;
				}
				text{
					color: $cl-black;
					font-size: $fs-34;
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
