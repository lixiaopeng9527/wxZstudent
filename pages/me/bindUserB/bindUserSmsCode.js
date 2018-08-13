
import Navigation from "../../../utils/navigationUtil";
import Storage from "../../../utils/storageUtil";
import AuthSev from "../../../api/auth";
import TeacherSev from "../../../api/teacher";
import UI from "../../../utils/uiUtil";
import BaseUtil from "../../../utils/baseUtil";

import countDown from "../../../common/component/countDown/countDown";



var page = {

  /**
   * 页面的初始数据
   */
  data: {
    smsCode: '',
    phoneNum: '',
    isFormDisabled : true,
    isSendCode: false   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.type = options.type;  
    this.sId = options.sId;
    console.log('options-->',options);
    Navigation.setNavigationBarTitle("验证手机号");
  },


  onUnload : function(){
    countDown.onCountDownDestoryTimer();
  },

  onCountDownStart : function(){
    console.log('this.data.phoneNum-->');
    
    var data = {
      phoneNum: this.data.phoneNum
    }
    AuthSev.getUserInfoByPhone(data)
      .then(res => {
        if (res.bizData) {
          this.business = 2000;
        }
        else {
          this.business = 1000;
        }
        AuthSev.getSMSCode(this.data.phoneNum, this.business)
          .then((res) => {
            UI.toast("发送成功!");
          })
      })

     
  },
  /**
  *  手机号绑定
  */
  _onChangePhoneNum: function (e) {
    let phoneNumber = e.detail.value;
    console.log(phoneNumber);
    this.setData({
      phoneNum: phoneNumber
    })
  },

  _addStaffInSchool:function(data){
    let params = {
      schoolId: this.sId,
      phoneNum: this.data.phoneNum
    }
    data.targetSchoolId = this.sId;
    // 给园所添加 教职工
    // 如果该园所是微信小程序创建的园所 就直接加入该用户到已创建的小程序园所  
    // 否则   提示 err 7000021
    TeacherSev.addStaff(params, data)
      .then(res => {
        if(res.bizData && res.bizData.token){
          let token = res.bizData.token;
          Storage.setStorageSync("cicada_token", token);
        }
        
        return TeacherSev.pushImssage({ schoolId: params.schoolId }, params);
      })
      .then(res => {
        UI.loading(false);
        UI.toast("添加成功");
        //进入首页
        Navigation.redirectTo(`/pages/index/index`);
      }, (err) => {
        UI.loading(false);
      })
  },

  /**
   * 
   * 提交表单
   */
  _onFormSubmit: function () {

    UI.loading(true);

    let data = {
      session: Storage.getStorageSync("wx_session"),
      phoneNum: this.data.phoneNum,
      smsCode: this.data.smsCode
    }
      AuthSev.bindWxUser(data)
        .then(res => {
          if (res.bizData && res.bizData.token) {
            Storage.setStorageSync("cicada_token", res.bizData.token);
          }
          if(res.bizData && res.bizData.token && !this.sId){
            Navigation.redirectTo(`/pages/index/index`);
          }
          //  这块走的是邀请招生 yqzs 
          else if(this.sId){
            var data = {
              userName: ''
            };
            AuthSev.getWxUserInfo()
              .then(res => {
                let wxUserInfo = res.userInfo;
                // 创建园所者的名字
                data.userName = wxUserInfo.nickName;
                this._addStaffInSchool(data);
              }, (err) => {
                //用户没有授权可以正常进行
                this._addStaffInSchool(data);
              }); 
          }
          // 这是一个全新的用户 
          else if (res.rtnCode == '7000005'){
            let history_page = Storage.getStorageSync('test_page');
            let saveSchool_url = '';
            saveSchool_url = history_page ? "/pages/attendance/saveSchoolA/saveSchool" :
              "/pages/attendance/saveSchoolB/saveSchool";
            Navigation.redirectTo(saveSchool_url, { type: "add", isNew: 1, phoneNum: this.data.phoneNum })
          }  
        }, err => {
          UI.loading(false);
        });
  },

  /**
   *  手机号绑定
   */
  _onChangeSmsCode: function (e) {
    let smsCode = e.detail.value;
    console.log(smsCode);
    this.setData({
      smsCode: smsCode,
      isFormDisabled: smsCode ? false : true
    })
  },
  _jumpToShow:function(){
    Navigation.redirectTo(`/pages/me/admissions/publicityPage`);
  }

}

BaseUtil.combine(page, countDown);
console.log(page);
Page(page);