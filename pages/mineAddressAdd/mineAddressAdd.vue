<template>
	<!-- 添加收货地址 -->
	<view class="content">
		<view class="add-address">
			<view class="box">
				<text>收货人：</text>
				<input type="text" v-model="name" placeholder="请输入收货人姓名"/>
			</view>
			<view class="box">
				<text>联系电话：</text>
				<input type="text" v-model="phone" placeholder="请输入联系方式"/>
			</view>
			<view class="box">
				<text>所在地区：</text>
				<region @change="changeRegion"></region>
				<text class="arr"></text>
			</view>
			<view class="box top">
				<text>详细地址：</text>
				<textarea :class="{'ios':ios}" value="" placeholder="请填写详细地址" placeholder-style="line-height:2" v-model="detail"/>
			</view>
			<view class="box">
				<text>设置默认地址：</text>
				<view :class="['select',{'active':defaultAddress}]" @click="selectDefault"></view>
			</view>
			<view class="confirm-btn" @click="toSave">保 存</view>
		</view>
	</view>
</template>

<script>
	import region from '@/components/biaofunRegion/biaofunRegion.vue';
	export default {
		components: {
			region
		},
		data() {
			return {
				name:'',					// 收货人
				phone:'',					// 联系电话
				address:'',				// 所在地区
				detail:'',				// 详细地址
				defaultAddress:false,				// 是否勾选默认地址
				region:'',					// 地区列表
				code:'',						// 地区id列表
				ios:false,					// 是否是iphone
			}
		},
		onLoad() {
			if (this.$util.SystemInfo.platform=='ios') {
				this.ios = true;
			}
		},
		methods: {
			// 设置默认地址
			selectDefault:function () {
				this.defaultAddress = !this.defaultAddress;
			},
			// 选择省市区
			changeRegion:function (region) {
				let str = '';
				let code = '';
				region.forEach((el)=>{
					str = str + el.name + ',';
					code = code + el.id + ',';
				});
				this.code = code.substring(0,code.length - 1);
				this.region = str.substring(0,str.length - 1);
			},
			// 点击保存
			toSave:function () {
				const that = this;
				var regPhone = /(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}/;
				if (!this.name) {
					uni.showToast({title:'请填写收货人',icon:'none'});
					return false;
				}
				if (!this.phone) {
					uni.showToast({title:'请填写联系方式',icon:'none'});
					return false;
				}
				if (!regPhone.test(this.phone)) {
					uni.showToast({title:'请填写正确的联系方式',icon:'none'});
					return false;
				}
				if (!this.region) {
					uni.showToast({title:'请选择所在地区',icon:'none'});
					return false;
				}
				if (!this.detail) {
					uni.showToast({title:'请填写详细地址',icon:'none'});
					return false;
				}
				that.$RQST({
					url: `${this.$API}/users/address/create`,
					data:{
						name:that.name,
						telephone:that.phone,
						region:that.region,
						address:that.detail,
						is_default:that.defaultAddress,
						code:that.code
					}
				}).then((res) => {
					console.log(res);
					uni.showToast({
						title:'添加收获地址成功',
						icon:'none',
						success() {
							uni.redirectTo({url:'/pages/mineAddress/mineAddress'})
						}
					})
				}).catch((err) => {
					console.log(err);
				})
			},
		},
	}
</script>

<style lang="scss">
	/* #ifdef MP-WEIXIN */
	page{height: 100%;}
	/* #endif */
	uni-page-body,.content{height: 100%;}
	.add-address{
		width: 100%;
		padding: 20rpx;
		min-height: calc(100% - 230rpx);
		.box.top{
			align-items: flex-start;
			padding: 30rpx 40rpx;
			text{
				line-height: 1.2;
			}
		}
		.box{
			width: 100%;
			border-radius: $fs-30;
			background: $cl-white;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 40rpx;
			margin-bottom: 20rpx;
			text{
				color: $cl-black;
				font-size: $fs-34;
				line-height: 100rpx;
				flex-shrink: 0;
				margin-right: 20rpx;
			}
			.arr{
				width: 20rpx;
				height: 20rpx;
				border-top: 4rpx solid #B3B3B3;
				border-right: 4rpx solid #B3B3B3;
				transform: rotate(45deg);
			}
			input{
				width: 100%;
				font-size: $fs-34;
			}
			textarea{
				font-size: $fs-34;
				padding: 0;
				margin: 0;
			}
			.ios{
				margin-top: -14rpx;
			}
		}
	}
	.select{
		width:38rpx;
		height:38rpx;
		border:2rpx solid $cl-main;
		border-radius:50%;
	}
	.select.active{
		background: $cl-main;
	}
	.confirm-btn{
		position: absolute;
		left: 45rpx;
		bottom: 100rpx;
		width: 660rpx;
		height:100rpx;
		line-height: 100rpx;
		background:rgba(0,205,164,1);
		border-radius:50rpx;
		text-align: center;
		color: $cl-white;
		font-size: $fs-34;
	}
</style>
