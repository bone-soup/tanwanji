<template>
	<view class="shadow" :class="{'show':showChild}" @click="closeBox">
		<view class="bot-box" @click.stop>
			<image @click="closeBox" class="close" :src="closeBtn" mode=""></image>
			<view class="content">
				<image :src="detail.picture" mode=""></image>
				<view>{{detail.explain_point}}积分</view>
			</view>
			<view class="mount">
				<text>购买数量</text>
				<view>
					<view @click="decrease" @longpress="decreaseQ" @touchend="clearTimer">-</view>
					<text>{{count}}</text>
					<view @click="increase" @longpress="increaseQ" @touchend="clearTimer">+</view>
				</view>
			</view>
			<view class="confirm" @click="exchange">立即兑换</view>
		</view>
	</view>
</template>

<script>
	export default {
		props:['detail','showChild','myPoint'],
		data() {
			return {
				closeBtn:`${this.$PNG}/close-btn.png`,
				count:1,				// 当前数量
			};
		},
		methods:{
			// 关闭底部弹窗
			closeBox:function () {
				this.$emit('close');
				this.count = 1;
			},
			// 点击减少
			decrease:function () {
				this.count = this.count<2 ? 1 : this.count - 1;
			},
			// 长按减少
			decreaseQ:function () {
				this.deTimer = setInterval(()=>{
					this.decrease();
				},100)
			},
			// 点击增加
			increase:function () {
				this.count = this.count>98 ? 99 : this.count + 1;
			},
			// 长按增加
			increaseQ:function () {
				this.inTimer = setInterval(()=>{
					this.increase();
				},100)
			},
			// 清除定时器
			clearTimer:function () {
				clearInterval(this.deTimer);
				clearInterval(this.inTimer);
			},
			// 点击立即兑换
			exchange:function () {
				const that = this;
				console.log(this.detail.point*this.count,this.myPoint)
				if ( this.detail.explain_point*this.count > this.myPoint) {
					uni.showToast({title:'您的积分不足~',icon:'none'})
				}else{
					this.$emit('buyCards',this.count,this.detail);
					setTimeout(()=>{
						that.count = 1;
					},1000);
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.shadow.show{
		pointer-events: all;
		opacity: 1;
	}
	.shadow{
		position: fixed;
		opacity: 0;
		pointer-events: none;
		transition: all .3s ease-in-out;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.5);
		left: 0;
		top: 0;
		z-index: 50;
	}
	.shadow.show .bot-box{
		bottom: 0;
	}
	.bot-box{
		position: absolute;
		transition: all .3s ease-in-out;
		bottom: -660rpx;
		left: 0;
		background: #FFFFFF;
		width: 100%;
		border-radius: 30rpx 30rpx 0 0;
		padding-top: 30rpx;
		.close{
			position: absolute;
			right: 40rpx;
			top: 40rpx;
			width: 35rpx;
			height: 35rpx;
			z-index: 100;
		}
		.content{
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			margin-bottom: 100rpx;
			image{
				width:156rpx;
				height:156rpx;
				border-radius:15rpx;
				margin-right: 40rpx;
			}
			view{
				font-size: $fs-36;
				color: $cl-main;
			}
		}
		.mount{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 30rpx;
			margin-bottom: 140rpx;
			text{
				color: #525252;
				font-size: $fs-28;
				font-family: phM;
			}
			view{
				display: flex;
				align-items: center;
				view{
					width: 49rpx;
					height: 49rpx;
					border-radius: 50%;
					background: #e6e6e6;
					line-height: 49rpx;
					text-align: center;
					display: inline-block;
					color: $cl-white;
					font-size: $fs-40;
				}
				text{
					color: #525252;
					font-size: $fs-28;
					font-family: phM;
					display: inline-block;
					text-align: center;
					width: 90rpx;
				}
			}
		}
		.confirm{
			width: 100%;
			text-align: center;
			background: $cl-main;
			color: $cl-white;
			font-size: $fs-34;
			height: 120rpx;
			line-height: 120rpx;
		}
	}
</style>
