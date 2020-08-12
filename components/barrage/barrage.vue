<template>
	<!-- barrage start -->
	<view class="barrage-wrap" :style="{height:`${row*80-20}rpx`}" >
		<!-- #ifdef H5 -->
			<view :class="['barrage-item',{'active':item.is_hide==1}]" v-for="(item,index) in items" :style="{top:item.top}" :key="index">
				恭喜{{item.name}}抽到{{item.product_name}}{{item.is_hide==1?'(隐藏款)':''}}
			</view>
		<!-- #endif -->
		<!-- #ifdef MP-WEIXIN -->
			<view :class="['barrage-item',{'active':item.is_hide==1}]" v-for="(item,index) in items" :style="{top:item.top, animation: `mymove ${Number(item.speed)}s linear forwards`}" :key="index">
				恭喜{{item.name}}抽到{{item.product_name}}
			</view>
		<!-- #endif -->
	</view>
	<!-- barrage end -->
</template>

<script>
	export default {
		props: [
			'row',
			'speed',

		],
		data() {
			return {
				items: [],
				timer: null,
				maxTime: 16,
				minTime: 8,
				time:3
			}
		},
		onUnload() {
			console.log(3)
		},
		methods: {
			start(list) {
				if (list.length > 0) {
					let newList = [...list];
					newList.forEach((item, index) => {
						item.top = `${index%this.row*80}rpx`;
						item.speed = Math.ceil( Math.floor( Math.random() * (this.maxTime - this.minTime + 1) + this.minTime));
					});
					let i = 0;
					let len = newList.length;
					let last = newList.length>5?3:1;
					this.timer = setInterval(() => {
						if (i < len - last) {
							this.items.push(newList[i]);
							i++
						} else {
							clearInterval(this.timer);
						}
					}, (Math.random()+0.5) * this.time*1600)
				}
			},
			end(){
				if (this.items.length>20){
					this.items.splice(0,13);
				}
				clearInterval(this.timer);
			},
			close(){
				this.items = [];
				clearInterval(this.timer);
			}
		}
	}
</script>

<style>
	/* barrage-wrap */
	.barrage-wrap {
		width: 100%;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 100;
		pointer-events: none;
	}

	.barrage-item {
		padding: 15rpx 40rpx;
		background-color: rgba(0, 0, 0, .4);
		border-radius: 50rpx;
		position: absolute;
		color: #fff;
		font-size: 24rpx;
		left: 100%;
		animation: mymove 10s linear forwards;
		animation-timing-function: linear;
		-webkit-animation-timing-function: linear;
		animation-fill-mode: forwards;
		white-space: nowrap;
	}

	.barrage-item.active {
		background-color: rgba(255, 0, 0, .8);
		z-index: 1000;
	}

	.barrage-item:nth-child(5n+1) {
		animation-duration: 15s;
	}

	.barrage-item:nth-child(5n+2) {
		animation-duration: 12s;
	}

	.barrage-item:nth-child(5n+3) {
		animation-duration: 17s;
	}

	.barrage-item:nth-child(5n+4) {
		animation-duration: 19s;
	}

	.barrage-item:nth-child(5n+5) {
		animation-duration: 13s;
	}

	@keyframes mymove {
		from {
			left: 100%;
			transform: translate(0,0);
		}

		to {
			left: 0;
			transform: translate(-100%,0);
		}
	}

	@-moz-keyframes mymove

	/* Firefox */
		{
		from {
			left: 100%;
		}

		to {
			left: 0;
			transform: translate(-100%,0);
		}
	}

	@-webkit-keyframes mymove

	/* Safari and Chrome */
		{
		from {
			left: 100%;
		}

		to {
			left: 0;
			transform: translate(-100%,0);
		}
	}

	@-o-keyframes mymove

	/* Opera */
		{
		from {
			left: 100%;
		}

		to {
			left: 0;
			transform: translate(-100%,0);
		}
	}
</style>
