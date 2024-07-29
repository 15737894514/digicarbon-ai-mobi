<template>
  <div class="digi-ai">
    <!-- 当在ai问答进行中，其他都是不能操作的 -->
    <!-- <div class="ai-pending-layer" v-if="status === 'pending'"></div> -->
    <div class="ai-chat-container">
      <div class="ai-chat-main">
        <!-- 默认话题 -->
        <DigiChatInfo
          :agentData="$attrs.agentData"
          @getNewTopic="defaultAsk"
          v-if="agentId"
          :agentChatDesc="$attrs.agentChatDesc"
        ></DigiChatInfo>
        <!-- <digiAiDefault @getNewTopic="defaultAsk" v-if="agentId" :agentName="$attrs.agentName"></digiAiDefault> -->
        <span>
          <div class="ai-chat-content" v-for="(item, index) in data" :key="index">
            <!-- 问 -->
            <div v-if="item.role === 'user'" class="ask-content content">
              <img :src="userData.picUrl ? userData.picUrl : require(`@/assets/imgs/logo.png`)" alt="" />
              <div class="chat-value-box">
                <div class="chat-value">{{ item.message }}</div>
              </div>
              <div class="opt-box">
                <el-tooltip effect="dark" content="复制" placement="top">
                  <el-button
                    size="mini"
                    plain
                    circle
                    @click="copyActive($event, item)"
                    icon="el-icon-copy-document"
                  ></el-button>
                </el-tooltip>
              </div>
            </div>
            <!-- ai 回答 -->
            <div v-else class="ai-content content">
              <img :src="agentId ? $attrs.agentData.agentVersionIcon : require('@/assets/imgs/robot.webp')" alt="" />
              <div class="ai-value-box">
                <div class="chat-value">
                  <digiLoading v-if="status === 'pending' && !item.message && index === data.length - 1"></digiLoading>
                  <span class="ai-md-con" v-html="compiledMarkdown(item.message)" v-if="item.message"></span>
                  <!-- <span class="sign" v-if="status === 'pending' && item.message"></span> -->
                  <div class="opt-box">
                    <el-tooltip effect="dark" content="复制" placement="top">
                      <el-button
                        size="mini"
                        @click="copyActive($event, item)"
                        plain
                        circle
                        icon="el-icon-copy-document"
                      ></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="item.sendCode" effect="dark" content="重新生成" placement="top">
                      <el-button
                        @click="rebuild(item, index)"
                        size="mini"
                        plain
                        circle
                        icon="el-icon-refresh"
                      ></el-button>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isShowEnd" class="stop-ask">
            <el-button @click="stopClick" type="primary" plain round>
              <i class="iconfont">&#xe66d;</i> 终止对话</el-button
            >
          </div>
        </span>
      </div>
    </div>
    <div class="tas-chat-input">
      <!-- 未登录剩余使用次数 v-if="!isLogin"-->
      <!-- 默认问题气泡 -->
      <div v-if="questionShow" class="surplus">
        <div
          class="over-ellipsis qustion-btn"
          @click="defaultAsk(item)"
          :icon="item.icon"
          round
          plain
          v-for="(item, index) in btns"
          :key="index"
        >
          {{ item }}
        </div>
      </div>
      <!-- <div v-if="!isLogin && data.length !== 0" class="surplus-use-count">
        <i class="el-icon-chat-line-round"></i>
        {{ surplusUseCount === 0 ? "次数已用完" : `剩余使用次数：${surplusUseCount}（注册即免费使用）` }}
      </div> -->
      <div class="send-box">
        <van-field
          @input="(val) => (value = val)"
          @keydown.enter.native="carriageReturn($event)"
          :rows="2"
          autosize
          maxlength="1000"
          id="textarea"
          type="textarea"
          :placeholder="
            !isLogin && data.length !== 0
              ? surplusUseCount === 0
                ? '次数已用完'
                : `请输入...（剩余使用次数：${surplusUseCount}（注册即免费使用））`
              : '请输入...'
          "
          v-model="value"
        >
        </van-field>
        <el-button
          :disabled="!value"
          :loading="status === 'pending' ? true : false"
          class="send"
          icon="el-icon-position"
          @click="sendClick()"
          type="text"
        ></el-button>
      </div>
    </div>
    <van-dialog style="padding: 10px" v-model="diaShow" :show-confirm-button="false">
      <div class="ask-login">
        <p>你的免费体验次数（10次）已用尽。</p>
        <p>为保护服务连续性，请登录登录后，您将继续享有免费访问权限，并可实时追踪话题查询历史</p>
      </div>
      <div style="text-align: center; margin-top: 10px">
        <van-button @click="goLogin" round style="width: 80%" type="primary">登 录</van-button>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import digiAiDefault from "views/digiAi/default.vue";
