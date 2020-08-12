<template>
	<view class="content">

		<!-- product -->
		<image :src="detail.pic" mode="aspectFill" class="product"></image>

		<!-- id -->
		<view class="id">NO.{{detail.index_no}}</view>

		<!-- btns start -->
		<view class="btns">
			<!-- #ifdef MP-WEIXIN -->
			<button class="btn" open-type="share" >继续分享</button>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<button class="btn" @click="share">继续分享</button>
			<!-- #endif -->
			<button class="btn reverse" @click="open">立即拆开 ({{time>9?time:'0'+time}}s)</button>
		</view>
		<!-- btns end -->

		<!-- vote start -->
		<view class="vote">
			<view class="title">
				点击参与投票
			</view>
			<scroll-view scroll-x="true" class="list">
				<view class="item" v-for="(item,index) in detail.product_info" :key="index">
					<image :src="item.picture" mode="aspectFill"></image>
					<button v-if="!voteState" @click="toVote(item)">投票</button>
					<button v-else class="active">{{item.user_num}}票</button>
				</view>
			</scroll-view>
		</view>
		<!-- vote end -->
		<guess ref="guess" @close="close"></guess>
		
		<!-- #ifdef H5 -->
		<!-- share -->
		<share ref="share"></share>
		<!-- #endif -->
	</view>
</template>

<script>
	// #ifdef H5
	import jwx from '@/assets/jweixin.js'
	// #endif
	import share from '@/components/share/share.vue';
	import guess from '@/components/guess/guess.vue';
	export default {
		components:{
			guess,
			share
		},
		data() {
			return {
				//盒柜id
				id: '',
				
				// 单盒详情
				detail:{
					packing_pic:'',
					series_name:'',
					index_no:'00000000000001',
					product_info:[]
				},
				
				//倒计时
				time:120,
				
				//计时器
				time:null,
				
				//投票状态
				voteState: false,
				
				// 投票结果
				result:null
				
			}
		},
		onLoad({id,time}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id;
			this.time = time;
			this.changeTime()
		},
		onUnload(){
			clearInterval(this.timer);
			// #ifdef H5
			this.$util.getSDK()
			// #endif
		},
		onShareAppMessage(res) {
			return {
				title: this.$store.getters.getName,
				path: `/pages/lotteryGuessFriend/lotteryGuessFriend?id=${this.id}`,
				imageUrl: this.detail.packing_pic
			}
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
						url: `${this.$API}/friendguess`,
						data: {
							id: this.id
						}
					}).then((res) => { 
						this.detail = res;
						resolve(res)
					})
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 投票
			 * ****************************************************************************************************
			 */
			toVote(item) {
				this.$RQST({
					url: `${this.$API}/govote`,
					data: {
						id: this.id,
						product_id:item.id
					}
				}).then((res) => { 
					this.result = res;
					this.voteState = true;
					this.getDetail();
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
							url: `/pages/lotteryUnboxing2/lotteryUnboxing2?id=${this.id}`
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
				this.getVoteDetail().then((res)=>{
					if(this.voteState){
						let result = Object.assign({},this.result,res)
						this.$refs.guess.open(result,1);
					}else{
						uni.redirectTo({
							url: `/pages/lotteryUnboxing2/lotteryUnboxing2?id=${this.id}`
						})
					}
				})
			},
			close(){
				uni.redirectTo({
					url: `/pages/lotteryUnboxing2/lotteryUnboxing2?id=${this.id}`
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description h5分享
			 * ****************************************************************************************************
			 */
			share() {
				this.$refs.share.open();
			},
			/**
			 * ****************************************************************************************************
			 * @description 获取投票信息
			 * ****************************************************************************************************
			 */
			getVoteDetail(){
				return new Promise((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/govotenum`,
						data: {
							id: this.id
						}
					}).then((res) => { 
						resolve(res)
					}).catch((err)=>{
						console.log(err)
					})
				})
			}
		},
		mounted() {
			this.getDetail();
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
		padding-bottom: 320rpx;
	}

	// product
	.product {
		width: 434rpx;
		height: 434rpx;
		margin-top: 180rpx;
	}

	// id
	.id {
		font-size: $fs-22;
		color: $cl-gray3;
		margin-top: 40rpx;
	}

	// btns
	.btns {
		width: 640rpx;
		display: flex;
		justify-content: space-between;
		margin-top: 100rpx;

		.btn {
			width: 300rpx;
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

	// vote
	.vote {
		width: 710rpx;
		padding: 25rpx 50rpx 38rpx;
		background-color: #fff;
		border-top-left-radius: $radius-30;
		border-top-right-radius: $radius-30;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		bottom: 0;

		.list {
			margin-top: 25rpx;
			display: flex;
			white-space: nowrap;

			.item {
				display: inline-block;
				margin-left: 30rpx;
				width: 120rpx;

				&:first-child {
					margin-left: 0;
				}

				image {
					width: 120rpx;
					height: 120rpx;
					border: 2rpx solid $cl-main;
					border-radius: $radius-15;
				}

				button {
					width: 120rpx;
					height: 40rpx;
					border-radius: $radius-15;
					border: 2rpx solid $cl-main;
					color: $cl-main;
					font-size: $fs-24;
					background: none;
					margin-top: 12rpx;

					&.button-hover {
						background-color: $cl-gray4;
					}

					&.active {
						background-color: $cl-main;
						color: $cl-white;
					}
				}
			}
		}
	}
</style>
