import Vue from 'vue'
import Vuex from 'vuex'
import { $PNG } from '../assets/http.js'
import {
	$API,
	myRequest
} from '../assets/http'
Vue.use(Vuex)

const store = new Vuex.Store({

	//全局参数
	state: {
		login: true,
		socket: null,
		clientId: 0,
		music: null,
		name:'',
		phone:false,
		titleName:'',
		shareTitle:'贪玩集',
		sharePath:'/pages/index/index',
		shareImage:`${$PNG}/shareImg.jpg`,
	},

	//同步修改全局参数
	mutations: {
		startSocker: (state, callback) => {
			uni.showLoading({
				title:'加载中'
			})
			state.socket = uni.connectSocket({
				url: 'wss://xwq.biaofun.com',
				success(res) {
					console.log(res);
				},
				fail(err){
					console.log(err);
				}
			})
			state.socket.onOpen((res) => {
				let data = {
					type: 'bind_id',
					user_id: uni.getStorageSync('userInfo').id + ''
				}
				uni.hideLoading();
				// 注：只有连接正常打开中 ，才能正常收到消息
				state.socket.send({
					data: JSON.stringify(data),
					success: (result) => {
					},
					fail: (err) => {
					}
				})
			})
			state.socket.onMessage((result) => {
				let data= JSON.parse(result.data);
				if (data.client_id) {
					state.clientId = JSON.parse(result.data).client_id;
					callback(1)
				}
				if(data.type=='alert_fail'){
					state.socket.close();
					uni.showModal({
						title:'系统提示',
						content:data.msg
					})
				}
				if(data.type=='alert_success'){
					// uni.showModal({
					// 	title:'系统提示',
					// 	content:data.msg,
					// 	success:(res1)=> {
					// 		if(res1.confirm){
					// 			uni.redirectTo({
					// 				url:`/pages/lottery/lottery?id=${data.data.series_id}&machineID=${data.data.id}`
					// 			})
					// 		}
					// 	}
					// })
					callback(3,data);
				}
				if(data.type=='info'){
					callback(2);
				}
				
				
			});


			// 这里仅是事件监听【如果socket关闭了会执行】
			state.socket.onClose(() => {
				state.socket = null;
			})

		},
		createMusic: state => {
			myRequest({
				url: `${$API}/moduledetail`,
				data: {
					tables: 'appMusic'
				}
			}).then(res => {
				state.music = uni.createInnerAudioContext();
				state.music.src = res.values.file.url;
				state.music.autoplay = false;
				state.music.loop = true;
				if(uni.getStorageSync('userInfo')){
					if (uni.getStorageSync('userInfo').configs.sound) {
						state.music.play()
					} else {
						state.music.stop()
					}
				}else{
					state.music.play()
				}
			})

		},
		openMusic: state => {
			state.music.play()
		},
		closeMusic: state => {
			state.music.stop()
		},
		changeName:(state,str)=>{
			state.name = str;
		},
		changeTitle:(state,str)=>{
			state.titleName = str;
		},
		bindPhone: (state,ifBind) =>{
			state.phone = ifBind
		}
	},

	//获取全局参数
	getters: {
		getSocket: state => state.socket,
		getclientId: state => state.clientId,
		getName: state => state.name,
	},

	//异步修改全局参数
	actions: {

	},

	//模块
	modules: {


	}

})

export default store
