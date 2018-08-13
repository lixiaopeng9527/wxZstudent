
import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import Config from "../config";

export default class AttendanceSev {

  /**
   * 获得学校位置信息
   */
  static getSchoolLocation() {
    
    return new Promise((resolver, reject) => {
        //设置公司坐标
        setTimeout(function(){         
          resolver({
            latitude: 34.196720,
            longitude: 108.887430
          })

        },200)

    }); 
  }


  /**
   * 教职工当天打卡记录和学校考勤时间接口
   */
  static getTeacherTodayRecord(){
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/qrcode/getTeacherTodayRecord", {}, {});
  }


  /**
   * 查询考勤时间
   */
  static findSchoolTimeById(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/school/setting/findSchoolTimeById", {}, data);
  }


  /**
   * 模糊查询学校列表
   */
  static getZLSchoolList(params){
    return Net.getJSON(Config.SERVER.url.uc + "/schoolBoss/searchSchoolByName", params);
  }


  /**
   * 设置考勤时间
   */
  static settingSchoolTime(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/school/setting/settingSchoolTime", {}, data);
  }


  


  

  /**
   * 创建园所
   */
  static addSchool(data){
    data.appCode = 'zs';
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + "/wx/school/addSchool", {}, data);
  }


  /**
   * 修改学校考勤地址
   */
  static updateSchool(params) {
    //容错服务端 地址乱码问题
    return Net.postCicadaJSON(Config.SERVER.url.uc + "/schoolBoss/updateSchoolBySchoolId", {}, params);
  }

  

  /**
   * 获得用户签到记录
   */
  static getUserAttenceList(params) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/qrcode/getInSchoolOrderList", params, {});  
  }

  /**
 * 点击签到
 */
  static sendAttence(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/qrcode/sendQrcodeMessage", {}, data);
  }


  /**
  * 获得签到排名
  */
  static getSchoolRank(params) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + "/qrcode/getInSchoolTadayOrderList", params, {});
  }



}