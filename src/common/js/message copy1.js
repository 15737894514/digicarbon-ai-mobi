// 为了实现Class的私有属性
import { Notify } from "vant";
/**
 *  重写ElementUI的Message
 *  single默认值true，默认只弹出一个，可以根据实际需要设置
 */
let messageInstance = null;
class DonMessage {
  success(options) {
    Notify({ type: "success", ...options });
  }
  warning(options) {
    Notify({ type: "warning", ...options });
  }
  state(res, msgs) {
    if (res.success === 0 || res.code == 0) {
      let msg = msgs?.[0] ? msgs?.[0] : res.msg;
      Notify({ type: "success", message: msg });
      return true;
    } else {
      Notify({ type: "warning", message: msg });
      return false;
    }
  }
}
export default DonMessage;
