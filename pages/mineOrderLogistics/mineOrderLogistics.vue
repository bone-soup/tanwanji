<template>
	<!-- 物流信息 -->
	<view class="content" v-if="reflow">
		<view class="logistics-top" v-if="!noData">
			<view>运单号：{{detail.number}}</view>
			<view>物流承运：{{detail.expName}}</view>
			<view>物流状态：{{type==0?'揽件中':(type==1?'在途中':(type==2?'正在派件':(type==3?'已签收':(type==4?'派送失败':(type==5?'疑难件':'退件签收')))))}}</view>
		</view>
		<view class="logistics-bot" v-if="!noData">
			<view class="msg-list">
				<view class="msg" v-if="type>2">
					<view :class="['title',{'on':type>2}]">{{type==3?'已签收':(type==4?'派送失败':(type==5?'疑难件':'退件签收'))}}</view>
					<view>您的订单{{type==3?'已签收':(type==4?'派送失败':(type==5?'为疑难件':'退件签收'))}}</view>
					<text>{{time}}</text>
				</view>
				<view class="msg" v-for="(item,index) in detail.list" :key="index">
					<view class="title on">派送中</view>
					<view>{{item.status}}</view>
					<text>{{item.time}}</text>
				</view>
				<view class="msg">
					<view :class="['title',{'on':type>0}]">已揽收</view>
					<view>您的包裹已被{{detail.expName}}揽收</view>
					<text>{{time}}</text>
				</view>
			</view>
		</view>
		<view class="toast-wrap" v-if="noData">
			<view class="toast-content">
				<view class="title">没有查询到物流信息</view>
				<image :src="img" mode="widthFix"></image>
				<view class="back" @click="close">返回</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail:{},
				type:null,
				noData:false,
				img:this.$PNG+'/guess.png',
				reflow:false
			}
		},
		onLoad(options) {
			this.id = options.order;
			this.requestDetail(options.order);
		},
		onPullDownRefresh() {
			this.requestDetail(this.id);
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		methods: {
			// 请求物流信息
			requestDetail:function (id) {
				console.log(id);
				this.$RQST({
					url: `${this.$API}/users/orders/express`,
					data:{
						id:id
					},
					loading: true,
				}).then((res) => {
					console.log(res);
					this.reflow = true;
					if (res.length>0 || res.msg) {
						this.detail = res.result;
						this.type = res.result.deliverystatus;
					}else{
						this.noData = true;
					}
				}).catch((err) => {
					console.log(err);
				})
			},
			
			// 点击返回
			close:function () {
				uni.navigateBack({
					delta:1
				})
			}
		},
	}
</script>

<style lang="scss">
	.logistics-top{
		width: 100%;
		padding: 70rpx;
		background: #FFFFFF;
		view{
			color: #525252;
			line-height: 1.5;
			font-size: $fs-28;
		}
	}
	.logistics-bot{
		width: 100%;
		padding: 20rpx;
		.msg-list{
			width: 100%;
			background: #FFFFFF;
			border-radius: $radius-30;
			padding: 70rpx;
			.msg:last-child{
				border: none;
			}
			.msg{
				width: 100%;
				margin-left: 14rpx;
				padding: 0 0 70rpx 52rpx;
				border-left: 1rpx solid #E6E6E6;
				position: relative;
				view{
					color: #252525;					
					font-family: phM;
					font-size: $fs-28;
					margin-bottom: 15rpx;
					line-height: 1.2;
				}
				.title{
					font-size: $fs-34;
					margin-bottom: 25rpx;
				}
				.title:before{
					content: '';
					background: #D9D9D9;
					border-radius: 50%;
					width: 28rpx;
					height: 28rpx;
					position: absolute;
					z-index: 10;
					left: -15rpx;
					top: 1rpx;
				}
				.title.on::before{
					background: $cl-main;
				}
				text{
					color: #B3B3B3;
					font-size: $fs-28;
				}
			}
		}
	}
	.toast-wrap {
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		background-color: rgba($color: #000000, $alpha: 0.5);
		z-index: 100;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all .3s ease;

		.toast-content {
			width: 440rpx;
			border-radius: 30rpx;
			background-color: $cl-white;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			padding: 70rpx 50rpx 40rpx;
	
			.title {
				font-family: phM;
				font-size: $fs-32;
				line-height: 1.5;
				text-align: center;
				display: inline-block;
			}
			image{
				width: 251rpx;
				margin-top: 60rpx;
			}	
			.back {
				font-size: 30rpx;
				font-family: phM;
				padding: 50rpx 0 20rpx;
				width: 100%;
				color: $cl-main;
				text-align: center;
			}
		}
	}
</style>
