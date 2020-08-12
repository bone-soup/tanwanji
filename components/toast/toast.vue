<template>

	<!-- toast start -->
	<view :class="['toast-wrap',{'active':show}]">
		<view class="toast-content">
			<view class="title">{{title}}</view>
			<view class="desc" v-html="desc"></view>
			<view class="back" @click="close"></view>
		</view>
	</view>
	<!-- toast end -->

</template>

<script>
	export default {
		data(){
			return{
				show :false,
				title:'',
				desc:''
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			open({title='提示',desc='暂无内容'}){
				this.title = title,
				this.desc = desc,
				this.show = true;
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
			border-radius: 30rpx;
			background-color: $cl-white;
			position: relative;

			.title {
				height: 100rpx;
				background-color: $cl-main;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: $fs-32;
				color: $cl-white;
				border-top-left-radius: 30rpx;
				border-top-right-radius: 30rpx;
			}

			.desc {
				padding: 80rpx 60rpx;
				line-height: 46rpx;
				text-align: center;
				.tt{
					font-size: $fs-32;
					line-height: 1;
					margin-bottom: 20rpx;
				}
				.ctt{
					color: $cl-gray3;
					line-height: 40rpx;
				}
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
