<template>
	<view class="content">
		<!-- product-wrap start -->
		<view class="product-wrap">
			<image :src="detail.picture" mode="aspectFill"></image>
			<view class="remarks">竞猜已结束，{{user}}在此买到的是 {{detail.name}}</view>
		</view>
		<!-- product-wrap end -->

		<!-- btn-wrap start -->
		<view class="btn-wrap">
			<button class="btn" @click="toIndex">我也要抽盲盒</button>
		</view>
		<!-- btn-wrap end -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//用户名
				user: '',

				//产品详情
				detail: {
					name: '',
					picture: ''
				}
			}
		},
		onLoad({
			id,
			user,
		}) {
			this.id = id;
			this.user = user;
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				this.$RQST({
					url: `${this.$API}/guessproductopen`,
					data: {
						id: this.id
					}
				}).then((res) => {
					this.detail = res;

				})
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 前往首页
			 * ****************************************************************************************************
			 */
			toIndex(){
				uni.switchTab({
					url:'/pages/index/index'
				})
			}
		},
		mounted() {
			this.getDetail();
		}
	}
</script>

<style lang="scss">
	// content
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 82rpx 70rpx;
	}

	// product-wrap
	.product-wrap {
		padding: 40rpx;
		background-color: $cl-white;
		border-radius: $radius-30;

		image {
			width: 530rpx;
			height: 530rpx;
			border-radius: $radius-30;
		}

		.title {
			font-size: $fs-40;
			font-family: phM;
			line-height: 48rpx;
			color: $cl-main;
			text-align: center;
			margin-top: 68rpx;
			display: block;
		}

		.remarks {
			font-size: $fs-24;
			color: $cl-black;
			text-align: center;
			margin-top: 38rpx;
		}

	}

	// btn-wrap
	.btn-wrap {
		width: 540rpx;
		margin-top: 80rpx;
		display: flex;
		justify-content: space-between;

		.btn {
			width: 326rpx;
			height: 100rpx;
			border-radius: 50rpx;

			&.reverse {
				background-color: $cl-white;
				color: $cl-main;

				&.button-hover {
					background-color: $cl-gray4;
				}
			}
		}

	}
</style>