import DigiChatInfo from "./chatInfo.vue";
import { sessionQueryApi, sessionSendV2Api, sessionKillApi } from "api";
import digiLoading from "./loading.vue";
import marked from "marked";
import { mapState } from "vuex";
import SSE from "@/utils/sse";
import { sseHost } from "@/utils/config";
let { VUE_APP_ENV } = process.env;
export default {
  name: "",
  props: {
    sessionId: String,
  },
  components: { digiAiDefault, DigiChatInfo, digiLoading },
  data() {
    return {
      questionShow: true,
      isShowEnd: false, //终止对话
      diaShow: false,
      value: "",
      data: [
        // { content: "你好", role: "user" },
        // { content: "", role: "" },
      ],
      status: "",
      sendType: 0, // 0/1 1代表重新生成
      sendCode: "", //重新生成需要的
      createTopic: false, //在默认话题界面又要新建对话的时候为true
      isLogin: false,
      surplusUseCount: 0,
      btns: [],
    };
  },
  computed: {
    ...mapState(["agentId", "userData"]),
  },
  mounted() {
    // this.btns = this.utils.getRandomQuestion(this.agentId, 3);
    this.isLogin = this.utils.isLogin();
    !this.isLogin && this.getSurplusUseCount();
  },
  methods: {
    compiledMarkdown(text) {
      let rendererMD = new marked.Renderer();
      rendererMD.link = function (href, title, text) {
        return `<a href="${href}" title="${text}" target="_blank"> ${text}</a>`;
      };
      return text ? marked(text, { gfm: true, tables: true, renderer: rendererMD }) : "";
    },
    getSurplusUseCount() {
      let useCount = localStorage.getItem("useCount") || 0;
      this.surplusUseCount = 10 - useCount;
    },
    initPage() {
      !this.createTopic && this.getSessionQuery();
    },
    getSessionQuery() {
      let agentId = this.$store.state.agentId;
      sessionQueryApi({ ...this.utils.getComParams(), agentId, sessionId: this.sessionId }).then((res) => {
        this.data = res.data.sessionHistory || [];
        this.scrollToBottom(); //内容多的时候自动给你滚动到底部
      });
    },
    copyActive(e, item) {
      this.utils.handleClipboard(e, item.message);
    },
    rebuild(item, index) {
      this.sendType = 1;
      this.sendCode = item.sendCode;
      // let questionItem = this.data[index - 1];
      let question = "";
      //获取问的内容 递归获取（由于生成多次ai回答的情况）
      let getQuestion = () => {
        let questionItem = this.data[index - 1];
        if (questionItem.role === "user") {
          question = questionItem.message;
        } else {
          index--;
          getQuestion();
        }
      };
      getQuestion();
      this.sendClick(question);
    },
    // 回车不换行 变成发送消息
    carriageReturn() {
      let e = window.event || arguments[0];
      // 英文下｜中文下： 13 Enter Enter
      // 中文下有文字没进入输入框情况是：299 Enter Enter
      if (e.key == "Enter" || e.code == "Enter" || e.keyCode == 13) {
        e.returnValue = false;
        this.sendClick();
        return false;
      }
    },
    //默认问答
    defaultAsk(item) {
      this.value = item;
      this.sendClick();
    },
    stopClick() {
      this.source.close();
      this.status = "done";
      this.isShowEnd = false;
      this.question = "";
      this.sendType = 0;
      this.createTopic = false;
      this.setRandomQuestion();
      this.questionShow = true;
    },
    sendClick(question) {
      //没登录，但是使用了10次，引导去登录
      if (!this.utils.isLogin()) {
        let useCount = localStorage.getItem("useCount");
        if (useCount >= 10) {
          this.diaShow = true;
          this.value = "";
          return;
        }
      }
      if (this.status === "pending") return;
      this.timer = null;
      this.isShowEnd = true;
      let value = this.value.replace(/\n$/, ""); //去掉最后面的\n
      this.question = value || question; //question是重新生成传过来的值
      if (!this.question) return;
      this.questionShow = false;
      //登录了，并且是在默认话题界面
      if (this.sessionId === this.config.sessionDefault && this.utils.isLogin()) {
        this.createTopic = true;
        this.$emit("createTopic", this.question); //创建一个新的话题列表（然后把对话内容给这个新的话题列表）
        return;
      } else if (this.utils.isLogin() && this.data.length === 0) {
        //登录了，但是是第一次问，更新话题列表的名字 把“默认话题”改成第一次问的值
        this.$emit("updateTopic", this.question);
      }
      this.value = ""; //清除value值

      let obj = { message: this.question, role: "user" };
      let aiCon = { role: "assistant", message: "" };
      this.aiCon = aiCon;
      //不是重新生成的时候
      if (!question) {
        this.data.push(obj);
        this.data.push(aiCon);
      } else if (this.createTopic) {
        //在默认话题（临时）创建的话题列表 第一次问的时候
        this.data.push(obj);
        this.data.push(aiCon);
      }

      this.$nextTick(() => {
        this.getAiContent(true);
        this.scrollToBottom(); //内容多的时候自动给你滚动到底部
      });
    },
    getSSEParams() {
      let agentId = this.$store.state.agentId;
      let data = {
        ...this.utils.getComParams(),
        agentId,
        sessionId: this.sessionId,
        question: this.question,
        sendType: this.sendType, // 0/1 发送/重新生成
        history: this.data.slice(0, -2),
      };
      //转数据为json字符串
      var jsondata = JSON.stringify(data);
      return jsondata;
    },
    //获取ai大模型的数据
    getAiContent() {
      this.status = "pending";
      let source = new SSE(`${sseHost[VUE_APP_ENV]}/api/llm/stream`, {
        headers: { "Content-Type": "application/json" },
        payload: this.getSSEParams(),
        method: "POST",
      }); // 替换为你的 SSE 端点 URL
      this.source = source;
      //与后台连接成功触发的监听
      source.addEventListener("open", (e) => {
        console.log("连接成功");
        // this.status = "pending";
      });

      //接收到后台数据触发监听方法
      source.addEventListener("message", (e) => {
        console.log("收到数据 event", e);
        let data = e.data;
        if (!data) return;
        let aiData = JSON.parse(data);
        console.log("[ aiData ] >", aiData);
        let message = aiData.content;
        let status = aiData["finish_reason"] || aiData["finish reason"];
        this.status = ["Error", "Stop"].includes(status) ? "done" : "pending";
        // if (this.status == "Error") return;
        this.aiCon.message += message;
        //ai 回答完成
        if (this.status === "done") {
          this.setAiContent(this.aiCon);
          this.question = "";
          this.sendType = 0;
          this.createTopic = false;
          this.isShowEnd = false;
          !this.utils.isLogin() && this.setUseCount(); //使用的次数
          this.setRandomQuestion();
          this.questionShow = true;
        } else {
          //正在进行中
          this.setAiContent(this.aiCon);
          this.first = false;
        }
      });

      //请求出错触发的监听方法
      source.addEventListener("error", (e) => {
        console.error("请求出错：", e);
        this.stopClick();
      });

      //数据传输完成关闭连接触发的监听方法
      // source.addEventListener("close", (e) => {
      //   console.log("连接关闭");
      //   this.closeHandle();
      // });

      //调用发起请求
      source.stream();
    },
    //未登录 设置使用次数
    setUseCount() {
      let useCount = localStorage.getItem("useCount") || 0;
      useCount++;
      localStorage.setItem("useCount", useCount);
      this.getSurplusUseCount();
    },
    setAiContent(aiCon) {
      this.data.splice(this.data.length - 1, 1, aiCon);
      this.scrollToBottom(); //内容多的时候自动给你滚动到底部
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let chatConEle = document.querySelector(".ai-chat-container");
        if (chatConEle) {
          chatConEle.scrollTop = chatConEle.scrollHeight;
        }
      });
    },
    goLogin() {
      this.diaShow = false;
      this.$EventBus.$emit("goLogin");
    },
    setRandomQuestion() {
      let questions = this.$attrs.agentData.agentVersionChatInfo;
      this.btns = this.utils.getRandomQuestion(questions, 3);
    },
  },
  destroy() {
    this.stopClick();
  },
  watch: {
    "$attrs.agentData": {
      deep: true,
      immediate: true,
      handler(newVal) {
        newVal && this.setRandomQuestion();
      },
    },
    sessionId: {
      deep: true,
      immediate: true,
      handler(newVal) {
        console.log("newVal", newVal);
        if (newVal === this.config.sessionDefault || !this.utils.isLogin()) {
          this.data = [];
          return;
        }
        if (newVal && newVal !== this.config.sessionDefault) {
          this.initPage();
        }
      },
    },
  },
};
</script>
<style scoped lang="scss">
$mainWidth: 100%;
.send-box {
  position: absolute;
  bottom: 10px;
  // right: 10px;
  // left: 10px;

  width: 100%;
  ::v-deep textarea::placeholder {
    font-size: 13px;
  }
}

