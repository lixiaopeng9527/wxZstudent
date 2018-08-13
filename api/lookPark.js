import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import  Config from "../config";
 
export default class LookParkSev {
  
  /**
   * 添加看园新生
   */
  static addChild(params,data) {   
    params = params || {};
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/followUp/addChild", params, data);
  }

  /**
  * 获得年级
  */
  static getGradeList(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/school/grades", {}, data);
  }


  /**
     * 获得当前看园新生列表
     */
  static getChildList(params,data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/followUp/childList", params, data);
  }

  /**
 * 获得统计
 */
  static getFollowUpData(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/followUp/statics", {}, data);
  }

}