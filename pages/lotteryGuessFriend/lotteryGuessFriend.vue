<template>
	<view class="content">

		<!-- product -->
		<image :src="detail.pic" mode="aspectFill" class="product" v-if="detail&&detail.end"></image>
		
		<!-- id -->
		<view class="id" v-if="detail&&detail.end">NO.{{detail.index_no}}</view>

		<!-- vote start -->
		<view class="vote" v-if="detail&&detail.end">
			<view class="title" v-if="detail.cab_user.name">
				{{detail.cab_user.name||'正在获取用户昵称'}} 邀请您参与竞猜 ({{time>9?time:'0'+time}}s)
			</view>
			<scroll-view scroll-x="true" class="list">
				<view class="item" v-for="item in detail.product_info">
					<image :src="item.picture" mode="aspectFill"></image>
					<button v-if="voteState==0" @click="toVote(item)">投票</button>
					<button v-else class="active">{{item.user_num}}票</button>
				</view>
			</scroll-view>
		</view>
		<!-- vote end -->
		
		<guess ref="guess"></guess>
	</view>
</template>

<script>
	import guess from '@/components/guess/guess.vue';
	export default {
		components:{
			guess
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
				timer:null,
				
				//投票状态
				voteState: false
			}
		},
		onLoad({id,authorization,hash}) {
			uni.setNavigationBarTitle({
				title:this.$store.getters.getName
			});
			this.id = id;
			// #ifdef H5
			if(authorization && hash){
				uni.setStorageSync('token',{
					"authorization":authorization,
					"hash":hash,
				});
			}
			// #endif

		},
		onUnload(){
			clearInterval(this.timer)
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
						if(res.end){
							resolve(res)
						}else{
							uni.redirectTo({
								url: `/pages/lotteryGuessFriendEnd/lotteryGuessFriendEnd?id=${this.id}&user=${this.detail.cab_user.name}`
							})
						}
					}).catch((err)=>{
						uni.showToast({
							title:'您的网络可能有些堵塞，请稍后再试',
							icon:"none"
						})
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
						product_id:item.id,
						special:true
					}
				}).then((res) => { 
					if(res.end){
						if(res.is_tou){
							this.$refs.guess.open(res,2);
							this.voteState = true;
							this.getDetail();
						}else{
							uni.showToast({
								title:'您已经参与过投票了',
								icon:"none"
							})
						}
					}else{
						uni.redirectTo({
							url: `/pages/lotteryGuessFriendEnd/lotteryGuessFriendEnd?id=${this.id}&user=${this.detail.cab_user.name}`
						})
					}
					
				}).catch(err=>{
					uni.navigateTo({
						url: `/pages/login/login?src=/pages/lotteryGuessFriend/lotteryGuessFriend&id=${this.id}`
					})
				})
			},
			
			/**
			 * ****************************************************************************************************
			 * @description 倒计时
			 * ****************************************************************************************************
			 */
			changeTime() {
				this.timer = setInterval(() => {
					if (this.time > 1) {
						this.time--;
					} else {
						clearInterval(this.timer);
						uni.redirectTo({
							url: `/pages/lotteryGuessFriendEnd/lotteryGuessFriendEnd?id=${this.id}&user=${this.detail.cab_user.name}`
						})
					}
				}, 1000)
			},
		},
		mounted() {
			this.getDetail().then(res=>{
				let time = parseInt(new Date().getTime()/1000);
				this.time = 120 - (time-res.create_at);
				if(time<=0){
					this.time = 0;
					uni.redirectTo({
						url: `/pages/lotteryGuessFriendEnd/lotteryGuessFriendEnd?id=${this.id}&user=${this.detail.cab_user.name}`
					});
					return false;
				}
				this.changeTime();
			})
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
		width: 500rpx;
		height: 500rpx;
		margin-top: 200rpx;
	}

	// id
	.id {
		font-size: $fs-22;
		color: $cl-gray3;
		margin-top: 40rpx;
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
