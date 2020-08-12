<template>
	<view class="content">

		<!-- product -->
		<image :src="detail.packing_pic" mode="aspectFill" class="product"></image>

		<!-- id -->
		<view class="id">NO.{{detail.whole_no}}</view>

		<!-- btns start -->
		<view class="btns">
			<button class="btn" @click="open">立即拆开 ({{time>9?time:'0'+time}}s)</button>
		</view>
		<!-- btns end -->

	</view>
</template>

<script>
	export default {
		data() {
			return {
				//商品id
				id: '',
				
				//倒计时
				time:120,
				
				// 端盒详情
				detail:{
					packing_pic:'',
					series_name:'',
					whole_no:'00000000000001'
				},
				
				//计时器
				timer:null,
			}
		},
		onLoad({id}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id;
			this.changeTime()
		},
		onUnload(){
			clearInterval(this.timer)
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				return new Promise((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/wholesucc`,
						data: {
							id: this.id
						}
					}).then((res) => {
						this.detail =res;
						
						resolve(res)
					})
				})
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
							url: `/pages/lotteryUnboxing1/lotteryUnboxing1?id=${this.id}`
						})
					}

				}, 1000)
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 拆盒
			 * ****************************************************************************************************
			 */
			open(){
				uni.redirectTo({
					url: `/pages/lotteryUnboxing1/lotteryUnboxing1?id=${this.id}`
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
