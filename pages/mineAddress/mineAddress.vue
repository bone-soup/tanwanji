<template>
	<!-- 我的收货地址 -->
	<view class="content">
		<view class="address-list" v-if="addressList.length>0">
			<view class="address-item" v-for="item in addressList" :key="item.id">
				<view class="selectbox" @click="selectThis(item.id)">
					<view class="select" :class="{'active':item.id==curAddress}"></view>
				</view>
				<view class="msg">
					<view>
						<view>{{item.name}}</view>
						<text>{{item.telephone}}</text>
					</view>
					<text>{{item.province}}{{item.city}}{{item.district}}{{item.address}}</text>
				</view>
				<text @click="editThis(item.id)">编辑</text>
			</view>
		</view>
		<view class="nodata-img" v-if="showPage&&addressList.length==0">
			<image :src="noData" mode=""></image>
			<text>暂无收货地址</text>
		</view>
		<!-- 底部按钮 -->
		<view class="btn-box">
			<!-- #ifdef MP-WEIXIN -->
			<view class="load" @click="addWXAddress">微信地址导入</view>
			<!-- #endif -->
			<view class="add" @click="addAddress">添加收货地址</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				noData:`${this.$PNG}/no-data.png`,			// 无数据图片
				curAddress:'',						// 当前选中地址
				addressList:[]						,// 地址列表
				showPage:false,
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
			
		},
		onShow() {
			this.requestList().then((res)=>{
				if (res.length==1&&res[0].is_default=='0') {
					this.selectThis(res[0].id)
				}
			}).catch((err)=>{
				console.log(err);
			});
		},
		onPullDownRefresh() {
			this.requestList().then((res)=>{
				if (res.length==1&&res[0].is_default=='0') {
					this.selectThis(res[0].id)
				}
			}).catch((err)=>{
				console.log(err);
			});
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		onReachBottom() {
			this.requestList();
		},
		methods: {
			// 选择此地址
			selectThis:function (e) {
				const that = this;
				that.$RQST({
					url: `${that.$API}/users/address/default`,
					data:{
						id:e
					}
				}).then((res) => {
					uni.showToast({title:'设置默认地址成功',icon:'none'})
					that.curAddress = e;
				}).catch((err) => {
					console.log(err);
				})
			},
			// 编辑此地址
			editThis:function (e) {
				uni.redirectTo({url: `/pages/mineAddressModify/mineAddressModify?id=${e}`})
			},
			// 微信导入地址
			addWXAddress:function ( ) {
				const that = this;
				uni.getSetting({
				   success(res) {
							if ( res && res.authSetting && res.authSetting.hasOwnProperty('scope.address')){
								if (res.authSetting['scope.address']) {
								  that.wxAddressStart();
								} else { 
									uni.openSetting({
										success() {
											that.wxAddressStart();
										}
									})
								}
							}else{
								that.wxAddressStart();
							}
				   }
				})
			},
			// 微信地址导入
			wxAddressStart:function () {
				const that = this;
				if ( that.addressList.length > 9 ) {
					uni.showToast({title:'最多可设置10个收货地址~',icon:'none'})
				}else{
					uni.chooseAddress({
					  success(res) {
							that.$RQST({
								url: `${that.$API}/users/address/import`,
								data:{
									userName:res.userName,
									telNumber:res.telNumber,
									provinceName:res.provinceName,
									cityName:res.cityName,
									countyName:res.countyName,
									detailInfo:res.detailInfo,
									postalCode:res.postalCode,
								}
							}).then((res) => {
								uni.showToast({
									title:'添加收获地址成功',
									icon:'none',
									success() {
										that.requestList().then((res)=>{
											console.log(res);
											if (res.length==1 && res[0].is_default=='2') {
												that.selectThis(res[0].id);
											}
										}).catch((err)=>{
											console.log(err);
										});
									}
								})
							}).catch((err) => {
								console.log(err);
							})
					  }
					})
				}
			},
			// 添加收货地址
			addAddress:function () {
				if ( this.addressList.length > 9 ) {
					console.log('a')
					uni.showToast({title:'最多可添加10个收货地址',icon:'none'})
				}else{
					console.log('b')
					uni.redirectTo({url: '/pages/mineAddressAdd/mineAddressAdd'})
				}
			},
			// 请求地址列表
			requestList:function () {
				const that = this;
				return new Promise ((resolve,reject)=>{
					this.$RQST({
						url: `${this.$API}/users/address`,
					}).then((res) => {
						that.addressList = res;
						resolve(res);
						if (res.length>0){
							that.curAddress = res.filter((el)=>{
								return el.is_default == 1;
							})[0].id;
						}
						that.showPage = true;
					}).catch((err) => {
						console.log(err);
						reject(err);
					})
				})
			}
		},
	}
</script>

<style lang="scss">
	/* #ifdef MP-WEIXIN */
	page{height: 100%;}
	/* #endif */
	uni-page-body,.content{height: 100%;overflow-y: auto;}
	.address-list{
		padding: 20rpx;
		min-height: calc(100% - 200rpx);
		.address-item{
			width: 100%;
			border-radius: $fs-30;
			background: $cl-white;
			display: flex;
			align-items: center;
			justify-content: left;
			margin-bottom: 20rpx;
			padding: 40rpx 20rpx 40rpx 40rpx;
			min-height: 210rpx;
			.selectbox{
				width: 80rpx;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.select{
				width:38rpx;
				height:38rpx;
				border:2rpx solid $cl-main;
				border-radius:50%;
				margin-right: 40rpx;
			}
			.select.active{
				background: $cl-main;
			}
			.msg{
				width: 75%;
				>view{
					>view{
						color: #525252;
						font-size: $fs-34;
						display: inline-block;
						margin-right: 18rpx;
						margin-bottom: 10rpx;
					}
					text{
						color: #B3B3B3;
						font-size: $fs-24;
					}
				}
				>text{
					color: #888888;
					font-size: $fs-26;
					display: inline-block;
					margin-top: 10rpx;
					line-height: 1.4;
				}
			}
			>text{
				color: #B3B3B3;
				font-size: $fs-24;
				padding: 20rpx 0 20rpx 20rpx;
			}
		}
	}
	.btn-box{
		padding: 40rpx 0 100rpx;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		.load{
			width:280rpx;
			height:100rpx;
			background: $cl-main;
			color: $cl-white;
			text-align: center;
			line-height: 100rpx;
			font-size: $fs-34;
			border-radius:50rpx;
		}
		.add{
			width:280rpx;
			height:100rpx;
			background:rgba(255,255,255,1);
			border-radius:50rpx;
			line-height: 100rpx;
			color: #B3B3B3;
			font-size: $fs-34;
			text-align: center;
		}
	}
	.nodata-img{
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		min-height: calc(100% - 200rpx);
		image{
			width: 435rpx;
			height: 415rpx;
			margin-bottom: 60rpx;
		}
		text{
			color: #888888;
			font-size: $fs-34;
		}
	}
</style>
