<template>
	<view class="content">

		<!-- ewmWrap start -->
		<view class="module-1">
			<view class="ewm-wrap">
				<view class="title">推荐好友领福利</view>
				<view class="sub-title">专属邀请二维码</view>
				<view class="ewm-content">
					<canvas class="ewm" canvas-id="qrcode" @longtap="downloadEwm" />
					<!-- #ifdef H5 -->
					<image class="ewm" :src="ewmImg" mode="aspectFill"></image>
					<!-- #endif -->
				</view>

				<button type="button" @click="toInvitePoster">生成邀请海报</button>
				<view class="remarks">*长按可单独保存二维码</view>
			</view>
		</view>
		<!-- ewmWrap end -->

		<!-- details start -->
		<view class="module">
			<view class="details">
				<view class="title">我的邀请</view>
				<view class="nums-wrap">
					<view class="nums">
						<view class="item">
							<view class="text">成功邀请 (人）</view>
							<view class="num">{{userNums}}</view>
						</view>
						<view class="item">
							<view class="text">积分奖励</view>
							<view class="num">{{integral}}</view>
						</view>
					</view>
				</view>
				<view class="desc-wrap">
					<view class="desc-title">邀请规则</view>
					<view class="desc" v-html="rules"></view>
				</view>
			</view>
		</view>
		<!-- details end -->
	</view>
</template>

<script>
	import uQRCode from '@/assets/uqrcode.js'
	export default {
		data() {
			return {
				//邀请规则
				rules: '',

				//详情
				detail: null,

				// 邀请用户
				userNums: 0,

				// 邀请积分
				integral: 0,

				//二维码
				ewmImg: '',
				
				//二维码链接
				qrcode:''
			}
		},
		onPullDownRefresh() {
			if(uni.getStorageSync('token')){				this.getInvite();			}			this.getRules();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000);
		},
		methods: {

			/**
			 * ****************************************************************************************************
			 * @description 获取邀请规则
			 * ****************************************************************************************************
			 */
			getRules() {
				this.$RQST({
					url: `${this.$API}/moduledetail`,
					data: {
						tables: 'invitationRules'
					}
				}).then(({
					values
				}) => {
					this.rules = values.content;
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取邀请信息
			 * ****************************************************************************************************
			 */
			getInvite() {
				this.$RQST({
					url: `${this.$API}/home/invite`
				}).then(({
					qr_url,
					users,
					point
				}) => {
					console.log(qr_url)
					this.initCode(qr_url);
					this.qrcode = qr_url;
					this.userNums = users;
					this.integral = point;
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 初始化二维码
			 * @param {text} url  二维码链接
			 * ****************************************************************************************************
			 */
			initCode(url) {
				uQRCode.make({
					canvasId: 'qrcode',
					componentInstance: this,
					text: url,
					size: this.$util.SystemInfo.windowWidth / 375 * 165,
					margin: 10,
					backgroundColor: '#ffffff',
					foregroundColor: '#000000',
					fileType: 'jpg',
					correctLevel: uQRCode.defaults.correctLevel,
					success: res => {
						// #ifdef H5
						this.createImg();
						// #endif
						uni.canvasToTempFilePath({
							x: 0,
							y: 0,
							width: this.$util.SystemInfo.windowWidth / 375 * 165,
							height: this.$util.SystemInfo.windowWidth / 375 * 165,
							destWidth: this.$util.SystemInfo.windowWidth / 375 * 165,
							destHeight: this.$util.SystemInfo.windowWidth / 375 * 165,
							canvasId: 'qrcode',
							success: res => {
								uni.setStorageSync('qrCode',res.tempFilePath);
							}
						})
					}
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 下载二维码
			 * ****************************************************************************************************
			 */
			downloadEwm() {

				// #ifdef MP-WEIXIN

				//判断是否已经授权
				uni.getSetting({
					success: (res) => {
						//已授权
						if (res.authSetting['scope.writePhotosAlbum'] == true) {
							uni.showModal({
								title: '保存二维码',
								content: '是否要将二维码保存至相册',
								success: res => {
									if (res.confirm) {
										this.createImg();
									}
								},
								fail: err => {
									console.log(err)
								}
							})
						}
						//拒绝授权
						else if (res.authSetting['scope.writePhotosAlbum'] == false) {
							uni.showModal({
								title: '您已拒绝授权',
								content: '是否重新开始授权',
								success: res => {
									uni.openSetting({
										success: (res) => {
											this.createImg();
										}
									})
								}
							})
						}
						//未授权
						else {
							this.createImg();
						}
					}
				})
				// #endif

			},
			/**
			 * ****************************************************************************************************
			 * @description 生成图片
			 * ****************************************************************************************************
			 */
			createImg() {

				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: this.$util.SystemInfo.windowWidth / 375 * 165,
					height: this.$util.SystemInfo.windowWidth / 375 * 165,
					destWidth: this.$util.SystemInfo.windowWidth / 375 * 165,
					destHeight: this.$util.SystemInfo.windowWidth / 375 * 165,
					canvasId: 'qrcode',
					success: res => {
						// #ifdef H5
						this.ewmImg = res.tempFilePath;
						// #endif

						// #ifdef MP-WEIXIN
						this.save(res.tempFilePath);
						// #endif
					}
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 保存至相册
			 * @param {string} file  文件临时路径
			 * ****************************************************************************************************
			 */
			save(file) {

				uni.saveImageToPhotosAlbum({
					filePath: file,
					success: res => {
						uni.showToast({
							title: '保存成功'
						})
					}
				})

			},
			/**
			 * ****************************************************************************************************
			 * @description 前往生成海报页面
			 * ****************************************************************************************************
			 */
			toInvitePoster() {
				if(uni.getStorageSync('token')){
					uni.navigateTo({
						url: `/pages/invitePoster/invitePoster?qrcode=${this.qrcode}`
					})
				}else{
					uni.showModal({
						title: '未登录',
						content: '登录后可进行下一步操作',
						success(res) {
							if(res.confirm){
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							}
						}
					})
				}
			}
		},
		mounted() {
			if(uni.getStorageSync('token')){
				this.getInvite();
			}
			this.getRules();
		}
	}
</script>

<style lang="scss">
	// page
	page {
		background-color: $cl-main;
	}

	// module
	.module-1 {
		padding: 0 70rpx;
		margin: 70rpx 0;
	}

	// ewm-wrap
	.ewm-wrap {
		border-radius: $radius-30;
		background-color: #fff;
		padding: 70rpx 0 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.title {
			font-size: $fs-56;
			font-family: phM;
			color: $cl-main;
		}

		.sub-title {
			font-size: $fs-24;
			color: $cl-gray3;
			margin-top: 28rpx;
		}

		.ewm-content {
			width: 330rpx;
			height: 330rpx;
			margin-top: 60rpx;
			position: relative;
		}

		.ewm {
			width: 330rpx;
			height: 330rpx;
			position: absolute;
			left: 0;
			top: 0;
		}

		button {
			width: 304rpx;
			height: 100rpx;
			border-radius: 50rpx;
			margin-top: 40rpx;
			font-size: $fs-32;
		}

		.remarks {
			font-size: $fs-24;
			color: $cl-gray3;
			margin-top: 20rpx;
		}
	}

	// details
	.details {
		border-radius: $radius-30;
		background-color: #fff;
		padding: 70rpx 30rpx 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;

		.title {
			font-size: $fs-32;
		}

		.nums-wrap {
			width: 100%;
			margin-top: 66rpx;
			padding: 0 50rpx;

			.nums {
				display: flex;
				justify-content: space-between;
				text-align: center;
				border-bottom: 2rpx solid rgba($color: $cl-gray2, $alpha: .3);
				padding-bottom: 70rpx;

				.text {
					color: $cl-gray3;
				}

				.num {
					font-size: $fs-45;
					margin-top: 28rpx;
				}
			}

		}

		.desc-wrap {
			width: 100%;
			margin-top: 40rpx;
			border: 2rpx solid $cl-main;
			padding: 50rpx;
			text-align: justify;
			border-radius: $radius-30;

			.desc-title {
				font-size: $fs-32;
				text-align: center;
			}

			.desc {
				line-height: 36rpx;
				font-size: $fs-24;
				text-align: justify;
				margin-top: 36rpx;
			}
		}
	}
</style>
