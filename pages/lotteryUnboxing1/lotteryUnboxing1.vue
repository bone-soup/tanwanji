<template>
	<view class="content">
		<!-- product-wrap start -->
		<view class="product-wrap">
			<image :src="list.length>1?list[current].picture:''" mode="aspectFill"></image>
			<text class="title">
				恭喜您获得{{list.length>1?list[current].product_name:''}}
				已放入盒柜</text>
			<view class="remarks">如需发货请至"我的-我的盒柜"选择发货</view>
		</view>
		<!-- product-wrap end -->

		<!-- btn-wrap start -->
		<view class="btn-wrap">
			<button class="btn" @click="continueLottery" v-if="current<list.length-1">继续拆盒</button>
			<button class="btn" @click="toBox" v-if="current==list.length-1">查看盒柜</button>
			<button class="btn reverse" @click="toIndex" v-if="current==list.length-1">返回首页</button>
		</view>
		<!-- btn-wrap end -->
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				//端盒id
				id:'',
				
				//拆盒列表
				list:[],
				
				//当前索引
				current:0
			}
		},
		onLoad({id}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id;
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 拆盒列表
			 * ****************************************************************************************************
			 */
			getList() {
				return new Promise((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/wholeopen`,
						data: {
							id: this.id
						}
					}).then((res) => {
						this.list =res;
						
						resolve()
					})
				})
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 继续抽盒
			 * ****************************************************************************************************
			 */
			continueLottery(){
				if(this.current<this.list.length-1){
					this.current++
				}
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 查看盒柜
			 * ****************************************************************************************************
			 */
			toBox(){
				uni.redirectTo({
					url:'/pages/mineBox/mineBox'
				})
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 返回首页
			 * ****************************************************************************************************
			 */
			toIndex(){
				uni.switchTab({
					url:'/pages/index/index'
				})
			}
		
		},
		mounted() {
			this.getList();
		}
	}
</script>

<style lang="scss">
	// content
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 82rpx 70rpx;
	}

	// product-wrap
	.product-wrap {
		padding: 40rpx;
		background-color: $cl-white;
		border-radius: $radius-30;

		image {
			width: 530rpx;
			height: 530rpx;
			border-radius: $radius-30;
		}

		.title {
			font-size: $fs-40;
			font-family: phM;
			line-height: 48rpx;
			color: $cl-main;
			text-align: center;
			margin-top: 68rpx;
			display: block;
		}

		.remarks {
			font-size: $fs-24;
			color: $cl-gray2;
			text-align: center;
			margin-top: 38rpx;
		}

	}

	// btn-wrap
	.btn-wrap {
		width: 540rpx;
		margin-top: 80rpx;
		display: flex;
		justify-content: space-between;

		.btn {
			width: 250rpx;
			height: 100rpx;
			border-radius: 50rpx;

			&.reverse {
				background-color: $cl-white;
				color: $cl-main;
				&.button-hover {
					background-color: $cl-gray4;
				}
			}
		}

	}
</style>
