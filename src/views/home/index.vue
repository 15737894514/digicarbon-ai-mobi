<template>
  <div class="home">
    <digiHeader @updatePage="initPage"></digiHeader>
    <selRoleInfo :agentData="selAgentData" :sessionId="sessionId"></selRoleInfo>
    <digiAi
      ref="digiAi"
      @updateTopic="updateTopic"
      @createTopic="setUpTopic"
      :agentData="selAgentData"
      :sessionId="sessionId"
      :agentName="agentName"
    ></digiAi>
  </div>
</template>

<script>
import digiHeader from "views/header";
import selRoleInfo from "views/header/selRoleInfo";
import digiAi from "views/digiAi";
import { agentListApi, agentListV1Api, sessionListApi, sessionAddApi, sessionUpdateApi, sessionDeleteApi } from "api";
let { VUE_APP_ENV } = process.env;
import { agentIconPath } from "@/utils/config";
export default {
  name: "",
  props: {},
  components: { digiHeader, selRoleInfo, digiAi },
  data() {
    return {
      selAgentData: {},
      logo: require("@/assets/imgs/logo竖.png"),
      roles: [],
      agentId: "", //角色id
      agentName: "",
      sessionId: "",
    };
  },
  computed: {},
  mounted() {
    this.initPage();
    // this.message.success({ message: "成功", duration: 0 });
  },
  methods: {
    initPage() {
      this.getRoles(); //获取角色数据
    },
    //获取角色（知识库）
    getRoles() {
      let env = VUE_APP_ENV === "cn" ? "prod" : "pre";
      agentListV1Api({ ...this.utils.getComParams(), env }).then((res) => {
        this.data = res.data;
        let { data, agentGroup } = this.data;
        if (data?.length > 0) {
          data.forEach((item) => {
            item.agentVersionIcon = `${agentIconPath[VUE_APP_ENV]}${item.agentVersionIcon}`;
          });
          let urlAgentId = this.$route.query.agentId;
          let agentId = urlAgentId || localStorage.getItem("agentId");
          console.log("[ agentId ] >", agentId);

          this.agentId = agentId ? agentId : data[0].agentId;
          let selAgentData = data.find((item) => item.agentId === this.agentId);
          this.selAgentData = selAgentData ? selAgentData : data[0];

          this.agentName = this.selAgentData.agentVersionName;
          this.sessionId = this.utils.getSessionId(this.agentId) || this.config.sessionDefault;

          this.$store.commit("setAgentId", this.agentId);
          this.$store.commit("setAgentName", this.agentName);
        }
        // this.roles = res.data.agentList;
        // let agentId = localStorage.getItem("agentId");
        // console.log("this.utils.getSessionId(agentId)", this.utils.getSessionId(agentId));
        // this.sessionId = this.utils.getSessionId(agentId) || this.config.sessionDefault;
        // this.agentId = agentId ? agentId : this.roles[0].agentId;
        // this.agentName = this.roles.find((item) => item.agentId === this.agentId)?.agentName;

        // this.$store.commit("setAgentId", this.agentId);
        // this.$store.commit("setAgentName", this.agentName);
        // this.$store.commit("setSessionId", this.sessionId);
      });
    },
    //通过角色获取会话列表
    sessionListByRole(type) {
      sessionListApi({ ...this.utils.getComParams(), agentId: this.agentId }).then((res) => {
        this.topicLists = res.data.sessionList;

        if (this.topicLists.length === 0) {
          this.sessionId = type == "changeRole" ? "" : this.config.sessionDefault;
        } else {
          //默认选择第一个
          if (["create", "delete"].includes(type)) {
            this.sessionId = this.topicLists[0].sessionId;
            this.utils.setSessionId(this.agentId, this.sessionId);
          }
          this.$nextTick(() => {
            this.newQuestion && this.$refs.digiAi.sendClick(this.newQuestion);
            this.newQuestion = "";
          });
        }
      });
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
    updateTopic(seesionName, sessionId) {
      sessionUpdateApi({
        ...this.utils.getComParams(),
        agentId: this.agentId,
        sessionName: seesionName,
        sessionId: sessionId || this.sessionId,
      }).then((res) => {
        this.sessionListByRole();
      });
    },
  },
  watch: {},
};
</script>
<style lang="less" scoped>
.home {
  width: 100%;
  height: 100%;
}
</style>
