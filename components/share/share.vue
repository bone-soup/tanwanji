<template>

	<!-- confirm start -->
	<view :class="['share-wrap',{'active':show}]">

		<view class="popups" @click="close"></view>

		<image :src="img" mode="aspectFill"></image>
		<view class="text">点击这里分享哦</view>
		<view class="btn">知道啦</view>

	</view>
	<!-- specifiaction end -->

</template>

<script>
	export default {
		data() {
			return {
				show: false,
				img:this.$PNG+'/share.png'
			}
		},
		methods: {

			/**
			 * ****************************************************************************************************
			 * @description 打开
			 * ****************************************************************************************************
			 */
			open() {
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
		},
		mounted() {

		}
	}
</script>

<style lang="scss">
	// confirm-wrap
	.share-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		line-height: 1;
		pointer-events: none;
		opacity: 0;
		background-color: rgba(0, 0, 0, .7);
		transition: opacity .3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		&.active {
			opacity: 1;
			pointer-events: all;
		}
		// popups
		.popups {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		
		}
		
		image{
			width: 391rpx;
			height: 623rpx;
			margin-left: 120rpx;
			margin-top: 160rpx;
		}
		.text{
			font-size: $fs-32;
			font-family: phM;
			color: $cl-white;
			margin-top: 35rpx;
		}
		.btn{
			width: 266rpx;
			height: 100rpx;
			border-radius: 50rpx;
			border: 4rpx solid $cl-white;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: $fs-32;
			font-family: phM;
			color: $cl-white;
			margin-top: 70rpx;
		}
	}


</style>
