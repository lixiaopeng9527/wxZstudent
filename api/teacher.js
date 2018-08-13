import UI from "../utils/uiUtil";
import Net from "../utils/netUtil";
import Storage from "../utils/storageUtil";
import Config from "../config";

/**
 * 添加教职工
 */
export default class teacherSev {
  /**
   * 加入考勤
   */
  static addStaff (params, data) {
    data.appCode = 'zs';
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/wx/school/addEmployeeInWx', params, data)
    }

  /**
 * 获取教职工列表
 */
  static getStaffList(params) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + '/saas/employee/employeeList', params)
  }
  /**
   * 设置管理员
   */
  static setAdministrators(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + '/userBoss/registerSchoolLeaderAccountWx', {}, data)
  }

  /**
   * 取消管理员
   */
  static cancelAdminAndStaff(data) {
    return Net.postCicadaJSON(Config.SERVER.url.uc + '/relationBoss/editSchoolMaster', {}, data)
  }

  /**
   * 删除教职工
   */
  static delSchoolTeacher(data) {
    return Net.postCicadaJSON(Config.SERVER.url.kidscare + '/saas/employee/delSchoolTeacher', {}, data)
  }

  /**
   * 添加教职工后推送消息接口
   */
  static pushImssage(params,data) {
    params = params ||{ };
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/wx/school/sendAddTeacherMsg', params, data)
  }
  /**
     * 添加学生后消息接口
     */
  static pushStudentsImssage(params, data) {
    params = params || {};
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/wx/school/sendWillJoinSchoolMsg', params, data)
  }
  /**
   * 教职工二维码
   */
  static addStaffQRcode() {
    return Net.postCicadaJSON(Config.SERVER.url.qrcode + '/code/getSchoolQrcodes')
  }
  }
