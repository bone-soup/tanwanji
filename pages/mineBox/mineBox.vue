<template>
	<!-- 我的盒柜 -->
	<view :class="['content','box-container']">
		<!-- 页面导航 -->
		<view class="navlist">
			<view :class="{'active':curNav==1}" @click="clickNav(1)">全部</view>
			<view :class="{'active':curNav==2}" @click="clickNav(2)">抽盒</view>
			<view :class="{'active':curNav==3}" @click="clickNav(3)">商城</view>
			<view :class="{'active':curNav==4}" @click="clickNav(4)">到期提示<view class="tip" v-if="tipMount>0">{{tipMount}}</view></view>
		</view>
		<!-- 盒柜列表 -->
		<view class="boxlist">
			<view class="hasData" :class="{'noPad':ifAll}">
				<view class="selectAll" v-if="list.length>1" @click="clickSelectAll">
					<text :class="{'on':selectAll}">全选</text>
					<view :class="['selectbox',{'on':selectAll}]"></view>
				</view>
				<view class="boxitem" v-for="(item,index) in list" :key="item.id" @click="checkDetail(item)">
					<image :src="item.picture" mode=""></image>
					<view class="item-msg">
						<view>
							<text class="name">{{item.tags==2?'预售|'+item.name:item.name}}</text>
							<text>x{{item.number}}</text>
						</view>
						<text v-if="item.tags!='2'">支付时间：{{item.created_at}}</text>
						<text v-else>发货时间：{{item.advance_date}}后</text>
					</view>
					<view class="btn-box" @click.stop="selectItem(item.id)" >
						<view class="item-btn" :class="{'on':item.selected}"></view>
					</view>
				</view>
				<view class="no-data" v-if="list.length==0">暂时没有数据</view>
			</view>
			<view class="all-data" v-if="ifAll">已加载全部</view>
			<!-- 底部按钮 -->
			<view class="btnbox">
				<view class="line">
					<view class="ybtn" @click="toBuy">下单发货</view>
					<view class="nbtn" @click="noBuy" v-if="curNav!=3">不想要了</view>
				</view>
				<text>*温馨提示：满{{postMount}}个包邮哦！</text>
			</view>
		</view>
		
		<!-- 商品详情 -->
		<view class="detail-shadow" :class="{'on':showDetail}" @click="showDetail = false">
			<view class="detail-box" @click.stop>
				<image :src="detail.picture" mode="aspectFill"></image>
				<view><text>商品名称：</text><text>{{detail.name}}</text></view>
				<view><text>商品价格：</text><text>￥{{(detail.amount/100).toFixed(2)}}</text></view>
				<view><text>订单编号：</text><text>{{detail.cabinet_no}}</text></view>
				<view><text>支付时间：</text><text>{{detail.created_at}}</text></view>
				<text @click="checkRules" url="/pages/mineRules/mineRules">查看发货规则</text>
			</view>
			<image :src="closePic" mode="aspectFit"></image>
		</view>
		<!-- 规则提示 -->
		<toast ref="rules"></toast>
		<!-- 弹框 -->
		<recycle ref="recycle" @comfirm="recycle"></recycle>
	</view>
</template>

