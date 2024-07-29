<template>
  <div class="role-box" @click="changeRole">
    <div class="role-img-box">
      <img v-if="agentData.agentVersionIcon" :src="agentData.agentVersionIcon" alt="" />
    </div>
    <div class="role-info over-ellipsis">
      <p>
        {{ agentData.agentVersionName }}<span>{{ sessionName }}</span>
      </p>
      <p>点击切换知识库</p>
    </div>
    <van-icon size="16" name="arrow" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { allSessionListApi } from "api";
export default {
  name: "selRoleInfo",
  props: {
    agentData: {
      type: Object,
      default: () => {},
    },
    sessionId: String,
  },
  components: {},
  data() {
    return {
      sessionName: "默认话题",
    };
  },
  computed: {
    ...mapState(["agentId", "agentName"]),
  },
  mounted() {},
  methods: {
    changeRole() {
      this.$router.push({ path: "/roles" });
    },
  },
  watch: {
    sessionId: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (!newVal) return;
        if (newVal === this.config.sessionDefault || !this.utils.isLogin()) {
          this.sessionName = "默认话题";
        } else {
          allSessionListApi({ ...this.utils.getComParams(), pageSize: 10000000, pageNum: 1 }).then((res) => {
            let { sessionList } = res.data;
            this.sessionName = sessionList.find((item) => item.sessionId === newVal)?.seesionName || "默认话题";
          });
        }
      },
    },
  },
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.role-box {
  position: fixed;
  left: 0;
  right: 0;
  top: $headerHeight;
  z-index: 99;
  height: 45px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0 10px;
  display: flex;
  //   position: relative;
  .van-icon {
    position: absolute;
    right: 10px;
    color: #666;
    top: 50%;
    transform: translateY(-50%);
  }
  .role-img-box {
    height: 100%;
    display: flex;
    align-items: center;

    img {
      height: 28px;
      border-radius: 50%;
    }
  }
  .role-info {
    margin-left: 6px;
    margin-top: 4px;
    width: 300px;
    p {
      font-size: 13px;
      span {
        background: rgba(0, 0, 0, 0.06);
        font-size: 12px;
        border-radius: 5px;
        color: #666;
        padding: 2px 5px;
        margin-left: 5px;
      }
    }
    p:nth-child(2) {
      color: #666;
      font-size: 11px;
    }
  }
}
</style>
