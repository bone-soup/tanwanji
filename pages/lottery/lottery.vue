<template>
	<view class="content">

		<!-- queue start -->
		<view class="queue" @click="preview =false">
			<view class="avatar-list">
				<image :src="item" mode="aspectFill" v-for="(item,index) in avatarList" :key="index"></image>
				<text v-show="moreMan">· · ·</text>
			</view>
			<view class="text-wrap">
				<view class="id">NO.{{machineNo}}</view>
				<view class="nums">前面有: {{people}}人</view>
			</view>
		</view>
		<!-- queue end -->
		<view v-if="machineList.length==0" class="no-data">暂无抽盒机</view>
		<!-- machine start -->
		<swiper :indicator-dots="false" :autoplay="false" interval="3000" duration="800" :circular="true" :disable-touch="true"
		 :current="currentSwiper" easing-function="easeInOutCubic"  v-if="machineList.length>0" :class="[`row-${table.rows}`,`col-${table.cols}`,{'zhai':manyBox}]" >
			<swiper-item v-for="(item,index) in machineList" :key="index" @touchmove.stop.prevent="">
				<view class="swiper-item">
					<view class="machine">
						<image :src="item.header_pic" mode="aspectFill" class="header-pic"></image>
						<view class="list">
							<view class="item" v-for="(el,i) in item.machine_product" @click="toView(el)" :key="i">
								<image :src="el.sales_status==1?item.wrapping_pic:saledImg" mode="aspectFill"></image>
								<text>{{i+1}}</text>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
		<!-- machine end -->

		<!-- preview start -->
		<view @click="preview=true" :class="['preview',`row-${table.rows}`,`col-${table.cols}`]">
			<image :src="previewIcon" mode="aspectFill"></image>
			<view>查看详情</view>
		</view>
		<!-- preview end -->

		<!-- btns start -->
		<view :class="['btns',`row-${table.rows}`,`col-${table.cols}`]">
			<button class="btn reverse" @click="buy" hover-class="reverse-hover">
				<view>买端盒</view>
				<view>({{whole?(whole.num>1000?'999+':whole.num):0}})</view>
			</button>
			<button class="btn reverse" @click="changeSwiper" hover-class="reverse-hover">换一盒</button>
			<button class="btn" @click="toQueue">{{isQueue?'排队中':'排队'}}</button>
		</view>
		<!-- btns end -->

		<!-- remarks -->
		<view class="remarks"><text>提示①：买端盒是购买此系列下的整套盲盒
		提示②：该盲盒为拆盒未拆袋确认款，介意慎拍！</text></view>

		<!-- orderConfirm -->
		<orderConfirm ref="orderConfirm"></orderConfirm>

		<!-- preview start -->
		<scroll-view scroll-y="true" :class="['preview-wrap',{'active':preview}]">
			<!-- <image :src="previewImg" mode="widthFix" /> -->
			<rich-text :nodes="richText"></rich-text>
			<view class="close" @click="preview=false"></view>
		</scroll-view>
		<!-- preview end -->

		<!-- preview-popups -->
		<view :class="['preview-popups',{'active':preview}]" @click="preview=false"></view>

	</view>
</template>

