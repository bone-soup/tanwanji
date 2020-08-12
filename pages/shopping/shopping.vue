<template>
	<view class="content">

		<!-- banner start -->
		<view class="module">
			<swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
				<swiper-item v-for="(item,index) in bannerList" :key="index" @click="bannerLink(item)">
					<image :src="item.picture" mode="aspectFill" :alt="item.title"></image>
				</swiper-item>
			</swiper>
		</view>
		<!-- banner end -->

		<!-- nav-wrap start -->
		<view class="module">
			<view class="nav-wrap">
				<view class="search">
					<view class="icon">
						<image :src="searchIcon" mode="aspectFill"></image>
					</view>
					<input type="text" :value="keyword" confirm-type="search" @input="changeKeyword" @confirm="search" />
				</view>
				<!-- <view class="nav">
					<view :class="['item',{'active':currentNav==item.id}]" v-for="(item,index) in navList" :key="index" @click="changeNav(item)">
						{{item.value}}
					</view>
				</view> -->
			</view>
		</view>
		<!-- nav-wrap end -->

		<!-- product start -->
		<view class="module">
			<view class="product">
				<navigator :url="`/pages/shoppingView/shoppingView?id=${item.id}&type=${item.type}&name1=${item.name}&name2=${item.abbreviation}`"
				 class="product-item" v-for="(item,index) in productList" :key="index">
					<image class="state" :src="iconNew" mode="aspectFill" v-if="item.tags==1"></image>
					<image class="state" :src="iconPrev" mode="aspectFill" v-if="item.tags==2"></image>
					<image class="state" :src="iconHot" mode="aspectFill" v-if="item.tags==3"></image>
					<image :src="item.picture" mode="aspectFill"></image>
					<view class="text">
						<view class="title">
							<!-- <view>{{item.name}}</view> -->
							<view>{{item.abbreviation}}</view>
						</view>
						<view class="price">￥<text>{{item.price}}</text></view>
					</view>
				</navigator>
			</view>
		</view>
		<!-- product end -->
		<view class="no-more" v-if="listLock">{{productList.length>0?'到底了~':'暂无商品'}}</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {

				iconNew: `${this.$PNG}/new.png`,
				iconHot: `${this.$PNG}/hot.png`,
				iconPrev: `${this.$PNG}/prev.png`,

				//关键词
				keyword: '',

				//搜索按钮
				searchIcon: `${this.$PNG}/search.png`,

				bannerList: [],

				// navList: [{
				// 		value: '全部',
				// 		id: 0
				// 	},
				// 	{
				// 		value: '盲盒',
				// 		id: 1
				// 	},
				// 	{
				// 		value: '周边',
				// 		id: 2
				// 	}
				// ],

				//当前tab
				currentNav: 0,

				//商品列表
				productList: [],

				//每页条数
				size: 10,

				//当前页
				page: 1,

				//列表请求锁
				listLock: false,

			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
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
			 * @description 获取banner
			 * ****************************************************************************************************
			 */
			getBanner() {
				this.$RQST({
					url: `${this.$API}/banner`,
					data: {
						type: 2
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
			 * @description 获取商品列表
			 * ****************************************************************************************************
			 */
			getList() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/shop`,
						data: {
							type: this.currentNav,
							keyword: this.keyword,
							size: this.size,
							page: this.page
						}
					}).then((res) => {
						if (res.length > 0) {
							if (this.page == 1) {
								this.productList = [...res];
							} else {
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

			/**
			 * ****************************************************************************************************
			 * @description 改变关键词
			 * ****************************************************************************************************
			 */
			changeKeyword(e) {
				this.keyword = e.detail.value;
				!e.detail.value && this.search()
			},

			/**
			 * ****************************************************************************************************
			 * @description 改变nav
			 * @param {json} item 当前点击nav对应数据
			 * ****************************************************************************************************
			 */
			changeNav(item) {
				this.currentNav = item.id;
				this.productList = [];
				this.page = 1;
				this.listLock = false;
				this.getList();
			},

			/**
			 * ****************************************************************************************************
			 * @description 搜索
			 * ****************************************************************************************************
			 */
			search() {
				this.productList = [];
				this.page = 1;
				this.type = 0;
				this.listLock = false;
				this.getList();
			}
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
		border-radius: $radius-30;

		image {
			width: 100%;
			height: 100%;
		}

	}


	/* nav-wrap */
	.nav-wrap {
		height: 60rpx;
		margin: 20rpx 0;
		display: flex;

		.search {
			// width: 346rpx;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			background-color: $cl-white;
			border-radius: 30rpx;
			border: 2rpx solid $cl-main;

			.icon {
				width: 70rpx;
				height: 60rpx;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					width: 32rpx;
					height: 32rpx;
				}
			}

			input {
				flex: 1;
				padding-right: 1em;
				font-size: $fs-24;
			}
		}

		.nav {
			flex: 1;
			padding-left: 60rpx;
			display: flex;
			justify-content: space-between;

			.item {
				display: flex;
				justify-items: center;
				align-items: center;
				font-size: $fs-32;

				&.active {
					font-size: $fs-40;
					font-family: phM;
					border-bottom: 4rpx solid $cl-main;
				}
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
