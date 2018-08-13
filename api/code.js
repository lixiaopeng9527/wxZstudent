import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import Config from "../config";

export default class CodeSev {

  /**
   * 获得学校二维码列表
   */
  static getSchoolQrcodes(data) {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/code/getSchoolQrcodes", {}, data);
  }

  /**
   * 小程序推送码收集
   */
  static getAppletSendCode(data){
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wx/school/getAppletSendCode", {}, data);
  }

  


  /**
   * 获得分享图片
   */
  static getSchoolShareImg(params,data) {
     data = data || {};
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/code/share", params, data);
  }

  /**
   * 获得分享图片
   */
  static getShareAttenceQrcode(params, data) {
    data = data || {};
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/code/getShareAttenceQrcode", params, data);
  }

  static getShareZsQrcode(params,data){
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/code/getShareZsQrcode", params, data);
  }  
}