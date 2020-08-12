<template>

	<!-- toast start -->
	<view :class="['toast-wrap',{'active':show}]">
		<view class="toast-content">
			<view class="title">签到成功</view>
			<image :src="imgSrc" mode="aspectFill"></image>
			<view class="add">+{{integral}}积分</view>
			<view class="back" @click="close"></view>
		</view>
	</view>
	<!-- toast end -->

</template>

<script>
	export default {
		props:[
			'imgSrc'
		],
		data(){
			return{
				
				//是否显示
				show :false,
				
				// 签到成功图片
				signInSuccess:this.$PNG+'/signInSuccess.png',
				
				//积分
				integral:0
				
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			open(integral){
				this.integral = integral;
				this.show = true;
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			close(){
				this.show = false;
			}
		},
		mounted() {

		}
	}
</script>

<style lang="scss">
	.toast-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: rgba($color: #000000, $alpha: 0.5);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		pointer-events: none;
		transition: all .3s ease;
		&.active{
			opacity: 1;
			pointer-events: all;
		}

		.toast-content {
			width: 534rpx;
			border-radius: $radius-30;
			background-color: $cl-white;
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-bottom: 64rpx;

			.title {
				width: 100%;
				height: 100rpx;
				background-color: $cl-main;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: $fs-32;
				color: $cl-white;
				border-top-left-radius: $radius-30;
				border-top-right-radius: $radius-30;
			}

			image {
				width: 320rpx;
				height: 320rpx;
				margin-top: 32rpx;
			}
			.add{
				font-size: $fs-40;
				color: $cl-main;
				margin-top: 50rpx;
			}

			.back {
				position: absolute;
				width: 60rpx;
				height: 60rpx;
				border: 4rpx solid $cl-gray2;
				border-radius: 50%;
				left: 50%;
				bottom: -30rpx;
				transform:translate(-50%,100%);
				&::before{
					content: '';
					width: 30rpx;
					height: 4rpx;
					background: $cl-gray2;
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%,-50%) rotateZ(45deg);
				}
				&::after{
					content: '';
					width: 4rpx;
					height: 30rpx;
					background: $cl-gray2;
					position: absolute;
					left: 50%;
					top: 50%;
					transform: translate(-50%,-50%) rotateZ(45deg);
				}
			}
		}
	}
</style>
