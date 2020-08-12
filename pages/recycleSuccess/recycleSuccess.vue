<template>
	<!-- 成功公共页 -->
	<view class="content">
		<image :src="img" mode=""></image>
		<view class="text">{{successTitle}}</view>
		<text class="msg" v-if="type==3">-{{point}}积分</text>
		<text class="msg" v-if="type==3">卡券已放入您的卡券包</text>
		<button class="btn" :class="{'pad':type==3}" @click="toPage">{{successBtn}}</button>
		<button v-if="type==1||type==4" class="check" @click="toCheck">{{successCheck}}</button>
		<navigator v-if="type==2" url="/pages/minePoint/minePoint" class="integral">查看积分</navigator>
	</view>
</template>

<script>
	export default {
		data(){
			return {
				type:1,			// 1:支付成功;2:回收成功;3:兑换成功;4:发货成功
				shop:'',			// 商城
				img:`${this.$PNG}/success.png`,				// 成功图片
				successTitle:'',						// 提示文字
				successBtn:'',							// 按钮文字
				successCheck:'',						// 查看按钮
				point:'',
			}
		},
		onLoad(option) {
			let type = this.type = option.type;
			this.shop = option.shop;
			this.point = option.point;
			switch (type) {
				case '1':
				this.successTitle = '支付成功';
				this.successBtn = '继续逛逛';
				this.successCheck = '查看盒柜';
				uni.setNavigationBarTitle({title:"支付结果"});
				break;
				case '2':
				this.successTitle = '回收成功';
				this.successBtn = '返回首页';
				uni.setNavigationBarTitle({title:this.$store.getters.getName});
				break;
				case '3':
				this.successTitle = '兑换成功';
				this.successBtn = '返回首页';
				uni.setNavigationBarTitle({title:this.$store.getters.getName});
				break;
				case '4':
				this.successTitle = '发货成功';
				this.successBtn = '返回首页';
				this.successCheck = '查看订单';
				uni.setNavigationBarTitle({title:'发货成功'});
				break;
			}
		},
		methods: {
			
			/**
			 * ****************************************************************************************************
			 * @description 返回首页
			 * ****************************************************************************************************
			 */
			toPage(){
				if (this.shop) {
					// 商城逛一逛
					uni.switchTab({
						url:'/pages/shopping/shopping'
					})
				} else {
					uni.switchTab({
						url:'/pages/index/index'
					})
				}
			},
			
			// 底部按钮
			toCheck(){
				if (this.type == 1) {
					uni.navigateTo({
						url:'/pages/mineBox/mineBox'
					})
				} else {
					uni.navigateTo({
						url:'/pages/mineOrder/mineOrder'
					})
				}
			}
		
		}
	}
</script>

<style lang="scss">
	// content
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 82rpx 70rpx;
	}
	.content .msg{
		color: #888888;
		font-size: 26rpx;
		margin-top: 60rpx;
	}
	image{
		width: 200rpx;
		height: 200rpx;
		margin-top: 120rpx;
	}
	.text{
		font-size: $fs-40;
		margin-top: 60rpx;
		font-family: phM;
	}
	.btn{
		width: 300rpx;
		height: 100rpx;
		border-radius: 50rpx;
		margin-top: 280rpx;
	}
	.pad{
		margin-top:200rpx
	}
	.check{
		width: 300rpx;
		height: 100rpx;
		border-radius: 50rpx;
		margin-top: 42rpx;
		background: #FFFFFF;
		color: #525252;
		font-family: phM;
	}
	.integral{
		color: $cl-main;
		text-decoration: underline;
		margin-top: 70rpx;
	}
</style>
