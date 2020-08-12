<template>
	<view class="content">
		<!-- product-wrap start -->
		<view class="product-wrap">
			<image :src="detail.picture" mode="aspectFill"></image>
			<text class="title">
				恭喜您获得{{detail.name}}
				已放入盒柜</text>
			<view class="remarks">如需发货请至"我的-我的盒柜"选择发货</view>
		</view>
		<!-- product-wrap end -->

		<!-- btn-wrap start -->
		<view class="btn-wrap">
			<button class="btn" @click="continueLottery">继续抽盒</button>
			<button class="btn reverse" @click="returnGoods">不想要了</button>
		</view>
		<!-- btn-wrap end -->

		<!-- recycle -->
		<recycle ref="recycle" @comfirm="recycle"></recycle>
	</view>
</template>

<script>
	import recycle from '@/components/recycle/recycle.vue';
	export default {
		components: {
			recycle
		},
		data() {
			return {
				// 盒柜id
				id: '',
				
				//单盒详情
				detail:{
					name:'',
					picture:'',
					id:''
				},
				amount:'',
			}
		},
		onLoad({
			id
		}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id
			// #ifdef H5
			this.$util.getSDK()
			// #endif
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				const that = this;
				this.$RQST({
					url: `${this.$API}/productopen`,
					data: {
						id: this.id
					}
				}).then((res) => {
					this.detail = res;
					uni.getStorage({
						key: 'restorePrice',
						success: function (res) {
							that.detail.point = res.data*100;
						}
					})
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 继续抽盒
			 * ****************************************************************************************************
			 */
			continueLottery() {
				uni.switchTab({
					url:'/pages/index/index'
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 不想要了
			 * ****************************************************************************************************
			 */
			returnGoods() {
				this.$RQST({
					url: `${this.$API}/moduledetail`,
					data:{
						tables:'serviceSetting'
					}
				}).then((res) => {
					let amount = res.values.status == 'true' ? res.values.amount * 100 : res.values.amount / 100;
					let servicePay = res.values.status == 'true'? amount : Math.floor(this.detail.point*amount);
					let returnPoint = this.detail.point - servicePay;
					this.$refs.recycle.open({
						integral:returnPoint < 0 ? '0' : returnPoint,
						handling:servicePay
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 回收
			 * ****************************************************************************************************
			 */
			recycle() {
				this.$RQST({
					url: `${this.$API}/users/cabinet/recovery`,
					data:{
						ids:this.detail.id
					}
				}).then((res) => {				
					uni.redirectTo({
						url:'/pages/recycleSuccess/recycleSuccess?type=2'
					})
					uni.removeStorage({
						key:'restorePrice'
					})
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
			color: $cl-gray2;
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
			width: 250rpx;
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