.digi-ai {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.ai-chat-container {
  position: relative;
  height: calc(100% - 10px);
  padding: 100px 10px 100px 10px;
  overflow: auto;
  .ai-chat-main {
    width: $mainWidth;
    margin: 0 auto;
  }
}
.surplus-use-count {
  position: absolute;
  top: -30px;
  width: $mainWidth;
  // left: 50%;
  // transform: translateX(-50%);
  // bottom: calc(10px + #{$sendInputHeight});
  // left: calc(10px + #{$navWidth});
  font-weight: 600;
  // background: rgba(0, 0, 0, 0.03);
  padding: 5px 10px;
  border-radius: 20px;
  color: $themeColor;
  i {
    font-size: 18px;
  }
}
.surplus {
  position: absolute;
  top: -40px;
  // top: 6px;
  left: 0;
  right: 0;
  display: flex;
  // justify-content: space-between;
  overflow-x: auto;
  padding: 0 10px;
  .qustion-btn {
    width: 200px;
    border: 1px solid #dcdfe6;
    color: #606266;
    border-radius: 30px;
    padding: 5px 10px;
    margin-right: 5px;
    flex: none;
    font-size: 12px;
  }
  .el-button {
    // width: 150px;
    // padding: 5px 10px;
    font-size: 12px;
  }
}
.stop-ask {
  // position: absolute;
  // top: -40px;
  // left: 0;
  // right: 0;
  // display: flex;
  width: 100%;
  text-align: center;
  margin-top: -15px;
  .el-button ::v-deep span {
    display: flex;
    // justify-items: center;
    align-items: center;
    .iconfont {
      margin-right: 2px;
    }
  }
}

.tas-chat-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  // border-radius: 10px;
  background: #fff;
  width: $mainWidth;
  background: #fff;
  // height: $sendInputHeight;
  height: 70px;
  left: 50%;
  padding: 5px 0;
  transform: translateX(-50%);
  &.sendBorder {
    border: 1px solid $themeColor;
  }
  .van-cell::after {
    border: 0;
  }
  .van-cell {
    padding: 0;
  }
  // border-top: 1px solid #dbdbdb;
  ::v-deep #textarea {
    // height: 80%;
    // height: calc(100% - 100px);
    min-height: 0 !important;
    max-height: 60vh;
    // height: 45px !important;
    // line-height: 100%;
    background: #f0f1f5;
    width: calc(100% - 50px);
    border: none;
    resize: none;
    outline: none;
    font-size: 15px;
    border-radius: 10px;
    margin-left: 10px;
    padding: 0 5px;
  }
  .send {
    position: absolute;
    bottom: 2px;
    // top: 0;
    right: 10px;
    font-size: 25px;
    // padding: 5px 10px;
  }
}

