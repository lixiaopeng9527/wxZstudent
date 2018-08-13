// pages/me/userInfo/userInfo.js
import navigation from "../../../utils/navigationUtil";
import Storage from "../../../utils/storageUtil";
import AuthSev from "../../../api/auth";
import UserSev from "../../../api/user";
import AttendanceSev from "../../../api/attendance";
import UI from "../../../utils/uiUtil";
import BaseUtil from "../../../utils/baseUtil";
import teacherSev from '../../../api/teacher.js';
import CompatibleUtil from "../../../utils/compatibleUtil";
import CommonSev from "../../../common/commonSev";
import SysUtil from "../../../utils/sys";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    nickName : '',
    isFocusUserName : false,
    avatarUrl : '',
    schoolList : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  

    //获得是否需要引导
    this.needGuide = options.needGuide;
    
    //获得当前学校信息
    this.setData({
      currentSchool: getApp().globalData.currentSchool
    })
    console.log(this.data.currentSchool);
    getApp().event.on('refreshSchoolList', this._onEventRefreshSchoolList);
   
    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      //获得用户信息
    AuthSev.getWxUserInfo()
      .then(res=>{
        let wxUserInfo = res.userInfo;
        console.log('wxUserInfo', wxUserInfo);
        //本地用户信息
        let cicadaUserInfo = Storage.getStorageSync("userInfo");
        console.log('cicadaUserInfo--->', cicadaUserInfo);

        console.log(cicadaUserInfo.zlUserInfo);
        console.log(wxUserInfo);

        this.setData({
          userName: cicadaUserInfo.zlUserInfo.userName,
          nickName: wxUserInfo.nickName,
          avatarUrl: wxUserInfo.avatarUrl,
          phoneNum: cicadaUserInfo.loginNumber,
          currentSchool: getApp().globalData.currentSchool,
          schoolList : cicadaUserInfo.schoolList
        })

        //存入global
        getApp().globalData.wxUserInfo = wxUserInfo;
      });   
    let cicadaUserInfo = Storage.getStorageSync("userInfo");
    this.setData({
      userName: cicadaUserInfo.zlUserInfo.userName,
      phoneNum: cicadaUserInfo.loginNumber,
      schoolList: cicadaUserInfo.schoolList,
      currentSchool: getApp().globalData.currentSchool,
    })   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {    
    navigation.setNavigationBarTitle(this.data.currentSchool.schoolName);    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    getApp().event.un('refreshSchoolList');
    getApp().event.un('settingPunch');
  },
 

  /**
   * 刷新学校列表
   */
  _onEventRefreshSchoolList : function(resData){
    //重新获得学校列表
    AuthSev.getSchoolList()
      .then(res=>{       
        if (res.bizData.length > 0) {
          let userInfo = Storage.getStorageSync("userInfo");
          userInfo.schoolList = res.bizData;           
          Storage.setStorageSync("userInfo",userInfo);

          //渲染数据源
          let dataSource = {
            schoolList: userInfo.schoolList
          };

          //选中新添加学校
          if (resData && resData.schoolId){
            let tempSchool = userInfo.schoolList.filter((s) => { return s.schoolId == resData.schoolId});              
             dataSource.currentSchool = tempSchool[0];    
             getApp().globalData.currentSchool = dataSource.currentSchool;   
             navigation.setNavigationBarTitle(getApp().globalData.currentSchool.schoolName); 
             
          }              

          this.setData(dataSource);                 

         
        }
        else{
          UI.alert("学校未找到!");
        }              
      })         
  },

  /**
   * 切换学校
   */
  _onChangeSchool : function(e){
    let index = e.detail.value;

    getApp().globalData.currentSchool = this.data.schoolList[index];  

    this.setData({
      currentSchool: getApp().globalData.currentSchool
    })  

    //修改title
    navigation.setNavigationBarTitle(this.data.currentSchool.schoolName); 
   
    
    // 判断是否有招生权限  
    this._checkUserAddSchool();
        
  },
  /**
   *  点击 头像 复制信息 lee
   */
  _onShowUserHead : function(){
    let sys = wx.getSystemInfoSync();    
    let session = wx.getStorageSync("wx_session") || '';
    let str = `当前sdk版本:${sys.SDKVersion},微信版本:${sys.version},系统:${sys.system},用户card: ${session}，用户phoneNum:${this.data.phoneNum}`;
    BaseUtil.setClipboardData(str)
      .then((res) => {
        UI.alert("用户卡片信息复制成功!");      
      })
  },

  /**
   * 跳转对应业务界面 lee
   */
  onForwardPage : function(e){
    let type = e.currentTarget.dataset.type;

    switch(type){
      case "setting":
        BaseUtil.openSetting();
        break;
      case "admissions":
        navigation.switchTab("/pages/me/admissions/admissions");
        break;
      case "updateSchool":
        //跳转修改学校考勤地址
        let history_page = Storage.getStorageSync('test_page');
        let saveSchool_url = '';
        saveSchool_url = history_page ? "/pages/attendance/saveSchoolA/saveSchool" :
          "/pages/attendance/saveSchoolB/saveSchool";
        navigation.redirectTo(saveSchool_url, { type: "update"})
        break;
    }
  },
  /**
   *  分享功能 lee
   */
  onShareAppMessage: function (res) {
    //检测版本
    if (!CompatibleUtil.minVersion('1.2.4')) {
      CompatibleUtil.upgradeModal();
      return;
    }
    console.log('res-->',res);
    console.log('getApp().globalData', getApp().globalData)
    let url='';
    if(res.from == 'button'){
      url = `/pages/index/index?sId=${this.data.currentSchool.schoolId}&type=yqzs`;
    }
    console.log('url--->yqzs',url);
    return Object.assign({}, CommonSev.getWxShare('',url,''), {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败          
      }
    })
  

  },
  /**
   * 切换检查学校时是否 有招生权限 lee
   */
  _checkUserAddSchool: function () {
    AuthSev.checkUserAddSchool({ permissionCode: 'enrolStudents' })
      .then(res => {
        UI.loading(false);
        // if (res.bizData) {
        //   getApp().globalData.isShowZS = true;
        // }
        // else {
        //   getApp().globalData.isShowZS = false;
        // }

        if (res.bizData) {
          getApp().globalData.isEditorZS = true;
        }
        else {
          getApp().globalData.isEditorZS = false;
          getApp().globalData.isOpenGarden = false;
          // 这是一个 已有园的老师用户
          getApp().globalData.hasGarden = true;
        }
        console.log('getApp().globalData.isShowZS', getApp().globalData.isEditorZS);
        getApp().event.fire('refreshUserPunch'); 
      }, err => {
        UI.loading(false);
      });
  }
})