<template>

	<!-- model start -->
	<view :class="['model-wrap',{'active':show}]">
		<view class="model-content">
			<view class="titles">
				<view class="title">{{integral}}积分</view>
				<view class="sub-title">回收可获得</view>
			</view>
			<view class="desces">
				<text class="desc">是否回收本次抽中盲盒？
					回收需扣除手续费{{handling}}积分</text>
				<text class="remarks">所有回收返还都直接进入积分不会退回支付账户
					请谨慎操作！</text>
			</view>
			<view class="btns">
				<button type="default" class="btn" @click="comfirm(1)">确定</button>
				<button type="default" class="btn" @click="comfirm(0)">取消</button>
			</view>
		</view>
	</view>
	<!-- model end -->

</template>

<script>
	export default {
		data() {
			return {
				show: false,
				integral: '',
				handling: ''
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			open({
				integral = '0',
				handling = '0'
			}) {
				this.integral = integral,
					this.handling = handling,
					this.show = true;
			},
			/**
			 * ****************************************************************************************************
			 * @description 关闭提示
			 * ****************************************************************************************************
			 */
			close() {
				this.show = false;
				this.$emit('close', true)
			},
			/**
			 * ****************************************************************************************************
			 * @description 确定或取消
			 * @param {number} e  0:取消 1:确定
			 * ****************************************************************************************************
			 */
			comfirm(e){
				this.show = false;
				if(e==1){
					this.$emit('comfirm',true)
				}
			}
		},
		mounted() {

		}
	}
</script>

<style lang="scss">
	.model-wrap {
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

		&.active {
			opacity: 1;
			pointer-events: all;
		}

		.model-content {
			width: 610rpx;
			border-radius: $radius-30;
			overflow: hidden;
			background-color: $cl-white;
			position: relative;

			.titles {
				height: 190rpx;
				background-color: $cl-main;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				color: $cl-white;

				.title {
					font-size: $fs-56;
					margin-bottom: 20rpx;
				}
			}

			.desces {
				padding: 72rpx 42rpx;
				line-height: 46rpx;
				text-align: center;

				.desc {
					font-size: $fs-32;
					line-height: 46rpx;
					margin-bottom: 30rpx;
					display: block;
				}

				.remarks {
					color: $cl-red;
					line-height: 34rpx;
					font-size: $fs-24;
					display: block;
				}
			}

			.btns {
				display: flex;

				.btn {
					width: 100%;
					height: 124rpx;
					background-color: $cl-white;
					border-top: 2rpx solid $cl-gray1;
					border-radius: 0;

					&:first-child {
						border-right: 2rpx solid $cl-gray1;
					}

					&.button-hover {
						background-color: $cl-gray4;
						color: $cl-black;
					}
				}
			}
		}
	}
</style>
