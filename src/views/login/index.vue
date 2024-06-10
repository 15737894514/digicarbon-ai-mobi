<template>
  <div class="login-contanier">
    <div class="login-logo">
      <img style="width: 150px" class="logo" :src="logo" alt="" />
    </div>
    <p class="info">欢迎使用中财数碳大模型知识库</p>
    <div class="login-main">
      <van-form :label-width="80" ref="form" style="margin: 0 5px 10px 5px">
        <!-- 手机号码 -->
        <van-field
          clearable
          label="手机号码"
          v-model="ruleForm.phoneNumber"
          placeholder="请输入手机号码"
          name="mobile"
        ></van-field>
        <!-- 验证码 -->
        <van-field :maxlength="6" label="验证码" v-model="ruleForm.smsCode" placeholder="请输入验证码">
          <template #button>
            <div class="button get-code" @click="getCode">{{ codeText }}</div>
          </template>
        </van-field>
        <span v-if="errorMsg" class="error-message">{{ errorMsg }}</span>
        <div class="checked-box">
          <div class="checkbox-icon">
            <van-checkbox icon-size="16" id="smscode-checked" v-model="ruleForm.checked"></van-checkbox>
          </div>
          <div class="privacy-main">
            <div>未注册的用户将自动注册,登录即视为您已阅读并同意</div>
            <a @click="protocolClick('user')">《用户协议》</a>
            <span>和</span>
            <a @click="protocolClick('privacy')">《隐私政策》</a>
          </div>
        </div>
        <div style="margin: 0 10px">
          <van-button type="primary" round block @click="loginClick">登录</van-button>
        </div>
      </van-form>
    </div>
    <div class="about-us">
      <p @click="aboutUs">关于我们</p>
      <p @click="aboutUs">意见反馈</p>
    </div>
  </div>
</template>

<script>
import { smscodeApi, loginApi } from "api";
export default {
  name: "login",
  props: {},
  components: {},
  data() {
    return {
      disabled: false,
      logo: require("@/assets/imgs/logoNew.png"),
      codeText: "获取验证码", //倒计时数字
      timeShow: false,
      errorMsg: "",
      ruleForm: {
        checked: true,
        phoneNumber: "",
        smsCode: "",
      },
      formData: [
        { type: "slot", prop: "phoneNumber" },
        { type: "slot", prop: "smsCode" },
        { type: "custom", prop: "checked" },
        { type: "custom", prop: "loginBtn" },
      ],
      rules: {
        phoneNumber: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          //校验手机号的正则：/^1[3456789]\d{9}$/
          { pattern: /^1[3456789]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" },
        ],
      },
    };
  },
  computed: {},
  mounted() {},
  methods: {
    aboutUs() {
      window.location.href = "https://digicarbon.cn/about";
    },
    protocolClick(type) {
      this.$router.push({ path: "/protocol", query: { type } });
    },
    getCode() {
      if (this.disabled) return; //在倒计时未结束的时候不能再点击
      this.ruleForm.smsCode = "";
      if (this.getVerify()) {
        this.timer(); //倒计时
        smscodeApi({ phoneNumber: this.ruleForm.phoneNumber }); //获取验证码
      }
    },
    getVerify() {
      let { phoneNumber, checked } = this.ruleForm;
      if (!phoneNumber) {
        this.errorMsg = "请输入手机号";
        return false;
      }
      if (!/^1[3456789]\d{9}$/.test(phoneNumber)) {
        this.errorMsg = "手机号不正确,请重新输入";
        return false;
      }
      if (!checked) {
        this.errorMsg = "请阅读后勾选同意服务条款及隐私政策";
        return false;
      }
      this.errorMsg = "";
      return true;
    },
    loginClick() {
      if (this.getVerify()) {
        let { smsCode, phoneNumber } = this.ruleForm;
        if (!smsCode) {
          this.errorMsg = "请输入验证码";
          return false;
        }
        if (!(smsCode.length === 6 && /^[0-9]*$/.test(smsCode))) {
          this.errorMsg = "请输入正确的验证码";
          return false;
        }
        this.errorMsg = "";
        //后后台请求
        loginApi({ phoneNumber, smsCode }).then((res) => {
          let state = this.message.state(res, ["登录成功"]);
          if (!state) return;
          let { accessToken } = res.data;
          window.localStorage.setItem("accessToken", accessToken);
          this.$router.push("/");
        });
      }
    },
    // 倒计时方法
    timer() {
      if (this.timeShow) return;
      this.timeShow = true;
      this.time = 60;
      this.disabled = true;
      //短信验证码已发送，可能会有延后，请耐心等待
      var timecount = setInterval(() => {
        this.time--;
        this.codeText = `${this.time}秒后可重新发送`;
        if (this.time < 1) {
          this.codeText = "获取验证码";
          this.disabled = false;
          this.timeShow = false;
          clearInterval(timecount);
        }
      }, 1000);
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.about-us {
  // display: flex;
  // align-items: center;
  // justify-items: center;
  // margin-top: 15px;
  // width: 375px;
  position: absolute;
  // top: 10px;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  p {
    line-height: 1;
    padding: 0 10px;
    float: left;
    font-size: 14px;
    // margin: 0 auto;
  }
  p:first-child {
    border-right: 1px solid #666;
    line-height: 1;
  }
}
.info {
  text-align: center;
  font-size: 16px;
  margin: 10px 0 10px 0;
}
.login-contanier {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  width: 100%;
  // padding: 0 20px;
}
.login-main {
  background: #fff;
  margin: 0 20px;
  padding: 10px 0;
}
.login-logo {
  display: flex;
  justify-content: center;
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
.get-code {
  color: $themeColor;
}
$height: 45px;
::v-deep .el-input__inner {
  height: $height !important;
  line-height: $height !important;
}
::v-deep .el-form-item__label {
  height: $height !important;
  line-height: $height !important;
}
a {
  color: $themeColor;
}
.sign {
  color: #f56c6c;
  margin-right: 4px;
}
.error-message {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  padding-left: 14px;
  // position: absolute;
  // top: 100%;
  // left: 0;
}
::v-deep .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #606266;
}
.el-button.is-disabled {
  color: $themeColor;
}
.checked-box {
  font-size: 11px;
  margin: 10px 10px;
  display: flex;
  .checkbox-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .privacy-main {
    display: flex;
    flex-wrap: wrap; //nowrap /wrap
    margin-left: 5px;
    text-align: left;
  }
}
</style>
