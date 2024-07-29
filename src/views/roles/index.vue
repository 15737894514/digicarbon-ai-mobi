<template>
  <div class="role-intro">
    <digiHeader></digiHeader>
    <van-collapse class="intro-box" v-model="activeNames">
      <van-collapse-item
        v-for="(item, index) in data.agentGroup"
        :title="getAgentGroupName(item)"
        :name="index"
        :key="index"
      >
        <div class="intro-con" v-for="(agent, i) in getAgent(item)" :key="i">
          <div>
            <div class="role-title">
              <img :src="agent.agentVersionIcon" alt="" />
              <h4>"{{ agent.agentVersionName }}"大模型知识库</h4>
            </div>

            <div class="role-info">
              <div class="content">{{ agent.agentVersionDesc }}</div>
            </div>
            <van-button size="small" @click="useRole(agent)" type="primary" style="margin-top: 10px; width: 60%" round
              >使 用</van-button
            >
          </div>
        </div>
      </van-collapse-item>
    </van-collapse>
    <!-- <div class="intro-box" v-for="(item, index) in data.agentGroup" :key="index">
      <h3>{{ getAgentGroupName(item) }}</h3>
      <div v-for="(agent, i) in getAgent(item)" :key="i">
        <div class="intro-con">
          <div class="role-title">
            <img :src="agent.agentVersionIcon" alt="" />
            <h4>"{{ agent.agentVersionName }}"大模型知识库</h4>
          </div>

          <div class="role-info">
            <div class="content">{{ agent.agentVersionDesc }}</div>
          </div>
          <van-button size="small" @click="useRole(item)" type="primary" style="margin-top: 10px; width: 60%" round
            >使 用</van-button
          >
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapState } from "vuex";
import digiHeader from "views/header";
import { agentListApi, agentListV1Api } from "api";
let { VUE_APP_ENV } = process.env;
import { agentIconPath } from "@/utils/config";
export default {
  name: "",
  props: {},
  components: { digiHeader },
  data() {
    return {
      activeNames: [],
      data: {},
    };
  },
  computed: {
    ...mapState(["agentId", "agentName"]),
  },
  mounted() {
    this.initPage();
  },
  methods: {
    getAgent(agentGroupId) {
      let { data } = this.data;
      return data.filter((item) => item.agentGroupId === agentGroupId);
    },
    getAgentGroupName(agentGroupId) {
      let { data } = this.data;
      return data.find((item) => item.agentGroupId === agentGroupId)?.agentGroupName;
    },
    useRole(item) {
      // console.log("[ item ] >", item);
      let agentId = item.agentId;
      let agentName = item.agentVersionName;
      localStorage.setItem("agentId", agentId);
      localStorage.setItem("agentName", agentName);
      this.$store.commit("setAgentId", agentId);
      this.$store.commit("setAgentName", agentName);
      this.$router.push("/");
    },
    filterRoleByEnv(agentList) {
      let VUE_APP_ENV = process.env["VUE_APP_ENV"];
      // VUE_APP_ENV = "cn-pre";
      console.log("[ VUE_APP_ENV ] >", VUE_APP_ENV);
      //todo 国内正式环境去除「涌现知识库」
      return agentList?.filter((item) => (VUE_APP_ENV === "cn-pre" ? item : item.agentId !== "AGENT-202403181348"));
    },
    initPage() {
      let env = VUE_APP_ENV === "cn" ? "prod" : "pre";
      console.log("[ VUE_APP_ENV ] >", VUE_APP_ENV);
      agentListV1Api({ ...this.utils.getComParams(), env }).then((res) => {
        console.log("[ res ] >", res);
        // let agentList = res.data.agentList;
        this.data = res.data;
        let { data, agentGroup } = this.data;
        if (data?.length > 0) {
          data.forEach((item) => {
            item.agentVersionIcon = `${agentIconPath[VUE_APP_ENV]}${item.agentVersionIcon}`;
          });
          this.activeNames = [agentGroup.length - 1];
        }
        // this.roles = this.filterRoleByEnv(agentList);
        // this.roles = agentGroup;
      });
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
$imgSize: 80px;
.role-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  img {
    width: 22px;
    border-radius: 50%;
    margin-right: 10px;
  }
}
.role-intro {
  padding-top: $headerHeight;
  padding-bottom: 10px;
  .intro-box {
    text-align: center;

    h4 {
      font-size: 14px;
      // margin: 10px 0;
    }
    h3 {
      margin-top: 10px;
    }
    .intro-con {
      margin: 10px 0 0 0;
      // background: #fff;
      background: #f8f8f8;
      color: #333;
      min-width: 300px;
      padding: 5px 10px 10px 10px;
      border-radius: 5px;
      box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.05);
      &:first-child {
        margin-top: 0;
      }
    }
    .role-info {
      display: flex;
    }
    .content {
      text-align: left;
      font-size: 12px;
      // margin-left: 20px;
    }
  }
}
::v-deep .van-cell__title {
  font-weight: 600;
  text-align: left;
  color: $themeColor;
}
</style>
