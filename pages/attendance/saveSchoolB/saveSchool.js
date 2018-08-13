import navigation from "../../../utils/navigationUtil";
import location from "../../../utils/locationUtil";
import UI from "../../../utils/uiUtil";
import QQMapUtil from "../../../utils/qqMapUtil";
import Storage from "../../../utils/storageUtil";
import AttendanceSev from "../../../api/attendance";
import AuthSev from "../../../api/auth";
import SysUtil from "../../../utils/sys";
import TeacherSev from "../../../api/teacher.js";



Page({

  /**
   * 页面的初始数据
   */
  data: {
    schoolName : '',
    currentLocation : "",
    effective : false,
    isSubmit : false,
    isShowSearch : false,
    rangeIndex : 2,
    rangeList: [
      { name: "100米", value: 100 },
      { name: "150米", value: 150 },
      { name: "200米", value: 200 },
      { name: "300米", value: 300 },
      { name: "500米", value: 500 }
    ],
    phoneNum:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log('options-->',options);

    let data = {
        operatorType: options.type,       
        isNew: options.isNew || 0
    }
    this.sId = options.sId || '';
    this.data.phoneNum = options.phoneNum || '';

    if (data.operatorType == 'update' || this.sId){
      console.log('getApp().globalData.currentSchool', getApp().globalData.currentSchool);
       data.currentSchool = getApp().globalData.currentSchool;
       data.schoolName = data.currentSchool.schoolName;
       data.effective = data.schoolName && data.currentSchool.qrcodeAddress;

       //默认200米
       data.rangeIndex = this.data.rangeIndex;
       if (data.currentSchool.qrcodeRange){
         data.currentSchool.qrcodeRange;
         this.data.rangeList.forEach((r,index) => { 
           if (r.value == data.currentSchool.qrcodeRange){
              data.rangeIndex = index;
           }         
           });
       }      
       
    }
    //当前操作类型   
    this.setData(data);

    //获得当前用户地理位置
    this._getLocation();

    navigation.setNavigationBarTitle(this.data.operatorType == 'update' ? '修改学校地址' : '添加学校');
    getApp().event.on('refreshAddress', this._onEventChangeAddress);    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    getApp().event.un('refreshAddress')
  }, 

  /**
   *   点击开启智能名片 
   */
  _onSaveSchool:function () {

    if(!this.data.schoolName){
      UI.toast("请输入园所名称!");
      return;
    }

    if (!this.data.currentLocation || !this.data.currentLocation.address) {
      UI.toast("请选择园所地址!");
      return;
    }

    let data = Object.assign({}, this.data.currentLocation, { schoolName: this.data.schoolName,phoneNum:this.data.phoneNum}); 

    //服务端需要loginNumber 来做判断兼容老用户创建修改学校
    //  这里是修改 学校考勤地址
    if(this.data.isNew == 0){    
      let userInfo = Storage.getStorageSync("userInfo");
      if (userInfo) {
        data.phoneNum = userInfo.zlUserInfo.phoneNum;
        data.userName = userInfo.zlUserInfo.userName;
      }        

      this._afterSaveSchool(data); 
    }
    else{             
    
      //获得用户信息
      AuthSev.getWxUserInfo()
        .then(res => {
          let wxUserInfo = res.userInfo;
          data.userName = wxUserInfo.nickName;
          this._afterSaveSchool(data);
        }, (err) => {
          //用户没有授权可以正常进行
          this._afterSaveSchool(data);
        });

    }

    
    
  },
  
  _afterSaveSchool(data) {

    UI.loading(true);
    // 这是 更新学校地址 进来的
    if (this.data.operatorType == 'update') {

      let range = this.data.rangeList[this.data.rangeIndex].value;

      if(!range){
        UI.alert("系统范围出现错误!");
        return;
      }

      let params = {
        lat: data.latitude,
        lng: data.longitude,
        qrcodeAddress: data.address,
        schoolId: this.data.currentSchool.schoolId,
        //服务器容错
        schoolName: '',
        district: '',
        qrcodeRange: range
      }

      //解决部分android机型乱码问题
      AttendanceSev.updateSchool(params)
        .then(function (res) {
          UI.loading(false);
          UI.toast("修改地址成功!");
          //通知刷新学校
          getApp().event.fire("refreshSchoolList", { "schoolId": params.schoolId });
          getApp().event.fire("refreshPunchSchool", { "schoolId": params.schoolId });
          //返回
          navigation.navigateBack();

        }, function () {
          UI.loading(false);
        });
    }

    //  这是一个新添加的 学校
    else {
      SysUtil.point(`添加园所${this.data.isNew == 1 ? "(引导)" : ""} `);
      
      AttendanceSev.addSchool(data)
        .then((res) => {

          UI.loading(false);
          //学校已经存在
          if (res.bizData.isExist) {
              //如果在添加连锁园下  进入添加教职工 则提示去管理员扫码添加
              
            // if (!this.data.isNew == 1){
            //   UI.alert("输入园所已经存在!");
            //   return;
            // }

            
            let params = {
              schoolId: res.bizData.schoolId,
              phoneNum: this.data.phoneNum
            }
            let data = {
              // 创建园所者的名字
              userName: '',
              targetSchoolId: res.bizData.schoolId
            }
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
                navigation.redirectTo(`/pages/index/index`);
              }, (err) => {
                UI.loading(false);
              })



            //是微信考勤创建的  之前在系统中没有的园所 
            //if (res.bizData.isWxSchool) {
              // 添加用户  完成之后重新登录
              // teacherSev.addStaff(params, data)

              // 如果是 就直接加入该用户到 已创建的小程序创建园所  否则   提示 err 7000021 
              // 

                // 这是 id ===> res.bizData.schoolId

              //  这里之前是 将用户添加到 这个园所
              // let params = encodeURIComponent(`?type=addStaff&sId=${res.bizData.schoolId}`);
              // navigation.redirectTo(`/pages/index/index`, { scene: params });

              
            //}
            
            //  这里是系统之前的 saas 园所
           // else {
        
 



              //存入相关信息
              // let bindUserParams = {
              //   userName: '',
              //   schoolId: res.bizData.schoolId
              // }

              // Storage.setStorageSync("bindUserParams", bindUserParams);              
              // navigation.navigateTo(`/pages/me/bindUser/bindUserPhoneNum`, { type: 'bindUser'});


          //  }

          }
          else {
              // 这里会自动 进行 绑定   添加一个新的小程序园所 并对用户进行绑定

            navigation.redirectTo(`/pages/index/index`);



            // UI.toast("添加园所成功"); 
            // //判断如果首次进入
            // if (this.data.isNew == 1) {
            //   ////进入引导添加教职工界面
            //   let params = encodeURIComponent(`?type=guideStaff&sId=${res.bizData.schoolId}`);
            //   navigation.redirectTo(`/pages/index/index`, { scene: params });
            // }
            // else {                        
            //   //通知刷新学校
            //     getApp().event.fire("refreshSchoolList", { schoolId: res.bizData.schoolId});
            //   //返回
            //   navigation.navigateBack();
            // }

          }

        }, (err) => {
          UI.loading(false);
        });
    }

  },

  

  _onSelectRange: function(e){   

    this.setData({
      rangeIndex: e.detail.value - 0
    })
  
    this._setMapData(this.data.currentLocation);    
  },


  

  _onEventChangeAddress:function(data){
    console.log("data", data);
    if(data){       

      let district = data.ad_info ? data.ad_info.adcode : data.adcode;
      let currentLocation = {
        latitude: data.location.lat,
        longitude: data.location.lng,
        address : data.address,
        district: district
      }
      this._setMapData(currentLocation);
    }
  },

  _getLocation : function(){

    var currentLocation;    
    //根据类型选择是否加载用户当前位置信息
    if (this.data.operatorType == 'update'){
      currentLocation = {
        latitude: this.data.currentSchool.lat,
        longitude: this.data.currentSchool.lng,
        address : this.data.currentSchool.qrcodeAddress
      }
      this._setMapData(currentLocation);
    }
    else{
      UI.loading(true);
      //获得当前用户地理位置
      location.getLocation('gcj02')
        .then((res) => {
          console.log("当前用户位置信息", res);

          currentLocation = {
            latitude: res.latitude, 
            longitude: res.longitude 
          }
                   
          //根据经纬度查询物理名称
          return QQMapUtil.reverseGeocoder({ location: currentLocation })
        })
        .then(res => {
          console.log('tx',res);
          currentLocation.address = res.result.address;

          if (res.result.ad_info){            
            currentLocation.district = res.result.ad_info.adcode;
          }
          else{
            currentLocation.district = res.result.adcode;
          }                   

          this._setMapData(currentLocation);
          UI.loading(false);
        }, (err => {
          UI.loading(false);
        }))

    }

    

  },

  

  _setMapData: function (currentLocation){

    let markers = [{
      iconPath: "../../../imgs/wxapp-scale-code-img@2x.png",
      id: 0,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      width: 144,
      height: 32

    }];



    let circles = [{
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius: this.data.rangeList[this.data.rangeIndex].value,
      fillColor: "#00A7F74B",
      color: "#00A7F74B",
      strokeWidth: 0
    }]

    this.setData({
      currentLocation: currentLocation,
      markers: markers,
      circles: circles
    });

  },

  _forwardSelectAddress : function(){
    navigation.navigateTo("/pages/attendance/selectAddress/selectAddress");
  },

  _onChangeSchoolName: function (e) {

    let data = {
      schoolName: e.detail.value     
    }     

    this.setData(data);

    //进行模糊匹配    
    if(this.data.schoolName){     
      this._querySchoolByName();    
    }
      
  },

  
  _onSearchComplete : function(){
    this.setData({
      isShowSearch : false,
      isShowComplete : false
    })
  },
  
  _querySchoolByName : function(){
    let params = {
      pageIndex: 0,
      pageSize: 20,
      schoolName: this.data.schoolName
    }
    AttendanceSev.getZLSchoolList(params)
      .then(res=>{
        let isShowSearch = false;
        let isShowComplete = false;
        
        if(!res.bizData.pageList || res.bizData.pageList.length <=0){
            isShowSearch = false; 
            isShowComplete  = false;         
        }
        else{
            isShowSearch = true;
            isShowComplete = true;           
        }      
        this.setData({
          schoolList: res.bizData.pageList,
          isShowSearch: isShowSearch,
          isShowComplete: isShowComplete         
        })

             
      })
  },

  _onItemSelected : function(e){
      let index = e.currentTarget.dataset.index;
      let schoolName = this.data.schoolList[index].schoolName;
      this.setData({
        schoolName: schoolName,
        isShowSearch : false,
        isShowComplete: false
      })
   
  },
  /**
   * 添加页面跳转
   */
  _jumpToShow: function () {
    navigation.redirectTo(`/pages/me/admissions/publicityPage`);
  }

  

  
})