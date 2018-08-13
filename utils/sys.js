import CompatibleUtil from "./compatibleUtil";
import { request, setConfig, Promise } from '../lib/wx-promise-request';
import Net from "./netUtil";
import Config from "../config";

export default class SysUtil {


  /**
   * 打点统计分析
   */
  static point(eventName) {
    
    let data = {
      cmoduleName : eventName,
      moduleName: 'microAttendance',
      operation : "click"
    }

    let currentSchool = getApp().globalData.currentSchool;
    if (currentSchool){
      data.schoolId = currentSchool.schoolId;
    }

    //如果么有schoolId 传递-1;
    data.schoolId = data.schoolId || '10000';
    
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/common/operation/createWxLog", {}, data);
  }


  

} 