<script>
	import recycle from '@/components/recycle/recycle.vue';
	import toast from '@/components/toast/toast';
	export default {
		components:{
			recycle,
			toast
		},
		data() {
			return {
				closePic:`${this.$PNG}/close.png`,					// 关闭icon
				curNav: 1,						// 当前页面类型
				pageIndex:1,					// 当前页
				tipMount:0,						// 到期数量
				postMount:0,					// 包邮数量
				showDetail:false,			// 展示商品详情
				showGiveUp:false,			// 展示不想要了的弹框
				detail:{},						// 商品详情
				list:[],							// 盒柜列表
				rules:'',							// 规则
				ifAll:false,					// 已加载全部
				countPoint:'',				// 回收分数
				selectList:'',				// 选中列表
				selectAll:false,			// 是否点击了全部
			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
			}
		},
		onLoad() {
			uni.removeStorage({
			    key: 'payList',
			    success: function (res) {
			        console.log('清除订单列表成功');
			    }
			});
		},
		onShow() {
			this.requestList();
			this.requestPost();
			this.requestRule();
		},
		onPullDownRefresh() {
			this.list = [];
			this.pageIndex = 1;
			this.requestList();
			this.requestPost();
			this.requestRule();
			setTimeout(()=>{
				uni.stopPullDownRefresh();
			},1000);
		},
		onReachBottom() {
			this.requestList();
		},
		methods: {
			// 点击导航
			clickNav: function (e) {
				if (e!=this.curNav){
					this.list = [];
					this.ifAll = false;
					this.selectAll = false;
				}
				this.curNav = e;
				this.pageIndex = 1;
				this.requestList();
			},
			// 查看商品
			checkDetail:function (e) {
				this.detail = e;
				this.showDetail = true;
			},
			// 选中商品
			selectItem:function (e) {
				this.list.forEach((item) => {
					if (item.id == e) {
						item.selected = !item.selected
					}
				})
			},
			// 点击全选
			clickSelectAll:function () {
				if (this.selectAll) {
					this.list.forEach((el)=>{
						el.selected = false;
					})
				}else{
					this.list.forEach((el)=>{
						el.selected = true;
					})
				}
				this.selectAll = !this.selectAll;
			},
			// 点击下单发货
			toBuy:function () {
				let arr = [];
				this.list.forEach((el)=>{
					if (el.selected) {
						arr.push(el);
					}
				})
				if (arr.length>0){
					uni.setStorage({
					    key: 'payList',
					    data: arr,
					    success: function () {
									uni.redirectTo({url: '/pages/confirmOrder/confirmOrder'});
					    }
					});
				}else{
					uni.showToast({title:'请先选择商品',icon:'none'})
				}
			},
			// 点击不想买了
			noBuy:function () {
				let mountTol = 0;
				let arr = [];
				let judgeList = [];
				let restore = false;
				this.list.forEach((el)=>{
					if (el.selected) {
						arr.push(el.id);
						judgeList.push(el);
						mountTol = mountTol + el.amount;
					}
				})
				restore = judgeList.every((item)=>{
					return item.source == 1
				})
				console.log(restore);
				// 判断有没有选中
				if ( arr.length > 0 ) {
					// 判断有没有商城商品
					if (restore) {
						this.selectList = arr.join(',');
						this.$RQST({
							url: `${this.$API}/moduledetail`,
							data:{
								tables:'serviceSetting'
							}
						}).then((res) => {
							this.amount = res.values.status == 'true' ? res.values.amount * 100 : res.values.amount / 100;
							let servicePay = res.values.status == 'true'? this.amount : Math.floor(mountTol * this.amount);
							let returnPoint = mountTol - servicePay;
							console.log(this.amount,servicePay,returnPoint);
							this.$refs.recycle.open({
								integral:returnPoint < 0 ? '0' : returnPoint,
								handling:servicePay
							})
						})
					} else {
						uni.showModal({
							title:'提示',
							content:'您的商品中包含商城商品，商城商品不可进行回收，请重新选择！',
							showCancel:false,
							success:function (){
								console.log('需要重新选择')
							}
						})
					}
				} else {
					uni.showToast({title:'请先选择商品',icon:'none'});
				}
			},
			// 请求规则
			requestRule:function () {
				const that = this;
				that.$RQST({
					url: `${that.$API}/moduledetail`,
					data:{
						tables:'deliveryRule'
					}
				}).then((res) => {
					that.rules = res.values.content;
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击回收
			recycle:function (){
				this.$RQST({
					url: `${this.$API}/users/cabinet/recovery`,
					data:{
						ids:this.selectList
					}
				}).then((res) => {				
					uni.redirectTo({
						url:'/pages/recycleSuccess/recycleSuccess?type=2'
					})
				})
			},
			// 请求盒柜列表
			requestList:function () {
				const that = this;
				if (!that.ifAll){
					that.$RQST({
						url: `${that.$API}/users/cabinet/lists`,
						data:{
							size:10,
							page:that.pageIndex,
							type:that.curNav - 1,
						}
					}).then((res) => {
						that.tipMount = res.remind;
						if (that.selectAll) {
							res.cabinet.forEach((el) => {
								el.selected = true;
							})
						}else{
							res.cabinet.forEach((el) => {
								el.selected = false;
							})
						}
						that.noData = false;
						that.list = that.list.concat(res.cabinet);
						if ( that.pageIndex > 1 && res.cabinet.length == 0 && that.list.length > 0) {
							that.ifAll = true
						}else{
							that.pageIndex ++;
						}
					}).catch((err) => {
						console.log(err);
					})
				}
			},
			// 请求包邮数量接口
			requestPost:function () {
				const that = this;
				that.$RQST({
					url: `${that.$API}/moduledetail`,
					data:{
						tables:'packageSettings'
					}
				}).then((res) => {
					that.postMount = res.values.num;
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击查看规则
			checkRules:function () {
				this.$refs.rules.open({
					title: '发货规则',
					desc: this.rules
				})
			}
		},
	}
</script>

<style lang="scss">
	/* #ifdef MP-WEIXIN */
	page{height: 100%;}
	/* #endif */
	uni-page-body{
		height: 100%;
	}
	.box-container{
		height:auto
	}
	.navlist {
		width: 100%;
		background: #ffffff;
		height: 108rpx;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 10;
		view{
			color: $cl-black;
			font-size: $fs-30;
			position: relative;
			font-family: 'phM';
			transition: all .3s ease-out;
			width: 25%;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 100%;
			.tip{
				position: absolute;
				height:30rpx;
				background:rgba(255,112,112,1);
				border-radius:15rpx;
				padding: 0 7rpx;
				line-height: 30rpx;
				color: $cl-white;
				font-size: $fs-22;
				top: 22rpx;
				right: 5rpx;
			}
		}
		view:after{
			content: '';
			position: absolute;
			bottom: 0rpx;
			margin-left:-40rpx;
			left: 50%;
			width:0rpx;
			height:8rpx;
			background:$cl-main;
			transition: all .3s ease-out;
		}
		.active{
			font-size: 38rpx;
		}
		.active:after{
			width:80rpx;
		}
	}
	// 商品列表
	.boxlist{
		width: 100%;
		padding: 20rpx;
		padding-bottom: 230rpx;
		height: 100%;
		overflow-y: auto;
		.hasData{
			min-height: calc(100% - 320rpx);
			padding-bottom: 70rpx;
		}
		.hasData.noPad{
			padding-bottom: 0;
		}
		//全选
		.selectAll{
			display: flex;
			align-items: center;
			justify-content: flex-end;
			background: #FFFFFF;
			border-radius: 30rpx;
			height: 72rpx;
			margin-bottom: 20rpx;
			text{
				color: #888888;
				font-size: $fs-28;
				margin-right: 40rpx;
			}
			text.on{
				color: $cl-main;
			}
			view{
				width:40rpx;
				height:40rpx;
				border:2rpx solid rgba(179,179,179,1);
				border-radius:50%;
				margin-right: 40rpx;
			}
			view.on{
				background: $cl-main;
				border: 2rpx solid $cl-main;
			}
		}
		.boxitem{
			width: 100%;
			background: $cl-white;
			border-radius: $radius-30;
			margin-bottom: 20rpx;
			height: 200rpx;
			padding: 40rpx 20rpx 40rpx 40rpx;
			display: flex;
			align-items: center;
			image{
				width: 120rpx;
				height: 120rpx;
				border-radius: 15rpx;
				margin-right: 25rpx;
				flex-shrink: 0;
			}
			.item-msg{
				width: 66%;
				margin-right: 20rpx;
				view{
					display: flex;
					align-items: center;
					justify-content: left;
					margin-bottom: 20rpx;
					.name{
						width: 75%;
						margin-right: 5%;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						display: inline-block;
					}
					text{
						color: #252525;
						font-size: $fs-34;
						font-family: pHm;
					}
				}
				text{
					color: #B3B3B3;
					font-size: $fs-26;
					font-family: pHR;
				}
			}
			.btn-box{
				width: 80rpx;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			.item-btn{
				width:40rpx;
				height:40rpx;
				border:2rpx solid rgba(0,205,164,1);
				border-radius:50%;
				transition: all .2s  ease-in-out;
			}
			.item-btn.on{
				background: rgba(0,205,164,1);
			}
		}
	}
	// 底部按钮
	.btnbox{
		position: fixed;
		left: 0;
		bottom: 0;
		width:100%;
		padding: 30rpx 50rpx;
		background: #f1f1f1;
		z-index: 10;
		.line{
			display: flex;
			align-items: center;
			justify-content: space-around;
			margin-bottom: 40rpx;
			view{
				width:280rpx;
				height:100rpx;
				border-radius:50rpx;
				line-height: 100rpx;
				text-align: center;
				font-size: $fs-34;
			}
			.ybtn{
				background:rgba(0,205,164,1);
				color: $cl-white;
			}
			.nbtn{
				background: $cl-white;
				color: #B3B3B3;
			}
		}
		text{
			width: 100%;
			display: inline-block;
			text-align: center;
			color: #B3B3B3;
			font-size: $fs-24;
		}
	}
	.detail-shadow.on{
		opacity: 1;
		pointer-events: auto;
		.detail-box{
			transform: scale(1);
		}
	}
	.detail-shadow{
		position: fixed;
		opacity: 0;
		pointer-events: none;
		transition: all .3s  ease-in-out;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,.5);
		left: 0;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		.detail-box{
			width:540rpx;
			border-radius: $radius-30;
			background: $cl-white;
			padding: 40rpx;
			transform: scale(.85);
			transition: all .3s  ease-in-out;
			image{
				width:168rpx;
				height: 168rpx;
				border-radius: 15rpx;
				margin-bottom: 40rpx;
				margin-top: 0;
			}
			>view{
				display: flex;
				justify-content: left;
				margin-bottom: 30rpx;
				text{
					font-size: $fs-26;
					color: $cl-black;
					flex-shrink: 0;
				}
				text:last-child{
					width: 70%;
					white-space: normal;
				}
			}
			>text{
				display: inline-block;
				width: 100%;
				font-size: $fs-24;
				color: $cl-main;
				text-decoration: underline;
				text-align: center;
				margin-top: 90rpx;
			}
		}
		image{
			width: 60rpx;
			height: 60rpx;
			margin-top: 30rpx;
		}
	}
</style>
