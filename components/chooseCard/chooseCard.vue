<template>

	<!-- confirm start -->
	<view :class="['confirm-wrap',{'active':show}]">

		<view class="popups" @click="close"></view>

		<view class="confirm-content">
			<view class="item" @click="checked=0">
				<view :class="['circle',{'checked':checked==0}]"></view>
				<view class="text">
					<view class="title">积分数（{{detail.integral}}）</view>
					<view class="desc">
						<text>消耗{{detail.consume}}积分使用一张{{type}}
							可额外获得一次关于盲盒的{{type=='提示卡'?'提示信息':'透视信息'}}
						</text>
					</view>
				</view>
			</view>
			<view class="item" @click="checked=1">
				<view :class="['circle',{'checked':checked==1}]"></view>
				<view class="text">
					<view class="title">{{type}}（{{detail.nums}}）</view>
					<view class="desc">
						<text>使用卡券中的{{type}}
							可额外获得一次关于盲盒的{{type=='提示卡'?'提示信息':'透视信息'}}
						</text>
					</view>
				</view>
			</view>

			<button type="default" class="btn" @click="submit">确定</button>
		</view>

	</view>
	<!-- specifiaction end -->

</template>

<script>
	export default {
		props:[
			'type'
		],
		data() {
			return {
				//是否显示
				show: false,
				
				// 当前选择
				checked: 0,
				
				// 详细信息
				detail:{
					integral:0,
					consume:100,
					nums:0,
				}
			}
		},
		methods: {

			/**
			 * ****************************************************************************************************
			 * @description 打开
			 * ****************************************************************************************************
			 */
			open(detail) {
				this.detail = detail;
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

			/**
			 * ****************************************************************************************************
			 * @description 确定
			 * ****************************************************************************************************
			 */
			submit() {
				this.detail.checked = this.checked;
				this.detail.type = this.type;
				this.$emit('submit', this.detail)
			}
		},
		mounted() {

		}
	}
</script>

<style lang="scss">
	// confirm-wrap
	.confirm-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		line-height: 1;
		pointer-events: none;
		opacity: 0;
		background-color: rgba(0, 0, 0, .5);
		transition: opacity .3s ease;

		&.active {
			opacity: 1;
			pointer-events: all;
		}
	}

	// popups
	.popups {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;

	}

	// confirm-content
	.confirm-content {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 534rpx;
		border-radius: $radius-30;
		background-color: #fff;
		overflow: hidden;

		.item {
			padding: 50rpx 64rpx;
			display: flex;
			align-items: center;
			border-bottom: 2rpx solid $cl-gray1;

			.circle {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				border: 2rpx solid $cl-main2;
				margin-right: 25rpx;

				&.checked {
					background-color: $cl-main2;
				}
			}

			.text {
				flex: 1;

				.title {
					font-size: $fs-28;
					margin-bottom: 20rpx;
				}

				.desc {
					font-size: $fs-22;
					color: $cl-gray3;
					line-height: 36rpx;
				}
			}
		}

		.btn {
			border-radius: 0;
			background-color: $cl-white;
			height: 100rpx;

			&.button-hover {
				background-color: $cl-gray5;
				color: $cl-black;
			}
		}
	}
</style>
