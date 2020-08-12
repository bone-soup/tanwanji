<template>
	<view class="content">

		<!-- product -->
		<image :src="detail.packing_pic" mode="aspectFill" class="product"></image>

		<!-- id -->
		<view class="id">NO.{{detail.machine_no}}</view>

		<!-- btns start -->
		<view class="btns">
			<!-- #ifdef MP-WEIXIN -->
			<button class="btn" open-type="share">分享给好友 让大家猜猜看</button>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<button class="btn" @click="share">分享给好友 让大家猜猜看</button>
			<!-- #endif -->
			<button class="btn reverse" @click="open">立即拆开 ({{time>9?time:'0'+time}}s)</button>
		</view>
		<!-- btns end -->


		<!-- #ifdef H5 -->
		<!-- share -->
		<share ref="share"></share>
		<!-- #endif -->

	</view>
</template>

<script>
	// #ifdef H5
	import jwx from '@/assets/jweixin.js'
	// #endif
	import share from '@/components/share/share.vue';
	export default {
		components: {
			share
		},
		data() {
			return {
				//商品id
				id: '',

				//倒计时
				time: 120,

				// 单盒详情
				detail: {
					packing_pic: '',
					series_name: '',
					machine_no: '00000000000001'
				},

				//计时器
				timer: null,
			}
		},
		onLoad({
			id
		}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id;
			this.changeTime();
		},
		onUnload() {
			clearInterval(this.timer);
		},
		onShareAppMessage(res) {
			clearInterval(this.timer)
			uni.redirectTo({
				url: `/pages/lotteryGuess/lotteryGuess?id=${this.detail.id}&time=${this.time}`
			})
			return {
				title: this.$store.getters.getName,
				path: `/pages/lotteryGuessFriend/lotteryGuessFriend?id=${this.detail.id}`,
				imageUrl: this.detail.packing_pic
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 配置微信分享
			 * ****************************************************************************************************
			 */
			initShare(){
				let title = this.$store.getters.getName;
				let path = `/pages/lotteryGuessFriend/lotteryGuessFriend?id=${this.detail.id}`;
				let imageUrl = this.detail.packing_pic;
				let desc = '猜一猜我抽到了什么，猜对了有积分奖励哦';
				this.$util.getSDK(title,path,desc,imageUrl,()=>{
					clearInterval(this.timer)
					uni.redirectTo({
						url: `/pages/lotteryGuess/lotteryGuess?id=${this.detail.id}&time=${this.time}`
					})
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 获取详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/singlesucc`,
						data: {
							id: this.id
						}
					}).then((res) => {
						this.detail = res;
						
						// #ifdef H5
						this.initShare();
						// #endif
						resolve(res)
					})
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description h5分享
			 * ****************************************************************************************************
			 */
			share() {
				this.$refs.share.open();
			},

			/**
			 * ****************************************************************************************************
			 * @description 倒计时
			 * ****************************************************************************************************
			 */
			changeTime() {
				this.timer = setInterval(() => {
					if (this.time > 0) {
						this.time--;
					} else {
						clearInterval(this.timer);
						uni.redirectTo({
							url: `/pages/lotteryUnboxing2/lotteryUnboxing2?id=${this.detail.id}`
						})
					}

				}, 1000)
			},

			/**
			 * ****************************************************************************************************
			 * @description 拆盒
			 * ****************************************************************************************************
			 */
			open() {
				uni.redirectTo({
					url: `/pages/lotteryUnboxing2/lotteryUnboxing2?id=${this.detail.id}`
				})
			}
		},
		mounted() {
			this.getDetail()
		}
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
	}

	// content
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100%;
		position: relative;
		padding-bottom: 80rpx;
	}

	// product
	.product {
		width: 434rpx;
		height: 434rpx;
		margin-top: 180rpx;
		margin-left: 0;
	}

	// id
	.id {
		font-size: $fs-22;
		color: $cl-gray3;
		margin-top: 40rpx;
	}

	// btns
	.btns {
		width: 670rpx;
		margin-top: 100rpx;

		.btn {
			width: 100%;
			height: 100rpx;
			border-radius: 50rpx;
			margin-bottom: 20rpx;

			&.reverse {
				background-color: $cl-white;
				color: $cl-gray3;

				&.button-hover {
					background-color: $cl-gray4;
				}
			}

		}

	}
</style>
