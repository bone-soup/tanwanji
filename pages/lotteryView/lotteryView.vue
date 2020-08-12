<template>
	<view class="content">

		<!-- shake start -->
		<view class="shake">
			<image :src="shakeImg" mode="aspectFill" @click="openPermission"></image>
			<text v-if="shakeSwitch">点击上方图标获取摇一摇授权</text>
			<view>手机摇一摇(免费三次)</view>
		</view>
		<!-- shake end -->

		<!-- product -->
		<image :src="product?product.packing_pic:''" mode="aspectFill" :class="['product',{'active':productState==1},{'leave':productState==2}]"></image>

		<!-- id-wrap start -->
		<view class="id-wrap">
			<view class="id">NO.{{product?product.index_no:'00000000000001-1'}}</view>
			<view class="help" @click="help">?</view>
		</view>
		<!-- id-wrap end -->

		<!-- cards start -->
		<view class="cards">
			<view class="card" v-for="item in props" :key="item.id" @click="clickCard(item.id)">{{item.title}}</view>
		</view>
		<!-- cards end -->

		<!-- bts start -->
		<view class="btns">
			<button class="btn reverse" hover-class="reverse-hover" @click="changeOne">换一个</button>
			<button class="btn" @click="buy">就买它</button>
		</view>
		<!-- bts end -->

		<!-- remarks -->
		<text class="remarks">全场满{{packageSettings.num}}个包邮（0元商品除外）不满足{{packageSettings.num}}个需要收取一定运费
			（港澳台及海外地区无法配送）！一旦发货，不支持7天无理由退换！</text>

		<!-- orderConfirm -->
		<orderConfirm ref="orderConfirm"></orderConfirm>

		<!-- toast -->
		<toast ref="toast1" @close="closeToast"></toast>
		<toast ref="toast2"></toast>

		<!-- CueCard -->
		<chooseCard ref="card2" type="提示卡" @submit="sure"></chooseCard>

		<!-- PerspectiveCard -->
		<chooseCard ref="card3" type="透视卡" @submit="sure"></chooseCard>
	</view>
</template>