<script>
	import orderConfirm from '@/components/orderConfirm/orderConfirm';
	import util from '@/assets/util';
	export default {
		components: {
			orderConfirm
		},
		data() {
			return {

				// 系列id
				seriesId: '111222333444',

				//抽盒机id 
				machineID: '',

				//抽盒机编号
				machineNo: '00000000000001',

				//商品预览icon
				previewIcon: this.$PNG + '/view-product.png',

				//售罄图片
				saledImg: this.$PNG + '/sold-out.png',

				// 排队列表
				queue: [],

				// 排队计时
				queueTimer: null,

				//  正在排队
				isQueue: false,

				//前面人数
				people: '0',

				// 抽盒机列表
				machineList: [],

				//端盒
				whole: null,

				// 当前swiper
				currentSwiper: 0,

				// 是否显示预览
				preview: false,

				// 预览图片
				previewImg: '',

				// 包邮说明
				packageSettings: {
					num: 0,
					postage: 0
				},

				moreMan: false,

				// 头像列表
				avatarList: [],
				
				// 头像限制
				avatarNum:5,
				
				// 富文本内容
				richText:'',
				
				// 24盒的情况下
				manyBox:false

			}
		},
		computed:{
			table(){
				let len = this.machineList.length>0&&this.machineList[0].machine_product.length;
				let cols;
				let rows;
				switch (len) {
					case 6:
						cols = 2;
						rows = 3;
						break;
					case 8:
						cols = 2;
						rows = 4;
						break;
					case 9:
						cols = 3;
						rows = 3;
						break;
					case 12:
						cols = 3;
						rows = 4;
						break;
					case 10:
						cols = 2;
						rows = 5;
						break;
					case 24:
						cols = 6;
						rows = 4;
						break;
				}
				return {cols,rows};
			},
		},
		onLoad({
			id,
			machineID
		}) {
			this.seriesId = id;
			this.machineID = machineID;
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.$store.state.shareImage,
			}
		},
		async onShow() {
			await this.getMachineList();
			if (this.machineList.length > 0) {
				this.getQueueDetail();
			}
		},
		onHide() {
			clearTimeout(this.queueTimer);
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取机器列表
			 * ****************************************************************************************************
			 */
			getMachineList() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/machinedetail`,
						data: {
							series_id: this.seriesId
						}
					}).then((res) => {
						this.machineList = res.machine;
						if (this.machineList[0].machine_product.length==24) {
							this.manyBox = true;
						}
						this.whole = res.whole;
						let singleItem;
						singleItem = res.whole.introduce && res.whole.introduce.replace(/(\<img|\<p|\<span)/gi,($0, $1)=>{
							return {
								"<img": '<img style="max-width:100%;display:block;margin:0 auto;" ',
								"<p": '<p style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
								"<span": '<span style="line-height:1.3;text-align:justify;display:block;margin:0 auto" ',
							}[$1];
						})
						this.richText = singleItem;
						this.name1 = res.whole.name;
						this.name2 = res.whole.abbreviation;
						this.$store.commit('changeName', this.name1 + this.name2);
						this.$store.commit('changeTitle', this.name2);
						uni.setNavigationBarTitle({
							title: this.$store.state.titleName
						})
						if (this.machineList.length > 0) {
							this.previewImg = this.machineList[0].detail_introduce;
							this.machineNo = this.machineList[0].machine_no;
						}
						if (this.machineID) {
							var key = this.machineList.findIndex((item) => {
								return item.id == this.machineID
							})
							this.currentSwiper = key
						}
						resolve(res)
					})
				})

			},
			/**
			 * ****************************************************************************************************
			 * @description 头部加载完成
			 * ****************************************************************************************************
			 */
			imgLoad(e){
				console.log(e.currentTarget.dataset.index)
				if(e.currentTarget.dataset.index==0){
					let h = e.detail.height;
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 换一盒
			 * ****************************************************************************************************
			 */
			changeSwiper(e) {
				if (this.machineList.length == 1) {
					uni.showToast({
						title: '暂无更多',
						icon: 'none'
					})
				} else {
					if (this.currentSwiper < this.machineList.length - 1) {
						this.currentSwiper++
					} else {
						this.currentSwiper = 0;
					}
					this.machineNo = this.machineList[this.currentSwiper].machine_no;
					this.getQueueDetail();
				}
			},
			/**
			 * ****************************************************************************************************
			 * @description 买端盒
			 * ****************************************************************************************************
			 */
			buy() {
				if (this.whole.num>0) {
					this.$refs.orderConfirm.open(this.whole, this.packageSettings, this.$store.getters.getName)
				} else {
					uni.showToast({
						title: '库存不足',
						icon: 'none'
					})
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 前往详情页面
			 * ****************************************************************************************************
			 */
			toView(el) {
				let num;
				this.queue.forEach((item, index) => {
					if (item.user_id == uni.getStorageSync('userInfo').id) {
						num = index;
					} else {
						num = false
					}
				})
				if (this.isQueue) {
					if (num && num > 0) {
						uni.showToast({
							icon: 'none',
							title: '正在排队'
						})
					} else {
						if (el.sales_status == 1) {
							uni.navigateTo({
								url: `/pages/lotteryView/lotteryView?id=${el.id}&name1=${this.name1}&name2=${this.name2}`
							})
						}
					}
				} else {
					// 如果没有排队但是前面没有人
					if(this.people == 0){
						console.log('当前没人直接进入详情');
						if (!this.$store.getters.getSocket) {
							this.$store.commit('startSocker', (res,data) => {
								if (res == 1) {
									this.getQueue(0,1,el);
								} else if (res == 3) {
									uni.showModal({
										title:'系统提示',
										content:data.msg,
										success:(res1)=> {
											if(res1.confirm){
												this.getQueueDetail();
											}
										}
									})
								} else {
									this.getQueueDetail();
								}
							})
						} else {
							this.getQueue(0,1,el);
						}
					}else{
						uni.showToast({
							icon: 'none',
							title: '请先排队'
						})
					}
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 点击排队
			 * ****************************************************************************************************
			 */
			toQueue() {
				if (!uni.getStorageSync('token')) {
					uni.showModal({
						title: '未登录',
						content: '登录后可进行下一步操作',
						success(suc) {
							if (suc.confirm) {
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							}
						}
					})
					return false;
				}
				if (!this.isQueue) {
					if (!this.$store.getters.getSocket) {
						this.$store.commit('startSocker', (res,data) => {
							if (res == 1) {
								this.getQueue(0)
							} else if (res == 3) {
								uni.showModal({
									title:'系统提示',
									content:data.msg,
									success:(res1)=> {
										if(res1.confirm){
											this.getQueueDetail();
										}
										console.log('点击确认收到排队完成');
									}
								})
							} else {
								this.getQueueDetail();
							}
						})
					} else {
						this.getQueue(0)
					}
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 排队接口
			 * @param {number} num 已排队是否直接删除 0：不删除；1：删除
			 * ****************************************************************************************************
			 */
			getQueue(num,first,el) {
				this.$RQST({
					url: `${this.$API}/machine_queue/add`,
					data: {
						id: this.machineList[this.currentSwiper].id,
						client_id: this.$store.getters.getclientId,
						series_id: this.seriesId,
						user_id: uni.getStorageSync('userInfo').id,
						is_delete: num,
						is_first:first
					},
				}).then((res) => {
					if (first) {
						if (el.sales_status == 1) {
							uni.navigateTo({
								url: `/pages/lotteryView/lotteryView?id=${el.id}&name1=${this.name1}&name2=${this.name2}`
							})
						}
					}else{
						this.getQueueDetailBack(res);
					}
				}).catch(err => {
					if (err.code == 10200) {
						uni.showModal({
							title: '系统提示',
							content: err.msg,
							success: (suc) => {
								if (suc.confirm) {
									if (first) {
										// 如果前面没人
										this.getQueue(1,1,el);
									}else{
										this.getQueue(1)
									}
								}
							}
						})
					} else if (err.code == 10201){
						// 点击九宫格详情,前面刚好有人
						uni.showToast({
							title:err.msg,
							icon:'none'
						})
						this.getQueueDetail();
					} else {
						uni.showToast({
							title: err.msg,
							icon: 'none'
						})
					}
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取排队详情
			 * ****************************************************************************************************
			 */
			getQueueDetail() {
				this.$RQST({
					url: `${this.$API}/machine_queue/lists`,
					data: {
						id: this.machineList[this.currentSwiper].id
					},
					method: 'get',
					loading: false
				}).then((res) => {
					console.log('获取排队详情：' + JSON.stringify(res));
					this.getQueueDetailBack(res)
				}).catch(err => {
					console.log(err)
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取排队详情回调
			 * ****************************************************************************************************
			 */
			getQueueDetailBack(res) {
				this.queue = [...res.queue];
				this.avatarList = [];
				if (this.queue.length == 0) {
					// 如果当前排队列表没有人
					this.people = 0;
					this.isQueue = false;
				} else {
					if (this.queue.length > this.avatarNum) {
						this.moreMan = true;
						for(let i=0;i<this.avatarNum;i++){
							this.avatarList.push(this.queue[i].user_portrait)
						}
					}else{
						this.moreMan = false;
						this.avatarList = this.queue.map((item)=>{
							return item.user_portrait
						})
					}
					this.isQueue = this.queue.some((item) => {
						return item.user_id == uni.getStorageSync('userInfo').id;
					});
					if (this.isQueue) {
						this.queue.forEach((item, index) => {
							if (item.user_id == uni.getStorageSync('userInfo').id) {
								this.people = index;
							}
						})
					} else {
						this.people = this.queue.length;
					}

					let current = this.queue.filter(item => {
						return item.status == 2
					});
					let time = (current[0].start_time + parseInt(res.restrict.date) + current[0].detail_time) - Date.parse(new Date()) /
						1000;
					clearTimeout(this.queueTimer);
					this.queueTimer = setTimeout(() => {
						this.getQueueDetail();
					}, time * 1000)
				}
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取包邮说明
			 * ****************************************************************************************************
			 */
			getShipping() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/moduledetail`,
						data: {
							tables: 'packageSettings'
						}
					}).then(({
						values
					}) => {
						this.packageSettings = values;
						resolve({
							values
						})
					})
				})
			}
		},
		mounted() {
			this.getShipping();
		}
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
	}

	// content
	.content {
		padding: 40rpx 20rpx 140rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100%;
		position: relative;
		box-sizing: border-box;
	}

	.no-data {}

	// queue
	.queue {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 80rpx;

		.avatar-list {
			display: flex;
			align-items: center;

			image {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 10rpx;
			}
		}

		.text-wrap {
			display: flex;
			flex-direction: column;
			align-items: flex-end;

			.id {
				font-size: $fs-22;
				color: $cl-gray3;
			}

			.nums {
				font-size: $fs-24;
				padding: 10rpx 12rpx;
				background-color: $cl-gray1;
				border-radius: 22rpx;
				margin-top: 10rpx;
			}
		}
	}

	// machine
	swiper {
		width: 100%;
		&.row-3{
			&.col-2{
				height: 547rpx;
				margin-top: 80rpx;
				.machine {
					width: 468rpx;
				}
				.item{
					width: 33.333333%;
					height: 176rpx;
				}
				.header-pic{
					height: 195rpx;
				}
			}
			&.col-3{
				height: 604rpx;
				margin-top: 20rpx;
				.machine {
					width: 390rpx;
				}
				.item{
					width: 33.333333%;
					height: 147rpx;
				}
				.header-pic{
					height: 163rpx;
				}
			}
		}
		&.row-4{
			&.col-2{
				margin-top: 80rpx;
				height: 550rpx;
				.machine {
					width: 560rpx;
				}
				.item{
					width: 25%;
					height: 158rpx;
				}
				.header-pic{
					height: 234rpx;
				}
			}
			&.col-3{
				height: 568rpx;
				margin-top: 60rpx;
				.machine {
					width: 448rpx;
				}
				.item{
					width: 25%;
					height: 127rpx;
				}
				.header-pic{
					height: 187rpx;
				}
			}
			&.col-6{
				height: 949rpx;
				margin-top: 60rpx;
				.machine {
					width: 448rpx;
				}
				.item{
					width: 25%;
					height: 127rpx;
				}
				.header-pic{
					height: 187rpx;
				}
			}
		}
		&.row-5{
			&.col-2{
				margin-top: 80rpx;
				height: 542rpx;
				.machine {
					width: 560rpx;
				}
				.item{
					width: 20%;
					height: 156rpx;
				}
				.header-pic{
					height: 230rpx;
				}
			}
		}
	}
	swiper.zhai{
		width: 450rpx;
	}

	.swiper-item {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	
	.machine {

		image {
			width: 100%;
		}

		.list {
			display: flex;
			flex-wrap: wrap;

			.item {
				position: relative;

				text {
					position: absolute;
					background: transparent;
					display: flex;
					align-items: center;
					justify-content: center;
					color: $cl-white;
					border: 1rpx solid $cl-white;
					border-radius: 50%;
					left: 8rpx;
					top: 8rpx;
					z-index: 10;
					font-size: 18rpx;
					z-index: 100;
					width: 24rpx;
					height: 24rpx;
				}

				image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	// preview
	.preview {
		display: flex;
		align-items: center;
		margin-top: 50rpx;
		font-size: 32rpx;
		color: #666;
		image {
			width: 38rpx;
			height: 42rpx;
			margin-right: 20rpx;
		}
	}

	// btns
	.btns {
		width: 610rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 50rpx;

		.btn {
			width: 158rpx;
			height: 158rpx;
			border-radius: 50%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			line-height: 1.2;

			&:first-child {
				border: 2rpx solid $cl-main;
			}

			&.reverse {
				background-color: $cl-white;
				color: $cl-main;
			}

			&.reverse-hover {
				background-color: $cl-gray4;
			}
		}
	}

	// remarks
	.remarks {
		position: absolute;
		left: 0;
		bottom: 30rpx;
		width: 100%;
		text-align: center;
		font-size: $fs-22;
		color: $cl-gray3;
		line-height: 1.6;

	}

	.preview-popups {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, .5);
		opacity: 0;
		pointer-events: none;
		transition: all .5s ease;

		&.active {
			opacity: 1;
			pointer-events: all;
		}
	}

	// preview-wrap
	.preview-wrap {
		width: 100%;
		position: fixed;
		bottom: -100%;
		transition: all .5s ease;
		height: calc(100% - 160rpx);
		z-index: 1;
		background-color: $cl-white;
		border-top-left-radius: $radius-30;
		border-top-right-radius: $radius-30;
		overflow: hidden;

		.close {
			position: fixed;
			left: 50%;
			bottom: -100%;
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			border: 4rpx solid $cl-main;
			transform: translate(-50%, -50%);
			pointer-events: none;
			transition: all .5s ease;

			&::before {
				content: '';
				width: 40rpx;
				height: 4rpx;
				background-color: $cl-main;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%) rotate(45deg);
			}

			&::after {
				content: '';
				width: 4rpx;
				height: 40rpx;
				background-color: $cl-main;
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%) rotate(45deg);
			}
		}

		image {
			width: 100%;
		}

		&.active {
			bottom: 0;

			.close {
				bottom: 20rpx;
				pointer-events: all;
			}
		}
	}

	.no-data {
		height: 446rpx;
		margin-top: 80rpx;
	}
</style>
