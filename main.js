import Vue from 'vue'
import App from './App'
import store from './store/index'
import {
	$API,
	$PNG,
	$JUMP,
	myRequest
} from './assets/http'
import util from './assets/util.js'


Vue.config.productionTip = false;

App.mpType = 'app';

Vue.prototype.$API = $API;
Vue.prototype.$PNG = $PNG;
Vue.prototype.$JUMP = $JUMP;
Vue.prototype.$RQST = myRequest;
Vue.prototype.$util = util;
Vue.prototype.$Pid = 'wx67f2e191aead66f7';

// #ifdef H5
util.getSDK()
// #endif

const app = new Vue({
	...App,
	store,
})

app.$mount()
