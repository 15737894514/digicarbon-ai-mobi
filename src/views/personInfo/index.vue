<template>
  <div class="">
    <van-nav-bar title="个人中心" left-text="返回" left-arrow @click-left="onClickLeft" />
    <div class="" style="padding: 10px">
      <!-- <van-cell-group>
        <van-cell title="头像">
          <template #right-icon>
            <div @click="$refs.uploadRef.openDialog()" class="head-portrait">
              <img :src="data.picUrl" alt="" />
            </div>
          </template>
        </van-cell>
        <van-cell :title="item.label" :value="ruleForm[item.prop]" v-for="(item, index) in formData" :key="index" />
      </van-cell-group> -->
      <!-- <van-cell title="头像">
        <template #right-icon>
          <div @click="$refs.uploadRef.openDialog()" class="head-portrait">
            <img :src="data.picUrl" alt="" />
          </div>
        </template>
      </van-cell> -->
      <van-form>
        <van-field label="头像">
          <template #input>
            <div @click="$refs.uploadRef.openDialog()" class="head-portrait">
              <img :src="data.picUrl" alt="" />
            </div>
          </template>
        </van-field>
        <span v-for="(item, index) in formData" :key="index">
          <van-field name="radio" label="单选框" v-if="item.type == 'select'">
            <template #input>
              <van-radio-group v-model="ruleForm[item.prop]" direction="horizontal">
                <van-radio :name="radio.value" v-for="(radio, r) in optionData[item.prop]" :key="r">{{ radio.label }}</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            readonly
            clickable
            v-model="ruleForm[item.prop]"
            name="datetimePicker"
            placeholder="点击选择时间"
            @click="showPicker = true"
            :label="item.label"
            v-else-if="item.type == 'date'"
          >
          </van-field>
          <van-field v-else v-model="ruleForm[item.prop]" :label="item.label" :placeholder="`请输入${item.label}`" />
        </span>
        <div style="margin: 16px">
          <van-button round block @click="saveUserInfo" type="info" native-type="submit">保存</van-button>
        </div>
      </van-form>
    </div>
    <van-popup v-model="showPicker" position="bottom">
      <van-datetime-picker v-model="date" type="datetime" @confirm="onConfirm" @cancel="showPicker = false" />
    </van-popup>
    <div class="upload-photo-box" style="">
      <!-- <div class="head-portrait"><img v-if="data.picUrl" :src="data.picUrl" alt="" /> <i v-else class="el-icon-s-custom"></i></div> -->
      <uploadPhoto ref="uploadRef"></uploadPhoto>
    </div>
  </div>
</template>

<script>
import uploadPhoto from "@/views/header/component/uploadPhoto.vue";
import { customerInfoModifyApi, customerInfoApi } from "api";
import moment from "moment";
export default {
  name: "",
  props: {},
  components: { uploadPhoto },
  data() {
    return {
      date: new Date(),
      showPicker: false,
      //   isEdit: false,
      data: {},
      optionData: {
        userGender: [
          { label: "男", value: "1" },
          { label: "女", value: "0" },
        ],
      },
      ruleForm: { userName: "", userGender: "", userBirth: "", userAddress: "", userCompany: "", userJob: "", userBusiness: "", phoneNumber: "" },
      formData: [
        { type: "text", label: "昵称", prop: "userName" },
        { type: "text", label: "手机号", prop: "phoneNumber", disabled: true },
        // { type: "text", label: "账号", prop: "account" },
        { type: "select", label: "性别", prop: "userGender" },
        { type: "date", label: "生日", prop: "userBirth" },
        { type: "text", label: "所在地", prop: "userAddress" },
        { type: "text", label: "公司", prop: "userCompany" },
        { type: "text", label: "职位", prop: "userJob" },
        { type: "text", label: "行业", prop: "userBusiness" },
      ],
    };
  },
  computed: {},
  mounted() {
    this.isLogin = this.utils.isLogin();
    this.isLogin && this.getUserInfo(); //获取用户信息
    this.$EventBus.$on("uploadPicSuccess", () => {
      this.getUserInfo();
    });
  },
  methods: {
    onConfirm() {
      let userBirth = moment(this.date).format("YYYY-MM-DD HH:mm:ss");
      this.ruleForm.userBirth = userBirth;
      this.showPicker = false;
    },
    onClickLeft() {
      this.$router.push("/");
    },
    getUserInfo() {
      let accessToken = window.localStorage.getItem("accessToken");
      customerInfoApi({ accessToken }).then((res) => {
        let data = res.data;
        console.log(data);
        this.data = data;
        this.ruleForm = data || {};
      });
    },
    saveUserInfo() {
      let accessToken = localStorage.getItem("accessToken");
      customerInfoModifyApi({ ...this.ruleForm, accessToken }).then((res) => {
        let state = this.message.state(res, ["保存成功"]);
        if (!state) return;
        this.getUserInfo();
        // this.$emit("save");
      });
    },
  },
  watch: {},
};
</script>
<style lang="scss" scoped>
//@import url(); 引入公共css类
.upload-photo-box {
  display: flex;
  align-items: center;
  .head-portrait {
    margin-right: 10px;
    width: 40px;
    height: 40px;
  }
}
.head-portrait {
  width: 30px;
  height: 30px;
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
</style>