.ai-chat-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
// .ai-md-con ::v-deep p:after {

// }
.ask-content {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  color: #fff;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px 0;
  &:hover .opt-box {
    display: block;
  }
  img {
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 50%;
  }
  .chat-value-box {
    // position: relative;
    display: flex;
    width: calc(100% - 120px);

    flex-direction: column;
    align-items: flex-end;
    // padding: 15px 0;

    .chat-value {
      text-align: left;
      background: #fff;
      overflow-x: auto;
      color: #080808;
      border-radius: 10px 0 15px 10px;
      padding: 15px 10px;
      letter-spacing: 1px;
      white-space: pre-wrap;
    }
  }
  .opt-box {
    position: absolute;
    bottom: 5px;
    right: 50px;
    // display: none;
  }
}
/* ai 回答的样式 */
.ai-content {
  position: relative;
  width: 100%;
  display: flex;
  //   flex-direction: column;
  gap: $margin10;
  margin-bottom: 30px;

  .ai-value-box {
    position: relative;

    color: #333;
    width: calc(100% - #{$margin10});
    .chat-value {
      background: #f0f1f5;
      padding: 15px 10px;
      border-radius: 0 15px 5px 5px;
      letter-spacing: 1px;
      // white-space: pre-line;
      min-width: 120px;
      position: relative;
      ::v-deep ol,
      ::v-deep ul {
        padding-left: 18px;
      }
      ::v-deep pre {
        overflow-x: auto;
      }
      ::v-deep a {
        color: $themeColor;
      }
      .opt-box {
        position: absolute;
        right: 10px;
        bottom: -10px;
        // display: none;
      }
      &:hover .opt-box {
        display: block;
      }
    }
    .sign {
      display: inline-block;
      width: 10px;
      height: 4px;
      background: $themeColor;
    }
  }
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
}
// .ai-title {
//   font-size: 12px;
//   margin-bottom: 3px;
// }
.ai-md-con {
  line-height: 25px;
  ::v-deep ul,
  ::v-deep ol {
    margin: 10px 0;
  }
}
.ai-value-box {
  display: flex;
  flex-direction: row;
}
.ask-login {
  margin-top: 10px;
  font-size: 15px;
  text-align: left;
  // font-weight: 600;
  p {
    margin-top: 10px;
  }
}
</style>
