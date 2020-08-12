<template>
	<!-- 编辑收货地址 -->
	<view class="content">
		<view class="add-address">
			<view class="box">
				<text>收货人：</text>
				<input type="text" v-model="name" placeholder="请输入收货人姓名"/>
			</view>
			<view class="box">
				<text>联系电话：</text>
				<input type="text" v-model="phone" placeholder="请输入手机号"/>
			</view>
			<view class="box">
				<text>所在地区：</text>
				<region @change="changeRegion" @edit="defaultEdit" :defaultValue="address"></region>
				<text class="arr"></text>
			</view>
			<view class="box top">
				<text>详细地址：</text>
				<textarea :class="{'ios':ios}" value="" placeholder="请填写详细地址" v-model="detail"/>
			</view>
<!-- 			<view class="box">
				<text>设置默认地址：</text>
				<view :class="['select',{'active':defaultAddress}]" @click="selectDefault"></view>
			</view> -->
			<view class="mod-box">
				<view class="confirm-btn" @click="toDele">删除</view>
				<view class="confirm-btn" @click="toSave">保存</view>
			</view>
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
				id:'',						// 收货地址id
				name:'',					// 收货人
				phone:'',					// 联系电话
				address:[],				// 所在地区
				detail:'',				// 详细地址
				defaultAddress:false,				// 是否勾选默认地址
				region:'',					// 地区列表
				code:'',						// 地区id列表
				ios:false,					// 是否是iphone
			}
		},
		onLoad(options) {
			this.id = options.id;
			if (this.$util.SystemInfo.platform=='ios') {
				this.ios = true;
			}
		},
		onShow() {
			this.requestDetail();
		},
		methods: {
			// 设置默认地址
			selectDefault:function () {
				this.defaultAddress = !this.defaultAddress;
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
					url: `${this.$API}/users/address/update`,
					data:{
						id:that.id,
						name:that.name,
						telephone:that.phone,
						region:that.region,
						address:that.detail,
						code:that.code
					}
				}).then((res) => {
					console.log(res);
					uni.showToast({
						title:'收获地址修改成功',
						icon:'none',
						success() {
							uni.redirectTo({url:'/pages/mineAddress/mineAddress'})
						}
					})
				}).catch((err) => {
					console.log(err);
				})
			},
			// 点击删除
			toDele:function () {
				const that = this;
				if(that.defaultAddress){
					uni.showToast({title:'默认地址不可删除~',icon:'none'});
				}else{
					that.$RQST({
						url: `${this.$API}/users/address/remove`,
						data:{
							id:that.id
						}
					}).then((res) => {
						console.log(res);
						uni.showToast({
							title:'删除成功',
							icon:'none',
							success() {
								uni.navigateTo({url:'/pages/mineAddress/mineAddress'})
							}
						})
					}).catch((err) => {
						console.log(err);
					})
				}
			},
			// 选择省市区
			changeRegion:function (region) {
				console.log(region)
				let str = '';
				let code = '';
				region.forEach((el)=>{
					str = str + el.name + ',';
					code = code + el.id + ',';
				});
				this.code = code.substring(0,code.length - 1);
				this.region = str.substring(0,str.length - 1);
			},
			// 请求地址详情
			requestDetail:function () {
				const that = this;
				that.$RQST({
					url: `${this.$API}/users/address/details`,
					data:{
						id:that.id
					}
				}).then((res) => {
					that.name = res.name;			
					that.phone = res.telephone;					
					that.detail = res.address;			
					that.defaultAddress = res.is_default;			
					that.address = res.region;
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
	.mod-box{
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		position: absolute;
		left: 0;
		bottom: 100rpx;
		.confirm-btn{
			width: 42%;
			height:100rpx;
			line-height: 100rpx;
			background:rgba(0,205,164,1);
			border-radius:50rpx;
			text-align: center;
			color: $cl-white;
			font-size: $fs-34;
		}
	}
	
</style>
