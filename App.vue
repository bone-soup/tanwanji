<script>
	export default {
		onLaunch: function() {
		},
		onShow: function() {
			console.log('App Show');
			this.$store.commit('createMusic');
		},
		onHide: function() {
			console.log('App Hide')
			this.$store.commit('closeMusic');
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	// @font-face {
	// 	font-family: phH;
	// 	src: url(http://q9y6apjl5.bkt.clouddn.com/miniProgram/Alibaba-PuHuiTi-Heavy.ttf);
	// }

	// @font-face {
	// 	font-family: phM;
	// 	src: url(http://q9y6apjl5.bkt.clouddn.com/miniProgram/Alibaba-PuHuiTi-Medium.ttf);
	// }

	// @font-face {
	// 	font-family: phR;
	// 	src: url(http://q9y6apjl5.bkt.clouddn.com/miniProgram/Alibaba-PuHuiTi-Regular.ttf);
	// }

	view {
		box-sizing: border-box;
	}

	* {
		box-sizing: border-box;
	}

	page {
		background-color: #f1f1f1;
		// font-family: phR;
		font-size: $fs-26;
		color: $cl-black;
		line-height: 1;
		box-sizing: border-box;
	}

	.content {
		position: relative;
		overflow: hidden;
	}

	image {
		max-width: 100%;
		vertical-align: middle;
		box-sizing: border-box;
	}

	.placeholder {
		font-size: $fs-26;
		color: $cl-gray1;
	}

	input {
		font-size: 28rpx;
		color: $cl-black;
		box-sizing: border-box;
	}

	.uni-picker-container .uni-picker-item {
		font-size: $fs-26;
	}

	.module {
		padding: 0 20rpx;
		margin: 20rpx 0;
	}

	button {
		background-color: $cl-main;
		color: #fff;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		font-size: $fs-32;
		box-sizing: border-box;
	}

	button::after {
		display: none;
	}

	.button-hover {
		background-color: $cl-main3;
		color: $cl-white;
	}

	uni-modal .uni-modal {
		border-radius: $radius-30;
	}

	/* #ifdef H5 */
	uni-page-head {
		display: none;
	}
	uni-page-wrapper{
		height: 100%!important;
	}

	/* #endif */
	img{max-width: 100%;}
	rich-text   .rich-img {
	
	width: 100% ;
	
	height: auto ;
	
	}
	.no-data{width: 100%;text-align: center;color: #cccccc;font-size: 36rpx;margin: 50rpx 0;}
	.all-data{width: 100%;text-align: center;color: #D9D9D9;font-size: 30rpx;margin: 50rpx 0;}
</style>
