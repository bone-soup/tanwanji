<template>
	<view class="login-box">
		<image :src="logo" mode="aspectFit"></image>
		<!-- #ifdef MP-WEIXIN -->
		<button class="login" v-if="type" open-type="getPhoneNumber" @getphonenumber="toPhone" lang="zh_CN">点击绑定手机号</button>
		<button class="login" v-else open-type="getUserInfo" @getuserinfo="toLogin" lang="zh_CN">点击登录</button>
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<button class="login" @click="toLogin">点击登录</button>
		<!-- #endif -->
		<view>
			<text>登录代表您已同意</text>
			<navigator url="/pages/mineProtocol/mineProtocol">贪玩集用户协议</navigator>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			logo: `${this.$PNG}/logo.png`,
			type:'',														// 1:获取手机号类型
		};
	},
	onLoad({ src,id,type }) {
		console.log(src,id)
		this.src = src;
		this.id = id;
		this.type = type;
	},
	methods: {
		toLogin(e) {
			const that = this;
			// #ifdef MP-WEIXIN
			if (e.detail.errMsg == "getUserInfo:ok") {
				uni.login({
					provider: 'weixin',
					success: (loginRes) => {
						this.$RQST({
							url: `${this.$API}/passport/login`,
							data: {
								code: loginRes.code,
								user: JSON.parse(e.detail.rawData)
							}
						}).then((res) => {
							this.$store.state.login = true;
							this.token = res;
							uni.setStorageSync('token',res);
							this.getUserInfo();
							uni.navigateBack({
								delta:1
							})
						})
					}
				});
			}
			// #endif
			// #ifdef H5
			window.location.href = `${this.$JUMP}/passport/h5/login?iv=${uni.getStorageSync('iv')?uni.getStorageSync('iv'):''}&ref_url=${this.src}&id=${this.id}`;
			// #endif
		},
		
		// 获取用户信息
		getUserInfo() {
			this.$RQST({
				url: `${this.$API}/users/account`
			}).then((res) => {
				this.userInfo = res;
				uni.setStorageSync('userInfo',this.userInfo)
			})
		},
		
		// 获取授权号
		toPhone(e) {
			console.log(e);
			if (e.detail.iv){
				uni.request({
					url: `${this.$API}/passport/bindingPhone`,
					header:{
						authorization:uni.getStorageSync('bindMsg').authorization,
						hash:uni.getStorageSync('bindMsg').hash
					},
					method:'POST',
					data:{
						session_key:uni.getStorageSync('bindMsg').session_key,
						iv:e.detail.iv,
						encryptedData:e.detail.encryptedData
					},
					success: (res) => {
						console.log(res)
						uni.showToast({
							title:'绑定成功',
							icon:'none',
						})
						// 缓存token
						if (res.header.authorization) {
							uni.setStorageSync('token', {
								authorization: res.header.authorization,
								hash: res.header.hash
							})
						}else{
							uni.setStorageSync('token',uni.getStorageSync('bindMsg'));
						}
						setTimeout(()=>{
							uni.reLaunch({
								url:'/pages/mine/mine'
							})
						},1000)
					},
					fail:(err)=>{
						console.log('绑定错误:'+err);
						uni.showToast({
							title:err.errMsg,
							icon:'none'
						})
					}
				});
			}else{
				uni.showToast({
					title:'绑定失败',
					icon:'none'
				})
			}
		}
	}
};
</script>

<style lang="scss">
page {
	width: 100%;
	height: 100%;
}

.login-box {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 80rpx 40rpx;
	image {
		width: 100%;
	}
	.login {
		width: 100%;
		background: $cl-main;
		color: $cl-white;
		font-size: 26rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 40rpx;
		line-height: 3;
	}
	view {
		position: fixed;
		bottom: 20rpx;
		left: 0;
		width: 100%;
		color: #d9d9d9;
		font-size: 26rpx;
		text-align: center;
		width: 100%;
		navigator{
			color: $cl-main;
			margin-left: 20rpx;
			display: inline-block;
		}
	}
}
</style>
