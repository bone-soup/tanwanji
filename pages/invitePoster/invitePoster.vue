<template>
	<view class="content">

		<view class="container">
			<!-- poster start -->
			<!-- <canvas canvas-id="ewm" class="ewm"></canvas> -->
			<canvas canvas-id="poster" class="canvasBox"></canvas>
			<!-- #ifdef H5 -->
			<image class="poster" :src="poster" mode="aspectFill"></image>
			<!-- #endif -->
		</view>
		<!-- #ifdef MP-WEIXIN -->
		<button type="button" @click="downloadPoster">保存至相册</button>
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<button type="button">长按海报保存到相册</button>
		<!-- #endif -->
	</view>
</template>

<script>
	import uQRCode from '@/assets/uqrcode.js'
	import util from '@/assets/util.js'
	export default {
		data() {
			return {
				title1: '潮玩地带',
				title2: '有福同享',
				desc1: '我是无幻',
				desc2: '送你一份大礼包，一起玩才最潮',
				poster: '',
				qrcode:'',
				imgBg:'/static/images/inviteBg.png',
			}
		},
		onLoad({qrcode}) {
			const that = this;
			this.desc1 = `我是${uni.getStorageSync('userInfo').name}`
			this.qrcode = uni.getStorageSync('qrCode');
			this.createPoster();
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 初始化二维码
			 * ****************************************************************************************************
			 */
			// initCode() {
			// 	uni.showLoading({
			// 		title: '正在生成海报'
			// 	})
			// 	uQRCode.make({
			// 		canvasId: 'ewm',
			// 		componentInstance: this,
			// 		text: url,
			// 		size: util.SystemInfo.screenWidth / 375 * 132,
			// 		margin: 0,
			// 		backgroundColor: '#ffffff',
			// 		foregroundColor: '#000000',
			// 		fileType: 'jpg',
			// 		correctLevel: uQRCode.defaults.correctLevel,
			// 		success: res => {
			// 			this.createPoster();
			// 		}
			// 	})
			// },
			/**
			 * ****************************************************************************************************
			 * @description 下载二维码
			 * ****************************************************************************************************
			 */
			downloadPoster() {

				// #ifdef MP-WEIXIN

				//判断是否已经授权
				uni.getSetting({
					success: (res) => {
						//已授权
						if (res.authSetting['scope.writePhotosAlbum'] == true) {
							uni.showModal({
								title: '保存之相册',
								content: '是否要将海报保存至相册',
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
				let pt = util.SystemInfo.screenWidth / 750;
				let pr = util.SystemInfo.pixelRatio;
				let w = 550 * pt;
				let h = 800 * pt;
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: w,
					height: h,
					// destWidth: w * pr,
					// destHeight: h * pr,
					destWidth: 792,
					destHeight: 1152,
					canvasId: 'poster',
					quality:1,
					success: res => {
						// #ifdef H5
						this.poster = res.tempFilePath;
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
							title:'保存成功'
						})
					}
				})

			},
			/**
			 * ****************************************************************************************************
			 * @description 保存至相册
			 * @param {string} file  文件临时路径
			 * ****************************************************************************************************
			 */
			createPoster() {
				const that = this;
				let pt = util.SystemInfo.screenWidth / 750;
				let pr = util.SystemInfo.pixelRatio;
				// let color = '#00CDA4';
				// let color2 = '#353535';
				let x = 0;
				let y = 0;
				let w = 550 * pt;
				let h = 800 * pt;
				let r = 15;
				let ctx = uni.createCanvasContext('poster');

				//开始绘制
				// ctx.beginPath()

				// 因为边缘描边存在锯齿，最好指定使用 transparent 填充
				// ctx.setFillStyle('transparent')

				// 左上角
				// ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

				// 右上角
				// ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

				// 右下角
				// ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

				// 左下角
				// ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

				// 剪切
				// ctx.clip()
				// ctx.setFillStyle('#ffffff')
				// ctx.closePath()
				// ctx.fillRect(0, 0, w, h)

				//添加标题
				// #ifdef MP-WEIXIN
				// ctx.setFontSize(64 * pt)
				// #endif
				// #ifdef H5
				// if (this.$util.SystemInfo.model=='iPhone'){
				// 	ctx.setFontSize(64 * pt)
				// }else{
				// 	ctx.setFontSize(64 * pt*pr)
				// }
				// #endif
			
				// ctx.setFillStyle(color)
				// ctx.fillText(this.title1, 48 * pt, 150 * pt)
				// ctx.fillText(this.title2, 48 * pt, 230 * pt)

				//添加线
				// ctx.fillRect(48 * pt, 260 * pt, 28 * pt, 11 * pt)

				//添加描述
				// #ifdef MP-WEIXIN
				// ctx.setFontSize(24 * pt)
				// #endif
				
				// #ifdef H5
				// if (this.$util.SystemInfo.model=='iPhone'){
				// 	ctx.setFontSize(24 * pt)
				// }else{
				// 	ctx.setFontSize(24 * pt*pr)
				// }
				// #endif
				// ctx.setFillStyle(color2)
				// ctx.fillText(this.desc1, 48 * pt, 340 * pt)
				// ctx.fillText(this.desc2, 48 * pt, 380 * pt)

				//添加修饰
				// ctx.drawImage('/static/images/invite-poster-img.png', 492 * pt, 100 * pt, 10 * pt, 220 * pt)
				// let bg = this.getImageInfo({ imgSrc: `https://toijoi-box.modian.com/20200619172233.png` }); //头像图
				uni.showLoading({
					icon:'none',
					title:'海报生成中'
				})
				let bg = this.imgBg; 
				ctx.drawImage(bg, 0, 0, w, h);
				ctx.draw(false,()=>{
					ctx.drawImage(this.qrcode, 85 * pt, 610 * pt, 140 * pt, 140 * pt);
					ctx.draw(true);
					setTimeout(()=>{
						let pt = util.SystemInfo.screenWidth / 750;
						let pr = util.SystemInfo.pixelRatio;
						let w = 550 * pt;
						let h = 768 * pt;
						uni.canvasToTempFilePath({
							x: 0,
							y: 0,
							width: w,
							height: h,
							// destWidth: w * pr,
							// destHeight: h * pr,
							destWidth: 792,
							destHeight: 1152,
							canvasId: 'poster',
							quality:1,
							success: res => {
								// #ifdef H5
								this.poster = res.tempFilePath;
								// #endif
								uni.hideLoading();
							},
							fail:err =>{
								uni.showModal({
									title:'错误',
									content:'err'
								})
								uni.hideLoading();
							}
						})
					},1000)
				});

				uni.hideLoading();
				
			},
			
			// getImageInfo({ imgSrc }) {
			// 	return new Promise((resolve, errs) => {
			// 			uni.getImageInfo({
			// 					src: imgSrc,
			// 					success: function(image) {
			// 							resolve(image);
			// 					},
			// 					fail(err) {
			// 							errs(err);
			// 					}
			// 			});
			// 	});
			// }
		}
	}
</script>

<style lang="scss">
	// page
	page {
		background-color: $cl-main;
	}

	// content
	.content {
		padding: 112rpx 100rpx;
	}

	.container {
		width: 550rpx;
		height: 800rpx;
		position: relative;
	}

	canvas {
		width: 264rpx;
		height:264rpx;
	}
	
	.canvasBox{
		width: 550rpx;
		height:800rpx;
	}

	.poster {
		width: 550rpx;
		height:800rpx;
		position: absolute;
		left: 0;
		top: 0;
	}

	.ewm {
		position: fixed;
		left: -1000%;
		opacity: 0;
	}


	button {
		width: 100%;
		height: 96rpx;
		background-color: $cl-white;
		border-radius: 48rpx;
		color: $cl-main;
		margin-top: 75rpx;
	}

	.button-hover {
		background-color: rgba($color: $cl-white, $alpha: .9);
	}
</style>
