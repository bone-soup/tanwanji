<template>
	<view class="content">
		<barrage :row="3" ref="barrage" @end="end"></barrage>
		<!-- banner start -->
		<view class="module">
			<swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="5000" :duration="1000" :circular="true">
				<swiper-item v-for="(item,index) in bannerList" :key="index" @click="bannerLink(item)">
					<image :src="item.picture" mode="aspectFill" :alt="item.title"></image>
				</swiper-item>
			</swiper>
		</view>
		<!-- banner end -->

		<!-- nav start -->
		<view class="module">
			<view class="nav">
				<view class="nav-item" v-for="(item,index) in navList" :key="index" @click="toPage(item)">
					<image :src="item.icon" mode="aspectFill" class="icon"></image>
					<view class="text">{{item.text}}</view>
				</view>
			</view>
		</view>
		<!-- nav end -->

		<!-- product start -->
		<view class="module">
			<view class="product">
				<navigator :url="`/pages/lottery/lottery?id=${item.id}`" class="product-item" v-for="(item,index) in productList"
				 :key="item.id">
					<image class="state" :src="iconNew" mode="aspectFill" v-if="item.tags==1"></image>
					<image class="state" :src="iconPrev" mode="aspectFill" v-if="item.tags==2"></image>
					<image class="state" :src="iconHot" mode="aspectFill" v-if="item.tags==3"></image>
					<image :src="item.box_pic" mode="aspectFill"></image>
					<view class="text">
						<view class="title">
							<!-- <view>{{item.name}}</view> -->
							<view>{{item.abbreviation}}</view>
						</view>
						<view class="price">￥<text>{{item.price}}</text></view>
					</view>
				</navigator>
			</view>
			<view class="no-more" v-if="listLock">{{productList.length>0?'到底了~':'暂无商品'}}</view>
		</view>
		<!-- product end -->

	</view>
</template>

