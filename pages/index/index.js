import UI from "../../utils/uiUtil";
import Net from "../../utils/netUtil";
import Navigation from "../../utils/navigationUtil";
import AuthSev from "../../api/auth";
import BaseUtil from "../../utils/baseUtil";
import StorageUtil from "../../utils/storageUtil";
import AdmissionsSev from "../../api/admissions.js";
import TeacherSev from "../../api/teacher.js";



Page({
  data: {   
    isRetry : false
  },
   

  getDelFlag : function(v1,v2){
    return (Math.abs(v1-v2) >= 1);
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    
    Navigation.setNavigationBarTitle("知了智能名片");      

    console.log("op-->", options);

    if (options.scene){
      this.sceneStr = decodeURIComponent(options.scene);   
      this.sceneType = BaseUtil.getParamByName(this.sceneStr, "type");
      this.schoolId = BaseUtil.getParamByName(this.sceneStr, "sId"); 
      this.userId = BaseUtil.getParamByName(this.sceneStr, "userId");    
      console.log("二维码场景..", this.sceneStr);  
      console.log("二维码场景..type", this.sceneType); 
    }
    else{
      this.schoolId = options.sId || '';
      this.sceneType = options.type || '';
      this.userId = options.userId || '';
      console.log("单页面场景..", this.schoolId);  
    }
    //获取当前系统版本  
    getApp().globalData.systemInfo = wx.getSystemInfoSync();
    console.log("当前系统版本", getApp().globalData.systemInfo); 
  },

  onReady: function () {
        
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
 * 生命周期函数--监听页面卸载
 */
  onShow: function () {
    //小程序最低版本
    if(this.checkMinSupport()){
        this._loginSys(); 
      //AuthSev.generaterTestAB({})         
    }         
  },

  checkMinSupport : function(){   
    if (getApp().globalData.systemInfo && getApp().globalData.systemInfo.SDKVersion < getApp().globalData.minSdkVersion) {
      UI.alert("当前微信版本过低,请更新微信版本!");
      return false;
    }
    return true;
  },
    

  /**
   * 重试logo
   */
  _onRetryLogo : function(){
    this._loginSys();
  },
  
  /**
   * 登录系统
   */
  _loginSys : function(){
   
    //登录微信系统
    AuthSev.loginSys()
      .then((data) => {
        console.log("完美登录系统....session", data.session);  
        console.log("完美登录系统....wxUnionId", data.wxUnionId);             
        let url = '',userInfo = '',zsParams = {};
        switch (this.sceneType) {
          // 分享招生
          case 'fxzs':
            zsParams = { sId: this.schoolId, zsType: 'fxzs', userId: this.userId};
            break;
            // 邀请招生
          case 'yqzs':
            zsParams = { sId: this.schoolId, zsType: 'yqzs'};
            break;
            // 去分享
          case 'qfx':
            zsParams = { sId: this.schoolId, zsType: 'qfx'};
            break;
            // 这是从 推送看园信息 进来的
          case 'zstj':
            zsParams = { sId: this.schoolId, zsType: 'zstj'};    
          default:
            break; 
        }    
        AuthSev.getCicadaUserInfo(data, zsParams)
            .then(uf => {

              userInfo = uf;
              console.log("当前用户信息..", userInfo);
              // 获得当前用户的 学校列表
              return AuthSev.getSchoolList();
            })
            .then(res => {
              if (res.rtnCode == '1000212' && zsParams.zsType == 'yqzs'){
                // 去添加 
                var data = {
                  userName: ''
                };
                AuthSev.getWxUserInfo()
                  .then(res => {
                    let wxUserInfo = res.userInfo;
                    // 创建园所者的名字
                    data.userName = wxUserInfo.nickName;
                    this._addStaffInSchool(data, userInfo);
                  }, (err) => {
                    //用户没有授权可以正常进行
                    this._addStaffInSchool(data, userInfo);
                  });
                return;
              }
              console.log("当前学校信息...", res.bizData);
              userInfo.schoolList = res.bizData;
              StorageUtil.setStorageSync("userInfo", userInfo);

              if (userInfo.schoolList.length <= 0 && zsParams.zsType != 'yqzs') {  
                 
                let history_page = StorageUtil.getStorageSync('test_page');
                let saveSchool_url = '';
                saveSchool_url = history_page ? "/pages/attendance/saveSchoolA/saveSchool":
                  "/pages/attendance/saveSchoolB/saveSchool";
                Navigation.redirectTo(saveSchool_url, { type: "add", isNew: 1, phoneNum: userInfo.loginNumber })       
                return;
              }
              //进行判断url中是否携带sId
              if(this.schoolId){

                let sList = userInfo.schoolList.filter((s) => {return s.schoolId == this.schoolId});
                // 这里是分享进来的     是他人的学校 
                if(sList.length <=0) {
                  if (zsParams.zsType == 'fxzs'){
                    AuthSev.getSchoolInfo({ schoolId: zsParams.sId })
                      .then(res => {
                        //getApp().globalData.isEditorZS = false;
                        getApp().globalData.currentSchool = res.bizData;
                        getApp().globalData.isEditorZS = false;
                        getApp().globalData.isOpenGarden = false;
                        // 这是一个 已有园的老师用户
                        getApp().globalData.hasGarden = true;
                        getApp().globalData.userId = this.userId;
                        Navigation.redirectTo('/pages/me/admissions/showAdmissions');
                        return;
                      })  
                    return;                   
                  }
                  // 自己的学校中没有分享过来的学校
                  else if(zsParams.zsType == 'yqzs'){
                    var data = {
                      userName:''
                    };
                    AuthSev.getWxUserInfo()
                      .then(res => {
                        let wxUserInfo = res.userInfo;
                        // 创建园所者的名字
                        data.userName = wxUserInfo.nickName;
                        this._addStaffInSchool(data, userInfo);
                      }, (err) => {
                        //用户没有授权可以正常进行
                        this._addStaffInSchool(data, userInfo);
                      });
                    return;
                
                   
                  }
                         
                }
                // 自己的学校中有分享过来的学校
                getApp().globalData.currentSchool = sList[0]; 
                getApp().globalData.userId = this.userId;                      
              }
              //默认选中第一个
              else{
                getApp().globalData.currentSchool = userInfo.schoolList[0];
                getApp().globalData.userId = userInfo.userId;
              }
              // 检查 该用户在当前学校是否有招生编辑权限
              this._checkUserAddSchool({ permissionCode: 'enrolStudents' })
                .then(res => {
                  UI.loading(false);

                  if (res.bizData) {
                    getApp().globalData.isEditorZS = true;
                    
                    console.log('isShowZS--->', getApp().globalData.isEditorZS);

                    //  检查 该用户是否曾经 编辑过招生页面 
                    return AdmissionsSev.getFormInfo({ schoolId: getApp().globalData.currentSchool.schoolId })
                  }
                  else {
                    getApp().globalData.isEditorZS = false;
                    getApp().globalData.isOpenGarden = false;
                    // 这是一个 已有园的老师用户
                    getApp().globalData.hasGarden = true;
                    console.log('isShowZS--->else', getApp().globalData.isEditorZS);
                    if (zsParams.zsType =='qfx'){
                      Navigation.switchTab('/pages/me/admissions/admissions');
                    }
                    else{
                      Navigation.redirectTo('/pages/me/admissions/showAdmissions');
                    }
                    return;
                  }
                }, err => {
                  UI.loading(false);
                })
                .then(res => {
                  // 如果编辑过 就去展示页  没有就去编辑页
                  if (zsParams.zsType == 'zstj'){
                    Navigation.switchTab('/pages/notify/statistics/statistics');
                  }
                  else if (!BaseUtil.isEmptyObject(res.bizData)) {
                    Navigation.redirectTo('/pages/me/admissions/showAdmissions');
                  }
                  else {
                    Navigation.switchTab('/pages/me/admissions/admissions');
                  }
                })
            
            }, (err) => {
              this.setData({ isRetry: true });
            })
        //}
      })    
  }, 
  /**
   * 检查用户在学校是否有 招生编辑权限
   */
  _checkUserAddSchool :function(data){
    return AuthSev.checkUserAddSchool(data);
  },

  _addStaffInSchool: function (data, userInfo) {
    let params = {
      schoolId: this.schoolId,
      phoneNum: userInfo.loginNumber
    }
    data.targetSchoolId = this.schoolId;
    // 给园所添加 教职工
    // 如果该园所是微信小程序创建的园所 就直接加入该用户到已创建的小程序园所  
    // 否则   提示 err 7000021
    TeacherSev.addStaff(params, data)
      .then(res => {
        //token设
        let token = res.bizData.token;
        if (token) {
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
  }

})
