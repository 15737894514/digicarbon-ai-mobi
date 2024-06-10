import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// 引入全部样式
import "vant/lib/index.less";
import Vant from "vant";
Vue.use(Vant);

import ElementUI from "element-ui";
import "@/styles/index.scss";
import { config } from "./config";
Vue.prototype.config = config;
import { getHost } from "@/utils/config";

//加载loading
import { openLoading } from "@/common/js/loading.js";
Vue.prototype.openLoading = openLoading;
//提示信息
import DonMessage from "@/common/js/message.js";
Vue.prototype.message = new DonMessage(); //消息提示
//全局通用的工具函数
import * as utils from "@/utils/index";
Vue.prototype.utils = utils;
utils.initUseCount(); //定时每天凌晨清除使用大模型次数

Vue.prototype.$EventBus = new Vue();

Vue.use(ElementUI, { size: "small", zIndex: 3000 });

Vue.config.productionTip = false;

//手机端和pc端跳转的路径
router.beforeEach((to, from, next) => {
  if (
    /AppleWebKit.*Mobile/i.test(navigator.userAgent) ||
    /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(
      navigator.userAgent
    )
  ) {
    if (window.location.href.indexOf("?mobile") < 0) {
      try {
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
          next();
        } else {
          window.location.href = getHost[process.env["VUE_APP_ENV"]];
          return;
        }
      } catch (e) {
        next();
      }
    }
  }
  next();
});

const $vue = new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
export default $vue;