<script>
	import barrage from '@/components/barrage/barrage.vue'
	export default {
		components: {
			barrage
		},
		data() {
			return {
				
				iconNew: `${this.$PNG}/new.png`,
				iconHot: `${this.$PNG}/hot.png`,
				iconPrev: `${this.$PNG}/prev.png`,

				//banner列表
				bannerList: [],

				//每页条数
				size: 10,

				//当前页
				page: 1,

				//列表请求锁
				listLock: false,
				//导航列表
				navList: [{
						icon: `${this.$PNG}/index-nav1.png`,
						text: '每日签到',
						path: '/pages/signIn/signIn'
					},
					{
						icon: `${this.$PNG}/index-nav2.png`,
						text: '一元抽',
						path: ''
					},
					{
						icon: `${this.$PNG}/index-nav3.png`,
						text: '积分兑换',
						path: '/pages/pointExchange/pointExchange'
					},
					{
						icon: `${this.$PNG}/index-nav4.png`,
						text: '邀请好友',
						path: '/pages/invite/invite'
					}
				],

				//产品列表
				productList: [],

				//弹幕列表
				barrageList: [],

				//弹幕定时器
				barrageTimer: null

			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		onLoad({
			iv
		}) {
			// #ifdef H5
			iv && uni.setStorageSync('iv', iv);
			// #endif
			
			// #ifdef MP-WEIXIN
			let pages = getCurrentPages();
			let currentPage = pages[pages.length-1];
			let options = currentPage.options;
			if(options.q){
				let url = options.q;
				let iv = decodeURIComponent(url).split('?')[1].replace('iv=','');
				uni.setStorageSync('iv', iv);
			}
			// #endif
		},
		onShow() {
			if (uni.getStorageSync('userInfo')) {
				if (uni.getStorageSync('userInfo').configs.bullet) {
					this.getBarrage()
					this.startBarrage();
				}else{
					clearInterval(this.barrageTimer);
					this.$refs.barrage.close();
				}
			} else {
				this.getBarrage()
				this.startBarrage();
			}
		},
		onHide() {
			// #ifdef MP-WEIXIN
			clearInterval(this.barrageTimer);
			this.$refs.barrage.end();
			// #endif
			// #ifdef H5
			clearInterval(this.barrageTimer);
			this.$refs.barrage.close();
			// #endif
		},
		onUnload() {
			clearInterval(this.barrageTimer);
			this.$refs.barrage.close();
		},
		onReachBottom() {
			if (!this.listLock) {
				this.getList();
			}
		},
		async onPullDownRefresh() {
			try {
				this.page = 1;
				this.listLock = false,
				this.getBanner();
				await this.getList();
				uni.stopPullDownRefresh();
			} catch (err) {
				console.log('下拉刷新错误：'+err);
			}
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取弹幕
			 * ****************************************************************************************************
			 */
			getBarrage() {
				this.$RQST({
					url: `${this.$API}/home/bullet`,
					data: {
						type: 1
					},
					loading: false,
				}).then((res) => {
					this.$refs.barrage.end();
					this.$refs.barrage.start(res);
				}).catch(err => {
					console.log(err)
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 开启弹幕定时器
			 * ****************************************************************************************************
			 */
			startBarrage() {
				this.barrageTimer = setInterval(() => {
					this.getBarrage();
				}, 30000)
			},

			/**
			 * ****************************************************************************************************
			 * @description 跳转到其他页面
			 * @param {json} item 当前点击nav对应数据
			 * ****************************************************************************************************
			 */
			toPage(item) {
				if (item.path) {
					uni.navigateTo({
						url: item.path
					})
				} else {
					// #ifdef H5
					uni.navigateTo({
						url: '/pages/webView/webView?src=https://m.modian.com/unihd/pages/detail/index?id=34'
					})
					// #endif

					// #ifdef MP-WEIXIN
					uni.navigateToMiniProgram({
						appId: 'wx1a3af9f1e4466abc',
						path: 'pages/detail/index?id=34',
						extraData:{
							'platform_program':'toijoi'
						},
						success(res) {
							console.log('打开成功')
						}
					})
					// #endif

				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取banner
			 * ****************************************************************************************************
			 */
			getBanner() {
				this.$RQST({
					url: `${this.$API}/banner`,
					data: {
						type: 1
					}
				}).then((res) => {
					this.bannerList = [...res];
				}).catch(err => {
					console.log(err)
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 点击banner跳转
			 * @param {number} is_jump  是否支持跳转(1:是;2:否)
			 * @param {number} jump_cat  跳转类型(1:抽盒机商品;2:盲盒系列商品;3:小程序地址;4:H5)
			 * @param {string} project_no  商品编号
			 * @param {number} app_type  小程序(1:内部小程序;2:外部小程序;)
			 * @param {string} app_id  跳转外部小程序的appId
			 * @param {string} app_url  小程序跳转地址
			 * @param {string} h5_url  h5跳转地址
			 * ****************************************************************************************************
			 */
			bannerLink({
				is_jump,
				jump_cat,
				project_no,
				app_type,
				app_id,
				app_h5_url,
				app_url,
				h5_url
			}) {

				if (is_jump == 1) {
					switch (jump_cat) {
						case 1:
							uni.navigateTo({
								url: `/pages/lottery/lottery?id=${project_no}`
							})
							break;
						case 2:
							uni.navigateTo({
								url: `/pages/shoppingView/shoppingView?id=${project_no}&type=1`
							})
							break;
						case 3:
							uni.navigateTo({
								url: `/pages/shoppingView/shoppingView?id=${project_no}&type=2`
							})
							break;
						case 4:
							if (app_type == 1) {
								uni.navigateTo({
									url: app_url
								})
							} else {
								// #ifdef H5
								uni.navigateTo({
									url: `/pages/webView/webView?src=${app_h5_url}`
								})
								// #endif

								// #ifdef MP-WEIXIN
								uni.navigateToMiniProgram({

									appId: app_id,
									envVersion: {
										'data1': 'develop'
									},
									success(res) {
										console.log('打开成功')
									}
								})
								// #endif
							}
							break;
						case 5:
							uni.navigateTo({
								url: `/pages/webView/webView?src=${h5_url}`
							})
							break;
					}
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取系列列表
			 * ****************************************************************************************************
			 */
			getList() {
				return new Promise((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/serieslist`,
						data: {
							size: this.size,
							page: this.page
						}
					}).then((res) => {
						if (res.length > 0) {
							if(this.page==1){
								this.productList = [...res];
							}else{
								this.productList = this.productList.concat(res);
							}
							
						} else {
							this.listLock = true;
						}
						this.page++;
						resolve(res)
					}).catch(err => {
						console.log(err)
						reject(err)
					})
				})
				
			},


		},
		mounted() {
			this.getBanner();
			this.getList()

		}
	}
</script>

<style lang="scss">
	/* banner */
	.banner {
		width: 100%;
		height: 246rpx;

		image {
			width: 100%;
			height: 100%;
			border-radius: $radius-30;
		}

	}


	/* nav */
	.nav {
		// height: 146rpx;
		display: flex;

		.nav-item {
			width: 25%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;

			.icon {
				width: 60rpx;
				height: 60rpx;
			}

			.text {
				margin-top: 20rpx;
			}

		}

	}

	/* product */
	.product {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;

		.product-item {
			width: calc(50% - 10rpx);
			position: relative;
			margin-top: 20rpx;
			overflow: hidden;
			border-radius: $radius-30;

			&:nth-child(-n+2) {
				margin-top: 0;
			}

			image {
				width: 100%;
				height: 350rpx;
			}

			.state {
				width: 80rpx;
				height: 80rpx;
				position: absolute;
				right: 0;
				top: 0;
				z-index: 1;
			}

			.text {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				background-color: $cl-white;

				.title {
					line-height: 1.5;
					flex: 1;
					overflow: hidden;

					view {
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}

				}

				.price {
					font-size: $fs-24;
					padding: 10rpx 20rpx;
					border-radius: 20rpx;
					background-color: $cl-main;
					color: #fff;
					font-weight: bold;

					text {
						font-size: $fs-32;
					}

				}
			}



		}
	}

	.no-more {
		text-align: center;
		font-size: $fs-24;
		color: $cl-gray3;
		padding: 20rpx 0;
	}
</style>
