import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import  Config from "../config";
 
export default class VisitorSev {


/**
* 获得统计
*/
  static getVisitorData(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/visitor/statics", {}, data);
  }

  /**
   * 获得访客列表
   */
  static getVisitorList(params,data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/visitor/list", params,   data);
  }
  
  /**
   * 新增访客
   */
  static addVisitor(data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wx/visitor/add", {}, data);
  }


  /**
   * 获得临时访客证
   */
  static getVisitorCard(data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wx/visitor/getVisitBySession", {}, data);
  }


  /**
  * 结束临时访客证
  */
  static finishVisit(data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wx/visitor/finishVisit", {}, data);
  }
  



}