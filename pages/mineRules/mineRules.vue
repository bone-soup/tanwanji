<template>
	<!-- 规则开始 -->
	<view class="content">
		<rich-text :nodes="content"></rich-text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				content:''
			}
		},
		onLoad() {
			this.requestData();
		},
		async onPullDownRefresh() {
			try {
				await this.requestData();
				uni.stopPullDownRefresh();
			} catch (err) {
				console.log('错误'+err);
			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		methods: {
			// 请求规则数据
			requestData:function () {
				return new Promise((resolve,reject)=>{
					const that = this;
					this.$RQST({
						url: `${this.$API}/moduledetail`,
						data:{
							tables:'userCenterRules'
						}
					}).then((res) => {
						console.log(res.values);
						that.content = res.values.content;
						resolve(res);
					}).catch((err) => {
						console.log(err);
						reject(err);
					})
				})
			}
		},
	}
</script>

<style>
	.content{
		padding: 38rpx;
		font-size: 26rpx;
		color: #525252;
		line-height: 1.3;
	}
	.content .hr{
		height: 5rpx!important;
		background: #00CDA4!important;
		color: #00CDA4!important;
		margin:20rpx 0 20rpx;
		border: none;
	}
</style>
