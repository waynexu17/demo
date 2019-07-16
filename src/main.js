// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Es6Promise from 'es6-promise'
import './utils/rem.js'
import Vue from 'vue'
import App from './App'
import router from './router'
import request from '@/utils/request'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'
import './assets/styles/reset.css'
require('es6-promise').polyfill()
Es6Promise.polyfill()
Vue.prototype.$request = request
Vue.use(VueAwesomeSwiper)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
