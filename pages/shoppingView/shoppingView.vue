<template>
	<view class="content">

		<!-- banner -->
		<image class="banner" :src="product.detail_header" mode="aspectFill"></image>

		<!-- shoppingView start -->
		<view class="shoppingView">
			<view class="title-wrap">
				<view class="title">{{name}}</view>
				<view class="nums-wrap">
					<view class="nums">销量: {{product.sales_num}}</view>
					<view class="price">￥ {{product.price}}</view>
				</view>
			</view>
			<!-- <image class="detail" :src="product.detail_introduce" mode="widthFix"></image> -->
			<rich-text class="richText" :nodes="product.introduce"></rich-text>
		</view>
		<!-- shoppingView end -->

		<!-- buy -->
		<button class="buy" @click="toBuy">立即购买</button>
		<buy ref="buy"></buy>

	</view>
</template>

<script>
	import buy from '@/components/buy/buy.vue'
	export default {
		components: {
			buy
		},
		data() {
			return {
				//总称
				name: '',
				//商品id
				id: '',

				//商品类型
				type: '',

				//商品
				product: {
					sales_num: 0,
					price: 0,
				},

				//端盒
				whole: {},

				//包邮说明
				packageSettings: {
					num: 0,
					postage: 0
				}

			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.product.detail_header,
			}
		},
		onLoad({
			id,
			type
		}) {
			this.id = id;
			this.type = type;
		},
		onPullDownRefresh(){
			this.getDetail();
			this.getShipping();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 立即购买
			 * ****************************************************************************************************
			 */
			toBuy() {
				if (uni.getStorageSync('token')) {
					if (this.product.total_stock > 0) {
						this.$refs.buy.open(this.product, this.packageSettings, this.whole, this.$store.getters.getName);
					} else {
						uni.showToast({
							title: '库存不足',
							icon: 'none'
						})
					}
				} else {
					uni.showModal({
						title: '未登录',
						content: '登录后可进行下一步操作',
						success(res) {
							if (res.confirm) {
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							}
						}
					})
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取商品详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				this.$RQST({
					url: `${this.$API}/shop/detail`,
					data: {
						id: this.id,
						type: this.type
					}
				}).then((res) => {
					let singleItem = res.detail;
					let boxItem = res.whole;
					singleItem.introduce = res.detail.introduce && res.detail.introduce.replace(/(\<img|\<p|\<span)/gi,($0, $1)=>{
						return {
							"<img": '<img style="max-width:100%;display:block;margin:0 auto;" ',
							"<p": '<p style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
							"<span": '<span style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
						}[$1];
					})
					boxItem.introduce = res.whole.introduce && res.whole.introduce.replace(/(\<img|\<p|\<span)/gi,($0, $1)=>{
						return {
							"<img": '<img style="max-width:100%;display:block;margin:0 auto;" ',
							"<p": '<p style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
							"<span": '<span style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
						}[$1];
					})
					this.product = singleItem;
					this.whole = boxItem;
					this.$store.commit('changeName', this.product.name + this.product.abbreviation);
					this.$store.commit('changeTitle', this.product.abbreviation);
					uni.setNavigationBarTitle({
						title: this.$store.state.titleName
					});
					this.name = this.$store.state.titleName;
				}).catch(err => {
					console.log(err)
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取包邮说明
			 * ****************************************************************************************************
			 */
			getShipping() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/moduledetail`,
						data: {
							tables: 'packageSettings'
						}
					}).then(({
						values
					}) => {
						this.packageSettings = values;
						resolve({
							values
						})
					}).catch(err => {
						console.log(err)
					})
				})
			},
		},
		mounted() {
			this.getDetail();
			this.getShipping();
		}
	}
</script>

<style lang="scss">
	// content
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	// banner
	.banner {
		width: 100%;
		height: 750rpx;
	}

	// shoppingView
	.shoppingView {
		width: 710rpx;
		margin-top: -60rpx;
		background-color: $cl-white;
		border-top-left-radius: $radius-30;
		border-top-right-radius: $radius-30;
		z-index: 1;
		margin-bottom: 120rpx;

		img {
			width: 100%;
		}

		.title-wrap {
			padding: 40rpx;

			.title {
				font-size: $fs-32;
				font-family: phM;
			}
		}

		.nums-wrap {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 20rpx;

			.nums {
				font-size: $fs-24;
				font-family: phM;
				color: $cl-gray3;
			}

			.price {
				font-size: $fs-32;
				font-family: phM;
				color: $cl-red;
			}
		}

		.detail {
			width: 100%;
		}
	}

	// buy
	.buy {
		width: 100%;
		height: 100rpx;
		border-radius: 0;
		position: fixed;
		left: 0;
		bottom: 0;
		z-index: 1;
	}
</style>
