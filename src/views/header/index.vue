<template>
  <header>
    <div class="left">
      <img @click="$router.push('/')" class="logo" :src="logo" alt="" />
    </div>
    <div class="right">
      <van-icon @click="introProduct" class="question-icon" name="question-o" />
      <div v-if="isLogin">
        <van-button plain size="small" @click="newTopic" round icon="plus" type="primary">新提问</van-button>
        <van-button
          @click="$router.push('/topic/history')"
          plain
          style="margin: 0 10px"
          size="small"
          round
          icon="todo-list-o"
          type="primary"
        ></van-button>
      </div>
      <div class="account">
        <van-popover
          className="account-select"
          v-if="isLogin"
          placement="bottom-end"
          v-model="showPopover"
          trigger="click"
          :actions="actions"
          @select="handleCommand"
        >
          <template #reference>
            <div class="head-portrait">
              <img v-if="userData.picUrl" :src="userData.picUrl" alt="" />
              <i v-else class="el-icon-s-custom"></i>
            </div>
          </template>
        </van-popover>
        <van-button size="small" v-else type="primary" @click="$router.push('/login')" plain>登录/注册</van-button>
      </div>
    </div>
    <van-dialog
      showCancelButton
      @confirm="submitFeedback"
      :before-close="beforeClose"
      :z-index="1000"
      title=""
      v-model="fdDiaShow"
    >
      <van-field
        type="textarea"
        label="反馈"
        :rows="6"
        placeholder="想要了解什么知识？欢迎向我们提出需求！"
        v-model="feedbackVal"
      >
      </van-field>
      <!-- <div style="text-align: center; margin: 20px 0 0 0">
        <el-button size="medium" type="primary" @click="submitFeedback" style="width: 100px">提 交</el-button>
      </div> -->
    </van-dialog>
  </header>
</template>