<script>
	import orderConfirm from '@/components/orderConfirm/orderConfirm'
	import chooseCard from '@/components/chooseCard/chooseCard'
	import toast from '@/components/toast/toast'
	export default {
		components: {
			orderConfirm,
			toast,
			chooseCard
		},
		data() {
			return {
				// 商品id
				id: '0',

				//用户积分
				integral: 0,

				// 产品状态
				productState: 0,

				// 摇一摇图片
				shakeImg: this.$PNG + '/shake.png',

				//产品
				product: null,

				// 音频实例
				audioCtx: null,

				// 已经摇晃次数
				times: 0,

				// 摇一摇状态
				shakes: false,

				// 摇一摇全局
				global: {
					lastTime: 0, //此变量用来记录上次摇动的时间
					intervalTime: 200, // 两次摇一摇的间隔事件
					lastX: 0,
					lastY: 0,
					lastZ: 0, //此组变量分别记录对应x、y、z三轴的数值和上次的数值
					// #ifdef MP-WEIXIN
					shakeSpeed: this.$util.SystemInfo.platform == 'ios' ? 90 : 130,//设置阈值
					// #endif
					// #ifdef H5
					shakeSpeed: this.$util.SystemInfo.platform == 'ios' ? 1000 : 1000, //设置阈值
					// #endif
				},

				// 道具卡
				props: [{
						id: 1,
						title: '记录卡'
					},
					{
						id: 2,
						title: '提示卡'
					},
					{
						id: 3,
						title: '透视卡'
					}
				],

				// 摇一摇提示
				remasks: ['这款不是大娃', '这款不是二娃', '这款不是三娃'],

				//摇一摇提示记录
				remasksHistory: [],

				// 道具说明
				helpDesc: '',

				//包邮说明
				packageSettings: {
					num: 0,
					postage: 0
				},
				
				shakeSwitch:false,	// 摇一摇主动授权开关
			}
		},
		onShareAppMessage() {
			return {
				title: this.$store.state.shareTitle,
				path: this.$store.state.sharePath,
				imageUrl: this.product.packing_pic,
			}
		},
		onLoad({
			id
		}) {
			const _this = this;
			let systemMsg = this.$util.SystemInfo.system;
			// #ifdef H5
			if (systemMsg.search(/iOS/i)>-1) {
				let num = systemMsg.split(' ')[1].replace(/\./g,'').substring(0,3);
				if (num>132){
					this.shakeSwitch = true;
				}
			}
			// #endif
			uni.setNavigationBarTitle({
				title: this.$store.state.titleName
			})
			this.id = id;
			// 声明音频实例
			this.audioCtx = uni.createInnerAudioContext();
			// 监听摇一摇事件
			// #ifdef MP-WEIXIN
			uni.onAccelerometerChange(this.starshake);
			// #endif
			// #ifdef H5
			if (this.$util.SystemInfo.platform == 'ios') {
				if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
					window.DeviceOrientationEvent.requestPermission().then(state => {
						if (state === "granted") {
							uni.onAccelerometerChange(this.starshake);
						} else {
							uni.showModal({
								title: '系统提示',
								content: '是否开启陀螺仪',
								success: res => {
									if (res.confirm) {
										window.DeviceOrientationEvent.requestPermission().then(state => {
											if (state === "granted") {
												uni.onAccelerometerChange(this.starshake);
												uni.showToast({
													title: '陀螺仪已启动'
												})
											}
										})
									}
								}
							})
						}
					})
				}else{
					if(window.DeviceMotionEvent){
						window.addEventListener('devicemotion', function(event) {
							_this.listenIos(event);
						});
					}
				}
			} else {
				uni.onAccelerometerChange(this.starshake);
			}
			// #endif


		},
		onUnload() {
			uni.stopAccelerometer();
		},
		methods: {
			/**
			 * ****************************************************************************************************
			 * @description 获取详情
			 * ****************************************************************************************************
			 */
			getDetail() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/machineproductdetail`,
						data: {
							id: this.id
						},
						loading: false
					}).then((res) => {
						this.product = res;
						uni.setStorage({
							key: 'restorePrice',
							data: res.price
						})
						resolve(res);
					}).catch(res => {
						console.log(res);
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取道具
			 * ****************************************************************************************************
			 */
			getProps() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/cardlist`,
						loading: false
					}).then((res) => {
						this.helpDesc =
							`<p class="tt">记录卡</p>
							<p class="ctt">${res[0].desc}</p>
							<br/>
							<p class="tt">提示卡</p>
							<p class="ctt">${res[1].desc}<br/>兑换一张提示卡消费${res[1].explain_point}积分</p>
							<br/>
							<p class="tt">透视卡</p>
							<p class="ctt">${res[2].desc}<br/>兑换一张显示卡消费${res[2].explain_point}积分 </p>`;
						this.props = res;
						resolve(res);
					}).catch(res => {
						console.log(res)
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 获取我的道具
			 * ****************************************************************************************************
			 */
			getMyProps() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/productcardrecode`,
						data: {
							id: this.product.id
						},
					}).then((res) => {
						resolve(res)
					}).catch(res => {
						console.log(res)
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 道具说明
			 * ****************************************************************************************************
			 */
			help() {
				this.$refs.toast2.open({
					title: '道具说明',
					desc: this.helpDesc
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 就买它
			 * ****************************************************************************************************
			 */
			buy() {
				this.$refs.orderConfirm.open(this.product, this.packageSettings, this.$store.getters.getName)
			},
			handleDeviceMotion(event) {
				uni.showModal({
					title: '系统提示',
					content: '1'
				})
			},
			/**
			 * ****************************************************************************************************
			 * @description 监听摇一摇具体业务
			 * ****************************************************************************************************
			 */
			starshake({
				x,
				y,
				z
			}) {
				if (!this.shakes) {
					//记录当前时间
					let nowTime = new Date().getTime();

					//如果这次摇的时间距离上次摇的时间有一定间隔 才执行
					if (nowTime - this.global.lastTime > this.global.intervalTime) {

						let diffTime = nowTime - this.global.lastTime; //记录时间段
						this.global.lastTime = nowTime; // 记录本次摇动时间，为下次计算摇动时间做准备

						// 速度计算
						let speed = (Math.abs(x + y + z - this.global.lastX - this.global.lastY - this.global.lastZ) / diffTime) * 10000;

						//如果计算出来的速度超过了阈值，那么就算作用户成功摇一摇
						if (speed > this.global.shakeSpeed) {
							this.shakes = true;
							//终止回调
							uni.stopAccelerometer();

							//播放视频
							this.audioCtx.src =
								'https://lg-fe2b58o2-1255788064.cos.ap-shanghai.myqcloud.com/shark.mp3';
							this.audioCtx.play();

							// 关闭摇一摇 ，并开始提示
							this.useCard(1)
						}
						//赋值，为下一次计算做准备
						this.global.lastX = x;
						this.global.lastY = y;
						this.global.lastZ = z;
					}

				}
			},
			
			// 监听ios低版本摇一摇
			listenIos:function (e) {
			
				let x = e.acceleration.x;
				let y = e.acceleration.y;
				let z = e.acceleration.z;
				let lastX = 0;
				let lastY = 0;
				let lastZ = 0;
				let speed = 15;
				if (!this.shakes) {
					//记录当前时间
					let nowTime = new Date().getTime();
				
					//如果这次摇的时间距离上次摇的时间有一定间隔 才执行
					if (nowTime - this.global.lastTime > this.global.intervalTime) {
			
					 if (Math.abs(x - lastX) > speed || Math.abs(y - lastY) > speed) {
					  this.shakes = true;
					  
					  window.removeEventListener('devicemotion', function(event) {
						console.log('移除监听事件')
					  });
					  //播放视频
					  this.audioCtx.src =
						'https://lg-fe2b58o2-1255788064.cos.ap-shanghai.myqcloud.com/shark.mp3';
					  this.audioCtx.play();
		
					  // 关闭摇一摇 ，并开始提示
					  this.useCard(1)
					 }
					 lastX = x;
					 lastY = y;
					}
			
				}
			},
			
			// ios13.3版本以上主动获取授权
			openPermission:function () {
				// #ifdef H5
					if (this.$util.SystemInfo.platform == 'ios') {
						if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
							window.DeviceOrientationEvent.requestPermission().then(state => {
								if (state === "granted") {
									uni.onAccelerometerChange(this.starshake);
								} else {
									uni.showModal({
										title: '系统提示',
										content: '是否开启陀螺仪',
										success: res => {
											if (res.confirm) {
												window.DeviceOrientationEvent.requestPermission().then(state => {
													if (state === "granted") {
														uni.onAccelerometerChange(this.starshake);
														uni.showToast({
															title: '陀螺仪已启动'
														})
													}
												})
											}
										}
									})
								}
							})
						}
					}
				// #endif
			},

			/**
			 * ****************************************************************************************************
			 * @description 关闭摇一摇提示
			 * ****************************************************************************************************
			 */
			closeToast() {
				const that = this;
				// #ifdef MP-WEIXIN
				uni.startAccelerometer();
				// #endif
				this.shakes = false;
				// #ifdef H5
				if (this.$util.SystemInfo.platform == 'ios') {
				  if (window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission) {
					if(window.DeviceMotionEvent){
					  window.addEventListener('devicemotion', function(event) {
						that.listenIos(event);
					  });
					}
				  }else{
					uni.startAccelerometer();
				  }
				}else{
				  uni.startAccelerometer();
				}
				// #endif
			},

			/**
			 * ****************************************************************************************************
			 * @description 点击提示卡
			 * @param {number} cardId  卡券id
			 * ****************************************************************************************************
			 */
			async clickCard(cardId) {
				await this.getUserInfo();
				if (cardId == 1) {
					let desc = '';
					this.getMyProps().then(({
						record_card
					}) => {
						if (record_card.count == 0) {
							desc = '暂无记录'
						} else {
							record_card.info.forEach(item => {
								desc += item.tips + '<br/>'
							})
						}
						this.$refs.toast2.open({
							title: '记录卡',
							desc: desc
						})
					})

				} else {
					this.getMyProps().then(res => {
						this.$refs['card' + cardId].open({
							integral: this.integral,
							consume: this.props[cardId - 1].explain_point,
							nums: cardId == 2 ? res.tips_card.is_count : res.trans_card.is_count,
							cardId: cardId
						})
					});
				}

			},

			/**
			 * ****************************************************************************************************
			 * @description 使用提示卡
			 * @param {number} cardId  卡券id
			 * ****************************************************************************************************
			 */
			useCard(cardId) {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/paycard`,
						data: {
							id: this.product.id,
							card_id: cardId,
							point: ''
						},
					}).then((res) => {
						if (cardId == 1) {
							this.$refs.toast1.open({
								title: '摇一摇提示',
								desc: res.tips
							})
							this.getMyProps().then(res => {
								this.times = res.record_card.count;
							})
						} else if (cardId == 2) {
							this.$refs.toast2.open({
								title: '提示卡',
								desc: res.tips
							})
						} else {
							this.$refs.toast2.open({
								title: '透视卡',
								desc: res.tips
							})
						}

						resolve(res)
					}).catch(err => {
						uni.showModal({
							title: '系统提示',
							content: err.msg
						})
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 使用卡
			 * @param {string} type 卡片类型
			 * @param {string} integral 积分数
			 * @param {string} consume 消耗积分
			 * @param {string} checked 选择结果
			 * ****************************************************************************************************
			 */
			sure({
				type,
				integral,
				consume,
				checked,
				nums,
				cardId
			}) {
				let title, content;
				// 如果积分
				if (checked == 0) {
					if (integral - consume > 0) {
						title = `当前积分：${integral}积分`;
						content = `是否消耗${consume}积分使用一张${type}？`;
					} else {
						uni.showToast({
							title: `积分不足`,
							icon: 'none'
						})
						return false;
					}

				}
				// 如果使用已有卡片
				else {
					if (nums > 0) {
						title = `当前${type}：${nums}`;
						content = `是否消耗一张${type}？`;
					} else {
						uni.showToast({
							title: `${type}数量不足`,
							icon: 'none'
						})
						return false;
					}

				}

				//关闭选择方式
				this.$refs['card' + cardId].close();

				//确认提示
				uni.showModal({
					title: title,
					content: content,
					success: (res) => {
						if (res.confirm) {
							if (checked == 0) {
								this.buyCards(cardId);
							} else {
								this.useCard(cardId);
							}

						}
					}
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 换一个
			 * ****************************************************************************************************
			 */
			changeOne() {
				this.productState = 2;
				setTimeout(() => {
					this.$RQST({
						url: `${this.$API}/nextmachineproductdetail`,
						data: {
							id: this.product.id,
							machine_id: this.product.machine_id
						}
					}).then((res) => {
						this.product = res[0];
						this.productState = 1;
						uni.startAccelerometer();
						this.shakes = false;
					}).catch(err => {
						console.log(err)
					})
				}, 800)

			},

			/**
			 * ****************************************************************************************************
			 * @description 获取用户信息
			 * ****************************************************************************************************
			 */
			getUserInfo() {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/users/account`,
						loading: false
					}).then((res) => {
						this.integral = res.point;
						resolve(res);
					}).catch(err => {
						console.log(err)
					})
				})
			},

			/**
			 * ****************************************************************************************************
			 * @description 购买卡券
			 * @param {number} cardId 卡券id
			 * ****************************************************************************************************
			 */
			buyCards(cardId) {
				return new Promise((resolve, reject) => {
					this.$RQST({
						url: `${this.$API}/buycard`,
						data: {
							card_id: cardId
						},
						loading: false
					}).then((res) => {
						this.useCard(cardId);
						resolve(res);
					}).catch(err => {
						console.log(err)
					})
				})
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
						},
						loading: false
					}).then(({
						values
					}) => {
						this.packageSettings = values;
						resolve({
							values
						})
					}).catch(err => {
						console.log(err)
					})
				})
			},
		},
		async mounted() {
			this.productState = 1;
			this.getProps();
			this.getShipping();
			await this.getDetail();
			this.getMyProps().then(({
				record_card: {
					count
				}
			}) => {
				this.times = count;
			});
		}
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
	}

	/* content */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100%;
		padding-bottom: 150rpx;
		box-sizing: border-box;
	}

	/* shake */
	.shake {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx;

		image {
			width: 61rpx;
			height: 69rpx;
		}
		
		>text{
			width: 100%;
			display: inline-block;
			text-align: center;
			color: #888888;
			font-size: 22rpx;
			margin-top: 20rpx;
		}

		view {
			color: $cl-gray3;
			margin-top: 20rpx;
		}
	}

	// product
	.product {
		width: 434rpx;
		height: 434rpx;
		transform: translate(0, -200%);

		&.active {
			animation: ins .8s ease forwards;
		}

		&.leave {
			animation: outs .8s ease forwards;
		}
	}

	@keyframes ins {
		0% {
			transform: translate(0, -150%);
		}

		40% {
			transform: translate(0, 20%);
		}

		60% {
			transform: translate(0, -10%);
		}

		80% {
			transform: translate(0, 10%);
		}

		100% {
			transform: translate(0, 0);
		}
	}

	@keyframes outs {
		0% {
			transform: translate(0, 0);
		}

		70% {
			transform: translate(0, 0) scale(.5);
		}

		100% {
			transform: translate(-150%, 0) scale(.5);
		}
	}

	// id-wrap
	.id-wrap {
		width: 510rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20rpx;

		.id {
			font-size: $fs-22;
			color: $cl-gray3;
		}

		.help {
			width: 30rpx;
			height: 30rpx;
			background-color: $cl-main;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: $fs-22;
			color: $cl-white;
		}
	}

	// cards
	.cards {
		width: 510rpx;
		margin-top: 40rpx;
		display: flex;
		justify-content: space-between;

		.card {
			width: 138rpx;
			height: 80rpx;
			border-radius: $radius-30;
			background-color: $cl-white;
			border: 2rpx solid $cl-main;
			display: flex;
			justify-content: center;
			align-items: center;
			color: $cl-main;
			font-family: phM;
		}
	}

	// btns
	.btns {
		width: 640rpx;
		margin-top: 80rpx;
		display: flex;
		justify-content: space-between;

		.btn {
			width: 288rpx;
			height: 100rpx;
			border-radius: 50rpx;

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
		width: 100%;
		font-size: $fs-22;
		color: $cl-gray3;
		line-height: 30rpx;
		text-align: center;
		position: absolute;
		left: 0;
		bottom: 64rpx;
	}
</style>
