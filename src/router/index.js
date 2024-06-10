import Vue from "vue";
import VueRouter from "vue-router";

// hack router push callback
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
};

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/ai" },
  {
    path: "/login", //登录界面
    component: () => import(/* webpackChunkName: "home" */ "@/views/login/index.vue"),
  },
  {
    path: "/ai", //ai对话界面（首页）
    component: () => import(/* webpackChunkName: "home" */ "@/views/home/index.vue"),
  },
  {
    path: "/roles", //所有角色界面
    component: () => import(/* webpackChunkName: "home" */ "@/views/roles/index.vue"),
  },
  {
    path: "/topic/history", //所有话题列表
    component: () => import(/* webpackChunkName: "home" */ "@/views/topicHistory"),
  },
  {
    path: "/person", //个人信息
    component: () => import(/* webpackChunkName: "home" */ "@/views/personInfo"),
  },
  {
    path: "/protocol", //协议
    component: () => import(/* webpackChunkName: "AI" */ "@/views/protocol"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: "mobi",
  routes,
});

export default router;
