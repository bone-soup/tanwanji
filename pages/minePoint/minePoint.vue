<template>
	<!-- 积分明细 -->
	<view class="content mine-point">
		<view class="point-list" v-if="pointList.length>0">
			<view class="point-item" v-for="item in pointList" :key="item.id">
				<text>{{item.created_date}}</text>
				<view class="record-item" v-for="record in item.record" :key="record.id">
					<view class="item-item" v-for="el in record.item" :key="el.id">
						<view>{{el.title}}</view>
						<text :class="{'add':el.point.indexOf('+')!='-1'}">{{el.point}}</text>
					</view>
					<text :class="{'line':record.item.length>1}">余额：{{record.original}}</text>
				</view>
			</view>
			<view v-if="ifAll" class="all-data">已加载全部</view>
		</view>
		<view class="no-data" v-else>暂无数据</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pointList:[],
				pageIndex:1,
				ifAll:false,
			}
		},
		onLoad() {
			
		},
		onShow() {
			this.requestList();
		},
		onReachBottom() {
			console.log('到底了');
			this.requestList();
		},
		onPullDownRefresh() {
			this.pointList = [];
			this.ifAll = false;
			this.pageIndex = 1;
			this.requestList();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000)
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		methods: {
			// 请求积分明细列表
			requestList:function () {
				const that = this;
				if (!this.ifAll){
					this.$RQST({
						url: `${this.$API}/activity/point/details`,
						data:{
							size:20,
							page:that.pageIndex
						}
					}).then((res) => {
						console.log(res);
						that.pointList = that.pointList.concat(res);
						if ( that.pageIndex > 1 && res.length == 0 ) {
							that.ifAll = true
						}
						that.pageIndex ++;
					}).catch((err) => {
						console.log(err);
					})
				}
			}
		},
	}
</script>

<style lang="scss">
	.mine-point .point-list{
		padding: 0 30rpx 40rpx;
	}
	.mine-point .point-item{
		width: 100%;
		padding: 20rpx 0 0;
		>text{
			color: #B3B3B3;
			font-size: 24rpx;
			width: 100%;
			display: inline-block;
			text-align: center;
		}
		>.record-item{
			width: 100%;
			background: #ffffff;
			border-radius:30rpx;
			margin-top: 20rpx;
			padding: 40rpx 40rpx 35rpx;
			.item-item{
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				line-height: 1;
				margin-top: 40rpx;
				>view{
					font-size: 32rpx;
					color: #525252;
				}
				>text{
					font-size: 42rpx;
					color: #525252;
				}
				>text.add{
					color: #00CDA4;
				}
				&:first-child {
					margin-top: 10rpx;
				}
			}				
			>text{
				width: 100%;
				display: inline-block;
				text-align: right;
				color: #B3B3B3;
				font-size: 24rpx;
				padding-top: 28rpx;
			}
			>text.line{
				border-top: 1rpx solid #F2F2F2;
				margin-top: 30rpx;
			}
		}
	}
	
</style>