<script>
// <van-icon name="exchange" />
import secLogin from "views/login/index.vue";
import { logoutApi, feedbackApi, agentListApi, customerInfoApi } from "api";
import { Dialog } from "vant";
export default {
  name: "secHeader",
  props: {},
  components: { secLogin },
  data() {
    return {
      showPopover: false,
      actions: [
        { text: "个人资料", icon: "manager-o", command: "perInfo" },
        { text: "我要反馈", icon: "envelop-o", command: "feedback" },
        { text: "退出登录", icon: "exchange", command: "logout" },
      ],
      logo: require("@/assets/imgs/logoNewAlign.png"),
      fdDiaShow: false,
      feedbackVal: "",
      isLogin: false,
      userData: {},
    };
  },
  computed: {},
  mounted() {
    //无效的token
    this.$EventBus.$on("voidToken", () => {
      localStorage.setItem("accessToken", "");
      window.location.reload();
    });
    this.$EventBus.$on("goLogin", () => {
      this.$router.push({ path: "/login" });
    });
    this.isLogin = this.utils.isLogin();
    this.isLogin && this.getUserInfo(); //获取用户信息
  },
  methods: {
    introProduct() {
      window.open("https://fbtlbah76l.feishu.cn/wiki/AVVowsD9Ui4sDVkBDlecb19Pnph?from=from_copylink");
    },
    newTopic() {
      let agentId = localStorage.getItem("agentId");
      this.utils.setSessionId(agentId, "");
      console.log("[ this.$route.path ] >", this.$route);
      if (this.$route.path === "/ai") {
        this.$emit("updatePage");
      } else {
        this.$router.push("/");
      }
    },
    //新建对话
    setUpTopic(value) {
      this.newQuestion = value || ""; //通过他决定新建对话并且直接发送问答
      sessionAddApi({ ...this.utils.getComParams(), agentId: this.agentId, sessionName: value || "默认话题" }).then(
        (res) => {
          this.sessionListByRole("create");
        }
      );
    },
    getUserInfo() {
      let accessToken = window.localStorage.getItem("accessToken");
      customerInfoApi({ accessToken }).then((res) => {
        let data = res.data;
        this.userData = data;
        this.$store.commit("setUserData", data);
      });
    },
    handleCommand(action) {
      let { command } = action;
      if (command === "feedback") {
        this.fdDiaShow = true;
      } else if (command === "perInfo") {
        this.$router.push({ path: "/person" });
      } else if (command === "logout") {
        Dialog.confirm({ message: "确定要退出系统吗?" }).then(() => {
          let accessToken = window.localStorage.getItem("accessToken");
          logoutApi({ accessToken }).then((res) => {
            let state = this.message.state(res, ["退出登录成功"]);
            if (!state) return;
            // this.reset();
            localStorage.setItem("accessToken", "");
            window.location.reload();
          });
        });
      }
    },
    // async reset() {
    //   localStorage.setItem("accessToken", "");
    //   localStorage.setItem("agentId", "");
    //   localStorage.setItem("sessionId", "");
    //   await agentListApi(this.utils.getComParams()).then((res) => {
    //     this.roles = res.data.agentList;
    //   });
    //   this.roles.forEach((item) => {
    //     let sessionIdKey = `${item.agentId}-sessionId`;
    //     localStorage.setItem(sessionIdKey, "");
    //   });
    //   if (this.$route.path === "/ai") {
    //     this.$emit("updatePage");
    //   } else {
    //     this.$router.push("/");
    //   }
    // },
    beforeClose(action, done) {
      if (action === "confirm") {
        return this.feedbackVal ? done() : done(false);
      } else {
        return done();
      }
    },
    submitFeedback() {
      if (!this.feedbackVal) {
        this.message.warning({ message: "请输入内容" });
        return;
      }
      feedbackApi({ ...this.utils.getComParams(), feedback: this.feedbackVal }).then((res) => {
        let state = this.message.state(res, ["反馈成功"]);
        if (!state) return;
        this.feedbackVal = "";
        this.fdDiaShow = false;
      });
    },
  },
  watch: {},
};
</script>
<style lang="scss">
.question-icon {
  font-size: 20px;
  color: $themeColor;
  margin-right: 10px;
}
.account-select {
  font-size: 13px;
}
.van-popover__action {
  font-size: 13px;
}
.van-popover__action-icon {
  font-size: 14px;
}
</style>
<style lang="scss" scoped>
//@import url(); 引入公共css类

header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  color: rgb(51, 51, 51);
  // background: #fff;
  height: $headerHeight;
  // box-shadow: rgb(219, 219, 219) 0px 1px 0px;
  // border-bottom: 1px solid rgb(219, 219, 219);
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  z-index: 100;
  background: #fff;
  padding: 0 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  .left {
    display: flex;
    justify-content: center;
    // align-items: center;
    padding-top: 5px;
    // width: 200px;
    height: 100%;
    font-size: 12px;
    overflow: hidden;
  }
  .logo-title {
    text-align: center;
    p:first-child {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      font-family: serif;
    }
    p:nth-child(2) {
      letter-spacing: 2px;
      font-size: 0.65em;
      // transform: translateX(0) scale(0.7);
    }
  }
  .logo {
    // width: 150px;
    height: 28px;
    cursor: pointer;
    margin-top: 5px;
  }
  .right {
    display: flex;
    align-items: center;
    .list {
      margin-right: 15px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      font-size: 14px;
      i {
        font-size: 18px;
        color: $themeColor;
        margin-left: 5px;
      }
    }
  }
}
.head-portrait {
  width: 35px;
  height: 35px;
  border: 1px solid #dbdbdb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  i {
    font-size: 20px;
    color: $themeColor;
  }
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    padding: 2px;
  }
  &:hover {
    border: 1px solid $themeColor;
    // color: $themeColor;
  }
}
.tel {
  text-align: center;
  padding: 5px 0;
}
</style>
