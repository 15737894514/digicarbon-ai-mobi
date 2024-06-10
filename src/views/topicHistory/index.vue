<template>
  <div class="topic-history">
    <digiHeader></digiHeader>
    <van-search @blur="searchBlur" v-model="value" placeholder="请输入搜索关键词" />
    <van-empty v-if="topicLists.length === 0" description="当前没有历史记录，快去新建对话吧" />
    <div v-else>
      <van-swipe-cell class="topic-list" v-for="(item, index) in topicLists" :key="index">
        <div>
          <div class="agent">
            <div class="agent-title">
              <img :src="require(`@/assets/imgs/${item.agentId}.jpg`)" alt="" />
              <div class="agent-name">{{ item.agentName }}</div>
            </div>
            <div style="color: #666" class="date">{{ item.sessionCreateTime }}</div>
          </div>
          <!-- <van-cell :border="false" :title="item.seesionName" value="点击继续对话" /> -->
          <div class="content">
            <van-field @blur="renameBlur(item)" v-if="item.rename" class="session-name" v-model="item.seesionName" />
            <div v-else class="session-name over-ellipsis">{{ item.seesionName }}</div>
            <!-- <div class="btn">继续对话</div> -->
            <van-tag @click="sessionChange(item)" round type="primary">
              <!-- <i class="iconfont">&#xe61a;</i>  -->
              继续对话</van-tag
            >
          </div>
        </div>

        <!-- <div class="topic-bottom">
        <div class="date">{{ item.sessionCreateTime }}</div>
        <van-button size="small" type="primary">继续对话</van-button>
      </div> -->
        <template #right>
          <van-button @click="editHandle(item)" square type="primary" text="编辑" />
          <van-button @click="deleteHandle(item)" square type="danger" text="删除" />
        </template>
      </van-swipe-cell>
      <van-pagination style="margin: 10px 10px 0 10px" @change="pageChange" v-model="page" :page-count="count" mode="simple" />
    </div>
  </div>
</template>

<script>
import digiHeader from "views/header";
import moment from "moment";
import { Dialog } from "vant";
import { agentListApi, sessionListApi, allSessionListApi, sessionAddApi, sessionUpdateApi, sessionDeleteApi } from "api";
export default {
  name: "topicHistory",
  props: {},
  components: { digiHeader },
  data() {
    return {
      page: 1,
      pageSize: 5,
      count: 1,
      value: "",
      topicLists: [],
      showPopover: false,
      actions: [{ text: "编辑" }, { text: "删除" }],
    };
  },
  computed: {},
  mounted() {
    if (this.utils.isLogin()) {
      this.initPage();
    }
  },
  methods: {
    initPage() {
      this.allSessionList();
    },
    //继续对话
    sessionChange(item) {
      console.log("item", item);
      localStorage.setItem("agentId", item.agentId);
      // localStorage.setItem("sessionId", item.sessionId);
      this.utils.setSessionId(item.agentId, item.sessionId);

      this.$store.commit("setAgentId", item.agentId);
      this.$store.commit("setAgentName", item.agentName);
      // this.$store.commit("setSessionId", item.sessionId);

      this.$router.push("/");
    },
    searchBlur() {
      this.page = 1;
      this.allSessionList();
    },
    pageChange() {
      this.allSessionList();
    },
    //重命名
    renameBlur(item) {
      item.rename = false;
      sessionUpdateApi({
        ...this.utils.getComParams(),
        agentId: item.agentId,
        sessionName: item.seesionName,
        sessionId: item.sessionId,
      }).then((res) => {
        this.allSessionList();
      });
    },
    allSessionList() {
      allSessionListApi({ ...this.utils.getComParams(), pageSize: this.pageSize, pageNum: this.page, searchVal: this.value }).then((res) => {
        console.log(res);
        let { total, sessionList } = res.data;
        this.topicLists = sessionList;
        this.count = Math.ceil(total / this.pageSize);
        this.topicLists.forEach((item) => {
          //跟phython有点差异 后面没有带+0800 (中国标准时间) 解析时间会有偏差
          let sessionCreateTime = `${item.sessionCreateTime}+0800 (中国标准时间)`;
          item.sessionCreateTime = moment(new Date(sessionCreateTime).getTime()).format("YYYY-MM-DD HH:mm:ss");
        });
      });
    },
    editHandle(item) {
      this.$set(item, "rename", true);
    },
    deleteHandle(item) {
      let message = `确定要删除「${item.seesionName}」?`;
      Dialog.confirm({ message }).then(() => {
        sessionDeleteApi({
          ...this.utils.getComParams(),
          agentId: item.agentId,
          sessionId: item.sessionId,
        }).then((res) => {
          let state = this.message.state(res, ["删除成功"]);
          if (!state) return;
          this.allSessionList("delete");
          //没有清除本地的agendId和sessionId 也是没有问题的，因为进入首页只有，没有的话，就用默认的角色和会话id了
        });
      });
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.topic-history {
  padding-top: $headerHeight;
  padding-bottom: 20px;
}
.topic-list {
  background: #fff;
  margin: 10px 10px 0 10px;
  padding: 10px 0 10px 10px;
  .content {
    margin-top: 8px;
    margin-right: 10px;
    display: flex;
    justify-content: space-between;
    .session-name {
      width: calc(100% - 80px);
      &.van-cell {
        padding: 0;
        border: 1px solid #dcdfe6;
      }
    }
  }
  .topic-bottom {
    text-align: center;
    margin: 0 auto;
    // display: flex;
    // justify-content: space-between;
    // align-items: center;
  }
  .agent {
    display: flex;
    justify-content: space-between;
    margin-right: 10px;
    .agent-title {
      display: flex;
      font-size: 12px;
      align-items: center;
      img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin-right: 5px;
      }
    }
  }
}
</style>
