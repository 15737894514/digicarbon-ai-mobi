<template>
  <div class="main">
    <van-nav-bar title="" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="protocol">
      <iframe id="iframeId" :src="src" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  props: {},
  components: {},
  data() {
    return {
      src: "",
      data: {
        user: "/mobi/protocal/知识库问答系统_用户协议.html",
        privacy: "/mobi/protocal/知识库问答系统_隐私政策.html",
      },
    };
  },
  computed: {},
  mounted() {
    this.src = this.data[this.$route.query.type];
  },
  methods: {
    onClickLeft() {
      this.$router.push("/login");
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.main {
  width: 100%;
  height: 100%;
}
.protocol {
  width: 100%;
  height: 100%;
  // width: ;
  // margin: 10px;
  overflow: hidden;
  padding: 0 10px;
}
#iframeId {
  width: 100%;
  height: 100%;
}
</style>
