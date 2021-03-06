// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './utils/sw-register'

// lazyload
import VueLazyload from 'vue-lazyload'

Vue.config.productionTip = false

// Install lazyload
Vue.use(VueLazyload, {
  dispatchEvent: true
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
