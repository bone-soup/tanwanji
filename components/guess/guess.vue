<template>

	<!-- toast start -->
	<view :class="['toast-wrap',{'active':show}]">
		<view class="toast-content">
			<view class="title">{{status?'恭喜猜中':'很遗憾，没猜中'}}</view>
			<view class="sub-title">积分+{{integral}} {{status?'继续加油':'再接再厉'}}</view>
			<image :src="img" mode="widthFix"></image>
			<view class="desc">共有{{people}}人参与竞猜，{{great}}人竞猜成功</view>
			<view class="back" @click="close">{{type==1?'继续':'返回'}}</view>
		</view>
	</view>
	<!-- toast end -->

</template>

<script>
	export default {
		data(){
			return{
				show :false,
				status:'',
				people:0,
				great:0,
				integral:0,
				img:this.$PNG+'/guess.png',
				type:1
				
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 打开提示
			 * ****************************************************************************************************
			 */
			open({status,add_point=0,all_user=0,all_true=0},type){
				this.status = status,
				this.integral = add_point,
				this.people = all_user,
				this.great = all_true,
				this.show = true;
				this.type = type;
			},
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			close(){
				this.show = false;
				this.$emit('close',true)
			}
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
			width: 440rpx;
			border-radius: 30rpx;
			background-color: $cl-white;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			padding: 70rpx 50rpx 40rpx;

			.title {
				font-family: phM;
				font-size: $fs-32;
			}
			.sub-title{
				font-size: $fs-24;
				color: $cl-main;
				font-family: phM;
				margin-top: 20rpx;
			}
			image{
				width: 251rpx;
				margin-top: 60rpx;
			}

			.desc {
				font-size: $fs-24;
				color: $cl-gray3;
				margin-top: 46rpx;
			}

			.back {
				font-size: 24rpx;
				font-family: phM;
				margin-top: 50rpx;
			}
		}
	}
</style>
