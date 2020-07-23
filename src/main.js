import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入Element-UI相关资源
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 导入字体图标库
import './assets/fonts/iconfont.css'
// 导入vue-table-with-tree-grid
import ZkTable from 'vue-table-with-tree-grid'
// 导入axios
import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 最后必须返回config
  return config;
})
Vue.prototype.$http = axios;

Vue.use(ElementUI);
Vue.component('tree-table', ZkTable);

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
