//全局配置的数据
let inputTxt = "请输入";
let selectTxt = "请选择";
let remark = "备注";
export const config = {
  sessionDefault: "Session-default",
  input: inputTxt,
  remark,
  select: selectTxt,
  time: selectTxt,

  startTime: "开始时间",
  endTime: "结束时间",
  selTime: "选择时间",
  to: "至",
  validationFailText: "保存失败，有必填项未填写",
  labelStyle: { width: "80px", "text-align": "left", color: "#555" },
  contentStyle: { "text-align": "left", display: "inline-block", color: "#333" },
  inputRule: [{ required: true, message: inputTxt, trigger: "blur" }],
  selectRule: [{ required: true, message: selectTxt, trigger: "blur" }],
  inputRuleHandle: (trigger = "change") => {
    return [{ required: true, message: inputTxt, trigger }];
  },
  selectRuleHandle: (trigger = "change") => {
    return [{ required: true, message: selectTxt, trigger }];
  },
  questions: [
    { content: "如何理解温室气体自愿减排项目中的额外性原则？", icon: "" },
    { content: "项目设计文件公示期是多久？", icon: "" },
    { content: "哪些主体可以参与温室气体自愿减排交易？", icon: "" },
    { content: "项目方法学在选择和使用时需要考虑哪些关键因素？", icon: "" },
    { content: "项目减排量登记必须符合哪些原则和条件？", icon: "" },
    { content: "从事核证自愿减排量交易的交易主体需要在哪些系统开设账户？", icon: "" },
    { content: "什么是温室气体自愿减排交易管理办法（试行）？", icon: "" },
    { content: "交易机构对哪些异常交易行为予以重点监控？", icon: "" },
    { content: "全国温室气体自愿减排交易的交易方式有哪些？", icon: "" },
    { content: "交易机构实行的大户报告制度是指什么？", icon: "" },
    { content: "一个交易主体能否开设多个交易账户？", icon: "" },
    { content: "核证自愿减排量交易的标的物是如何定义的？", icon: "" },
    { content: "一个交易主体能否开设多个交易账户？", icon: "" },
    { content: "减排量公示的流程是怎样的？", icon: "" },
    { content: "监测数据在哪些用途中被使用？", icon: "" },
    { content: "监测计划至少应包含哪些内容？", icon: "" },
    { content: "什么是项目的计入期？如何确定计入期？", icon: "" },
    { content: "可以申请CCER的温室气体自愿减排项目类型有哪些" },
    { content: "2023年EUA的价格趋势如何", icon: "" },
  ],
};
