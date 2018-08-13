import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Config from "../config";

export default class UserSev {


  /**
  * 设置用户配置
  */
  static setUserSettings(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/user/setUserSetting", {}, data);
  }

  /**
* 设置用户配置
*/
  static getUserSettings(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/user/getUserSettings", {}, data);
  }

  /**
* 修改用户名称
*/
  static updateUserName(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/saas/employee/updateUserName", {}, data);
  }

  




}