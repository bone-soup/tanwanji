<template>
	<!-- 协议开始 -->
	<view class="content">
		<rich-text :nodes="content"></rich-text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				content:``
			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
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
		methods: {
			// 请求协议数据
			requestData:function () {
				return new Promise((resolve,reject)=>{
					const that = this;
					this.$RQST({
						url: `${this.$API}/moduledetail`,
						data:{
							tables:'userCenterUseRules'
						}
					}).then((res) => {
						console.log(res);
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
</style>
