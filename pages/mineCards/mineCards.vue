<template>
	<!-- 我的卡券 -->
	<view class="content mine-cards">
		<!-- 页面导航 -->
		<view class="navlist">
			<view :class="{'active':curNav==1}" @click="clickNav(1)">可用卡券</view>
			<view :class="{'active':curNav==2}" @click="clickNav(2)">失效卡劵</view>
		</view>
		<!-- 卡劵列表 -->
		<view class="card-box">
			<view class="card-list" v-if="cardList.length > 0">
				<view class="card-item" v-for="item in cardList" :key="item.id">
					<image :src="item.cover" mode=""></image>
					<view class="point" :class="item.card_id==2?'a':'b'">{{item.point}}积分</view>
					<view class="time">{{item.valid_time}}</view>
					<view class="shadow" v-show="curNav==2"></view>
				</view>
				<view v-if="ifAll" class="all-data">已加载全部</view>
			</view>
			<view class="no-data" v-else>{{curNav==1?'暂无可用卡券':'暂无失效卡券'}}</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			pageIndex:1,					// 当前页
			curNav: 1 ,						// 当前页面类型
			cardList:[],					// 卡券列表
			ifAll:false,					// 展示全部
		};
	},
	onLoad() {
		
	},
	onShow() {
		this.requestList();
	},
	onPullDownRefresh() {
		this.ifAll = false;
		this.cardList = [];
		this.pageIndex = 1;
		this.requestList();
		setTimeout(()=>{
			uni.stopPullDownRefresh();
		},1000)
	},
	onReachBottom() {
		this.requestList();
	},
	methods: {
		// 点击导航
		clickNav:function (e) {
			const that = this;
			if (e!=that.curNav){
				that.cardList = [];
			}
			that.curNav = e;
			console.log(that.curNav);
			that.pageIndex = 1;
			that.ifAll = false;
			that.requestList();
		},
		// 请求卡券列表
		requestList:function () {
			const that = this;
			if (!this.ifAll) {
				this.$RQST({
					url: `${this.$API}/users/card`,
					data:{
						type:that.curNav,
						size:10,
						page:that.pageIndex
					}
				}).then((res) => {
					console.log(res);
					that.cardList = that.cardList.concat(res);
					that.cardList.forEach((item) => {
						item.valid_time = that.$util.timeChange(item.created_at) + '-' + that.$util.timeChange(item.deadline);
					})
					if ( that.pageIndex > 1 && res.length == 0 ) {
						that.ifAll = true
					}
					that.pageIndex ++;
				}).catch((err) => {
					if (err.length == 0) {
						that.cardList = [];
					}
					console.log(err);
				})
			}
		}
	},
};
</script>

<style lang="scss">
.mine-cards{
	.card-box{
		width: 100%;
		padding: 50rpx 65rpx;
		.no-data{
			width:610rpx;
			height:100rpx;
			background:rgba(217,217,217,1);
			border-radius:50rpx;
			text-align: center;
			line-height: 100rpx;
			color: $cl-black;
			font-size: $fs-34;
		}
	}
}

.navlist {
	width: 100%;
	background: #ffffff;
	height: 108rpx;
	display: flex;
	align-items: center;
	justify-content: space-around;
	view{
		color: $cl-black;
		font-size: $fs-34;
		position: relative;
		width: 50%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	view:after{
		content: '';
		position: absolute;
		bottom: 10rpx;
		margin-left:-40rpx;
		left: 50%;
		width:0rpx;
		height:6rpx;
		background:$cl-main;
		transition: all .3s ease-out;
	}
	.active:after{
		width:80rpx;
	}
}
.card-list{
	width: 100%;
	.card-item{
		width:100%;
		margin-bottom: 40rpx;
		position: relative;
		height: 200rpx;
		border-radius: $radius-30;
		overflow: hidden;
		.shadow{
			position: absolute;
			background: rgba(0,0,0,.5);
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
		}
		image{
			height: 100%;
			width: 100%;
		}
		.point{
			font-size: $fs-22;
			position: absolute;
			right: 20rpx;
			bottom: 20rpx;
			height: 30rpx;
			line-height: 30rpx;
			text-align: center;
			border-radius: 15rpx;
			padding: 0 12rpx;
			background: $cl-white;
		}
		.a{
			color: #BB605F;
		}
		.b{
			color: #687998;
		}
		.time{
			position: absolute;
			color: $cl-gray4;
			font-size: $fs-22;
			bottom: 20rpx;
			left: 30rpx;
		}
	}
}



</style>
