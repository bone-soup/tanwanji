<template>
	<view class="content">

		<!-- banner start -->
		<view class="module">
			<swiper class="banner" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
				<swiper-item v-for="(item,index) in bannerList" :key="index">
					<image :src="item.img" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</view>
		<!-- banner end -->

		<!-- main-content start -->
		<view class="module">
			<view class="main-content">
				<view class="title">本周已签到<text>{{days}}</text>天</view>
				<view class="sub-title">{{tips}}</view>
				<view class="list">
					<view class="item" v-for="(item,index) in list" :key="index">
						<view class="special" v-if="item.gift==true">{{index==2?'神秘礼包':'满签礼包'}}</view>
						<view :class="['icon',{'active':index<days}]">
							<text v-if="!item.gift">积分\n+{{item.point}}</text>
							<image v-if="item.gift" :src="index==2?(index<days?gifta:giftag):(index<days?giftb:giftbg)" mode=""></image>
						</view>
						<view class="text">{{item.date}}</view>
					</view>
				</view>
				<button type="button" class="sign-in" :disabled="signined" @click="signIn">签到</button>
				<view class="rules" @click="rulesShow">签到规则</view>
			</view>
		</view>
		<!-- main-content end -->

		<!-- rules -->
		<toast ref="rules"></toast>

		<!-- signIn -->
		<signIn ref="signIn" :imgSrc="pic"></signIn>
	</view>
</template>

<script>
	import toast from '@/components/toast/toast'
	import signIn from '@/components/signIn/signIn'
	export default {
		components: {
			toast,
			signIn
		},
		data() {
			return {
				//banner
				bannerList: [{
					img: `${this.$PNG}/signIn.png`,
				}],

				//累计签到天数
				days: 0,

				//签到介绍
				tips: '连续签到3天/7天即可召唤神秘礼包',

				//已签到
				signined: false,
				
				gifta: '/static/images/gifta.png',					// 签到icona
				giftag: '/static/images/giftag.png',					// 签到icona
				giftb: '/static/images/giftb.png',					// 签到iconb
				giftbg: '/static/images/giftbg.png',					// 签到iconb

				//签到详情
				list: [],
				pic:'',							// 提示图片
				signKey:true,				// 签到开关

			// 签到规则
			rules: ''
		}
	},
	onShareAppMessage() {
		return {
			title: this.$store.state.shareTitle,
			path: this.$store.state.sharePath,
			imageUrl: this.bannerList[0].img,
		}
	},
	onPullDownRefresh() {
		this.getModuleRules();
		if(uni.getStorageSync('token')){
			this.getModuleDetail();
		}
		setTimeout(()=>{
			uni.stopPullDownRefresh();
		},1200);
	},
	methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取签到详情
			 * ****************************************************************************************************
			 */
			getModuleDetail() {
				this.$RQST({
					url: `${this.$API}/home/sign`
				}).then(({
					date_no,
					tips,
					lists,
					status
				}) => {
					this.days = date_no;
					this.tips = tips;
					this.list = lists;
					this.signined = status;
					if (this.signKey) {
						this.pic = lists[date_no].picture;
					}
					this.signKey = this.pic?false:true
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取签到规则
			 * ****************************************************************************************************
			 */
			getModuleRules() {
				this.$RQST({
					url: `${this.$API}/moduledetail`,
					data: {
						tables: 'signRule'
					}
				}).then((res) => {
					this.rules = res.values.content;
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 签到
			 * ****************************************************************************************************
			 */
			signIn() {
				this.$RQST({
					url: `${this.$API}/home/sign/submit`
				}).then((res) => {
					this.signKey = false;
					this.$refs.signIn.open(res.point);
					this.getModuleDetail();
				}).catch((err)=>{
					console.log(err);
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 打开规则
			 * ****************************************************************************************************
			 */
			rulesShow() {
				this.$refs.rules.open({
					title: '签到规则',
					desc: this.rules
				})
			}
		},
		mounted() {
			this.getModuleRules();
			if(uni.getStorageSync('token')){
				this.getModuleDetail();
			}
		}
	}
</script>

<style lang="scss">
	/* banner */
	.banner {
		width: 100%;
		height: 304rpx;
		border-radius: $radius-30;

		image {
			width: 100%;
			height: 100%;
		}
	}

	/* main-content */
	.main-content {
		border-radius: $radius-30;
		background-color: $cl-white;
		padding: 70rpx 38rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.title {
			font-size: $fs-32;

			text {
				color: $cl-red;
			}
		}

		.sub-title {
			color: $cl-gray2;
			margin-top: 20rpx;
		}

		.list {
			width: 100%;
			display: flex;
			justify-content: space-between;
			margin-top: 150rpx;

			.item {
				position: relative;

				.text {
					font-size: $fs-24;
					color: $cl-gray3;
					text-align: center;
					margin-top: 22rpx;
				}

				.special {
					width: 136rpx;
					height: 50rpx;
					border-radius: 25rpx;
					background-color: $cl-main2;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: $fs-24;
					position: absolute;
					left: 50%;
					top: -70rpx;
					transform: translate(-50%, 0);
					font-family: phM;

					&::after {
						content: '';
						width: 0;
						height: 0;
						border-style: solid;
						border-width: 5rpx;
						border-color: transparent transparent $cl-main2 $cl-main2;
						position: absolute;
						left: 50%;
						bottom: 0;
						transform: translate(-50%, 50%) rotate(-45deg);
					}
				}

				.icon {
					width: 82rpx;
					height: 150rpx;
					background: #f7f7f7;
					border-radius: 13rpx;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24rpx;
					color: #888888;
					image{
						width: 44rpx;
						height: 44rpx;
					}
					&.active {
						background: $cl-main;
						color: #FFFFFF;
						// &::before {
						// 	background-color: $cl-white;
						// }
					}
					// &::before {
					// 	content: '';
					// 	width: 10rpx;
					// 	height: 10rpx;
					// 	border-radius: 50%;
					// 	background-color: $cl-main;
					// 	position: absolute;
					// 	left: 50%;
					// 	top: 8rpx;
					// 	transform: translate(-50%, 0);
					// }
				}
			}
		}

		.sign-in {
			width: 288rpx;
			height: 100rpx;
			border-radius: 50rpx;
			font-size: $fs-32;
			margin-top: 96rpx;

			&[disabled] {
				background-color: $cl-gray2;
			}
		}

		.rules {
			font-size: $fs-24;
			color: $cl-gray3;
			text-decoration: underline;
			margin-top: 70rpx;
		}

	}
</style>
