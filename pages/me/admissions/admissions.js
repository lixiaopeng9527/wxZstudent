import AdmissionsSev from "../../../api/admissions";
import UI from "../../../utils/uiUtil";
import navigation from "../../../utils/navigationUtil.js"
import BaseUtil from "../../../utils/baseUtil";
import CompatibleUtil from "../../../utils/compatibleUtil";
import SysUtil from "../../../utils/sys";
import CommonSev from "../../../common/commonSev";
import StorageUtil from "../../../utils/storageUtil.js";
import FormaUtil from "../../../utils/formatUtil.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 封面
    recruitmentIcon: '',
    // 幼儿园性质
    schoolTypeList: [
      { name: '民办园', value: 1, active: true },
      { name: '公办园', value: 2 },
      { name: '普惠园', value: 3 }],
    // 招生范围
    statics:2,
    schoolRange: [
      { statics: 0, grade: '小班', age: '2-3岁', num: '' },
      { statics: 1, grade: '中班', age: '3-4岁', num: '' },
      { statics: 2, grade: '大班', age: '4-5岁', num: '' }
    ], 
    // 小朋友的照片
    studentActiveIcon:[],
    schoolFeature: [
    { name: '蒙特梭利', value: '蒙特梭利', active: true },
    { name: '国学', value: '国学' },
    { name: '奥尔夫', value: '奥尔夫' },
    { name: '外教', value: '外教' },
    { name: '绿色园所', value: '绿色园所' },
    { name: '美术', value: '美术' },
    { name: '感统', value: '感统' },
    { name: '双语教学', value: '双语教学' },
    { name: '幼儿舞蹈', value: '幼儿舞蹈' },
    ],
    // 教学图片
    teachIcon:[],
    // 营养健康、
    nutritionHelathy: [
      { name: '科学食谱', value: '科学食谱', active: true },
      { name: '晨、午检', value: '晨、午检' },
      { name: '体质测评', value: '体质测评' }
    ],
    // 食谱照片
    recipeIcon:[],
    // 园所介绍
    schoolIntroduction: "",
    // 招生标题
    schoolIntro:"",
    // 招生电话
    phoneNum:"",
    //招生时间
    recruitmentStartDate: FormaUtil.getDate(new Date(),'-'),
    recruitmentEndDate:'',
    // 园所其他
    schoolOtherIcon:[],
    addPicUrl: "../../../imgs/wxapp-addPicture.png",
    kindergartenPic: "../../../imgs/nature.png",
    scope: "../../../imgs/scope.png",
    child: "../../../imgs/childPic.png",
    deleteP:"../../../imgs/delete.png",
    features: "../../../imgs/features.png",
    food: "../../../imgs/food.png",
    kindergarten: "../../../imgs/kindergarten.png",
    imsage: "../../../imgs/message.png",
    pageSize:6,

    // 拉取过来的 消息
    pageFormData:{
      //  封面的url
      recruitmentIcon:'',
      schoolType:'',

      studentActiveIcon:[],
      teachIcon: [],
      recipeIcon:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    navigation.setNavigationBarTitle("完善信息"); 
    getApp().event.on('refreshUserPunch', this._getFormData);
    console.log('onLoad-->'); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady-->');
    this.userEasyModal = this.selectComponent("#userEasyModal");
    this._getFormData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onshow-->');
  },
  onUnload:function(){
    getApp().event.un('refreshUserPunch'); 
  },
  onShareAppMessage: function (e) {
    console.log('e',e);
    let url = '', imageUrl = '', type = e.from;
    let title = '';
    switch (type) {
      case 'menu':
        break;
      case 'button':
        url = '/pages/index/index';
        title = this.data.schoolIntro;
        imageUrl = this.data.recruitmentIcon
        break;
      default:
    }
    return Object.assign({}, CommonSev.getWxShare(title,url,imageUrl), {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败          
      }
    })
  },
  //  加工数据
  _processData:function(){
    console.log(this.data.pageFormData);
    
    if(this.data.pageFormData){
      //1. 封面 url
      this.data.recruitmentIcon = this.data.pageFormData.recruitmentIcon ? this.data.pageFormData.recruitmentIcon :'';
      this.setData({
        recruitmentIcon: this.data.recruitmentIcon
      })

      //2. 园所性质
      this.data.schoolTypeList.forEach( i => {
        if (i.value == this.data.pageFormData.schoolType){
          i.active = true;
        }
        else{
          i.active = false;
        }
      })
      this.setData({
        schoolTypeList: this.data.schoolTypeList
      })
      // 3.招生范围
      console.log(this.data.schoolRange);
      if(this.data.pageFormData.schoolRange.length > 0)
      {
        // var arr = this.data.pageFormData.schoolRange.slice(0, 3);
        // arr.forEach((ele, inx) => {
        //   ele.statics = inx;
        // })
        // var arr1 = this.data.pageFormData.schoolRange.slice(3);
        // arr1.forEach(i => {
        //   i.add = true;
        // })
        this.data.pageFormData.schoolRange.forEach((ele,inx) => {
          ele.statics = inx;
        })
        // this.data.schoolRange = this.data.pageFormData.schoolRange ?
        //   arr.concat(arr1) : this.data.schoolRange;
      }
      
      this.setData({
        schoolRange: this.data.pageFormData.schoolRange
      })  
      // 4. 小朋友的照片

      this.data.studentActiveIcon = this.data.pageFormData.studentActiveIcon.length?
        this.data.pageFormData.studentActiveIcon:[];
      this.setData({
        studentActiveIcon: this.data.studentActiveIcon
      })
      // 5 .园所特色
      
      var arr = [],h = {}, temp = [];
      this.data.schoolFeature.forEach(function(v){
        arr.push(v.value)
      })
      var c = arr.concat(this.data.pageFormData.schoolFeature);
      c.forEach(function(f,i){
        if(!h[f]){
          h[f]=true;
          temp.push({name:f,value:f})
        }
      })
      this.data.pageFormData.schoolFeature.forEach( p => {
        temp.forEach(o => {
          if (p == o.value) {
            o.active = true;
          }
        })
      })
      this.setData({
        schoolFeature:temp 
      })
      // 6.添加教学图片

      this.data.teachIcon = this.data.pageFormData.teachIcon.length ?
        this.data.pageFormData.teachIcon : [];
      this.setData({
        teachIcon: this.data.teachIcon
      })
      // 7. 营养健康
        this.data.pageFormData.nutritionHelathy.forEach(p => {
        this.data.nutritionHelathy.forEach(o => {
            if (p == o.value) {
              o.active = true;
            }
          })
        })
      this.setData({
        nutritionHelathy: this.data.nutritionHelathy
      })

      // 8 . 添加食谱
      this.data.recipeIcon = this.data.pageFormData.recipeIcon.length ?
        this.data.pageFormData.recipeIcon : [];
      this.setData({
        recipeIcon: this.data.recipeIcon
      })
      // 9.园所介绍
      this.data.schoolIntroduction = this.data.pageFormData.schoolIntroduction?
        this.data.pageFormData.schoolIntroduction:'';
        this.setData({
          schoolIntroduction: this.data.schoolIntroduction
        })

        
        // 10 . 添加食谱
        this.data.schoolOtherIcon = this.data.pageFormData.schoolOtherIcon.length ?
          this.data.pageFormData.schoolOtherIcon : [];
        this.setData({
          schoolOtherIcon: this.data.schoolOtherIcon
        })
       // 招生标题
        this.data.schoolIntro = this.data.pageFormData.schoolIntro?
          this.data.pageFormData.schoolIntro:'';
          this.setData({
            schoolIntro: this.data.schoolIntro
          })
      // 招生热线
        this.data.phoneNum = this.data.pageFormData.phoneNum?
          this.data.pageFormData.phoneNum:'';
        this.setData({
          phoneNum: this.data.phoneNum
        })
        console.log(111);
      // 招生开始时间
        this.data.recruitmentStartDate = this.data.pageFormData.recruitmentStartDate?
          this.data.pageFormData.recruitmentStartDate:''; 
        console.log(this.data.recruitmentStartDate);
        this.setData({
          recruitmentStartDate: this.data.recruitmentStartDate
        })  
        // 招生结束时间
        this.data.recruitmentEndDate = this.data.pageFormData.recruitmentEndDate ?
          this.data.pageFormData.recruitmentEndDate : '';
        this.setData({
          recruitmentEndDate: this.data.recruitmentEndDate
        }) 
    }
  },
  //  从后台 拉取数据
  _getFormData: function () {
    this.currentSchool = getApp().globalData.currentSchool;
    this.setData({
      isEditorZS: getApp().globalData.isEditorZS ? true : false
    })
    console.log('isEditorZS-->', getApp().globalData.isEditorZS);
    if (!this.data.isEditorZS) {
      getApp().globalData.isOpenGarden = false;
      // 这是一个 已有园的老师用户
      getApp().globalData.hasGarden = true;
    } 
    UI.loading(true);
    AdmissionsSev.getFormInfo({ schoolId: this.currentSchool.schoolId  })
      .then(res => {
        UI.loading(false);
        this.data.pageFormData = res.bizData;
        if (BaseUtil.isEmptyObject(res.bizData)){
          this.setData({
            //
            // 封面
    recruitmentIcon: '',
    // 幼儿园性质
    schoolTypeList: [
      { name: '民办园', value: 1, active: true },
      { name: '公办园', value: 2 },
      { name: '普惠园', value: 3 }],
    // 招生范围
    statics:2,
    schoolRange: [
      { statics: 0, grade: '小班', age: '2-3岁', num: '' },
      { statics: 1, grade: '中班', age: '3-4岁', num: '' },
      { statics: 2, grade: '大班', age: '4-5岁', num: '' }
    ], 
    // 小朋友的照片
    studentActiveIcon:[],
    schoolFeature: [
    { name: '蒙特梭利', value: '蒙特梭利', active: true },
    { name: '国学', value: '国学' },
    { name: '奥尔夫', value: '奥尔夫' },
    { name: '外教', value: '外教' },
    { name: '绿色园所', value: '绿色园所' },
    { name: '美术', value: '美术' },
    { name: '感统', value: '感统' },
    { name: '双语教学', value: '双语教学' },
    { name: '幼儿舞蹈', value: '幼儿舞蹈' },
    ],
    // 教学图片
    teachIcon:[],
    // 营养健康、
    nutritionHelathy: [
      { name: '科学食谱', value: '科学食谱', active: true },
      { name: '晨、午检', value: '晨、午检' },
      { name: '体质测评', value: '体质测评' }
    ],
    // 食谱照片
    recipeIcon:[],
    // 园所介绍
    schoolIntroduction: "",
    // 招生标题
    schoolIntro:"",
    // 招生电话
    phoneNum:"",
    //招生时间
    recruitmentStartDate: FormaUtil.getDate(new Date(),'-'),
    recruitmentEndDate:'',
    // 园所其他
    schoolOtherIcon:[]
          })
          return;
        }
        this.data.pageFormData.schoolFeature = this.data.pageFormData.schoolFeature.split(',');
        this.data.pageFormData.nutritionHelathy = this.data.pageFormData.nutritionHelathy.split(',');
        this.setData({
          pageFormData: this.data.pageFormData
        })
        // 加工数据
        this._processData();
      },err => {
        UI.loading(false);
      })
  },
  // 删除 孩子
  _deleteChild:function(e){
    let inx = e.currentTarget.dataset.inx;
    this.data.studentActiveIcon.splice(inx,1);
    this.setData({
      studentActiveIcon: this.data.studentActiveIcon
    })
  },
  // 删除 教学
  _deleteTeacher:function(e){
    let inx = e.currentTarget.dataset.inx;
    this.data.teachIcon.splice(inx, 1);
    this.setData({
      teachIcon: this.data.teachIcon
    })
  },
  // 删除 教学
  _deleteDiet: function (e) {
    let inx = e.currentTarget.dataset.inx;
    this.data.recipeIcon.splice(inx, 1);
    this.setData({
      recipeIcon: this.data.recipeIcon
    })
  },
  //_deleteOther
  _deleteOther:function(e){
    let inx = e.currentTarget.dataset.inx;
    this.data.schoolOtherIcon.splice(inx, 1);
    this.setData({
      schoolOtherIcon: this.data.schoolOtherIcon
    })
  },
  // 展示 img
  _onShowCodeImg: function (event) {
    let params = event.currentTarget.dataset;
    var arr = [];
    params.urls.forEach( i => {
      arr.push(i.picture)
    })
    UI.previewImage({
      current: params.curr, // 当前显示图片的http链接
      urls: arr// 需要预览的图片http链接列表
    })
  },
  /**
   *  点击输入
   */
  _bindKeyInput:function(e){
   
    this.data.schoolRange.forEach( i => {
      // if (!i.add && i.statics == e.currentTarget.dataset.statics){
      //   i.num = Number(e.detail.value);
      // }
      // else if (i.add && i.statics == e.currentTarget.dataset.statics){
      //   if (e.currentTarget.dataset.name == 'grade'){
      //      i.grade = e.detail.value;
      //   }
      //   else if (e.currentTarget.dataset.name == 'age'){
      //     i.age = e.detail.value;
      //   }
      //   else if (e.currentTarget.dataset.name == 'num'){
      //     i.num = Number(e.detail.value)
      //     console.log(i.num);
      //   }
      // }
      if (i.statics == e.currentTarget.dataset.statics){
        if (e.currentTarget.dataset.name == 'grade') {
          i.grade = e.detail.value;
        }
        else if (e.currentTarget.dataset.name == 'age') {
          i.age = e.detail.value;
        }
        else if (e.currentTarget.dataset.name == 'num') {
          i.num = e.detail.value;
          console.log(i.num);
        }
      }

    })
    console.log('this.data.schoolRange', this.data.schoolRange);
  },
  /**
   * 招生范围 - 自定义添加
   */
  _selfAdd:function(){
    if (this.data.schoolRange.length >= 5){
      return;
    }
    // this.data.schoolRange.push({
    //   grade: '',
    //   age: '',
    //   num: '',
    //   add:true
    // })
    this.data.statics++;
    this.data.schoolRange.push({
      grade: '',
      age: '',
      num: '',
      statics: this.data.statics
    })
    console.log('this.data.schoolRange', this.data.schoolRange);
    this.setData({
      schoolRange: this.data.schoolRange
    })
  },
  // 选择封面
  __chooseHeaderPic: function () {

    this._choosePic(1)
      .then(res => {
        this.setData({
          recruitmentIcon: res[0].url,
        })
      })
  },

  // 添加小朋友图片
  __chooseChildPic: function () {
    var pageSize = this.data.pageSize - this.data.studentActiveIcon.length;
    console.log('pageSize-->', pageSize);
    this._choosePic(pageSize)
      .then(res => {
        res.forEach(i => {
          this.data.studentActiveIcon.push({ type: 3, picture: i.url })
        })
        this.setData({
          studentActiveIcon: this.data.studentActiveIcon.slice(0,6)
        })
      })
    
  },

  //添加教学图片
  _chooseTeacherPic: function () {
    var pageSize = this.data.pageSize - this.data.teachIcon.length
    this._choosePic(pageSize)
      .then(res => {
        res.forEach(i=> {
          this.data.teachIcon.push({ type: 4, picture: i.url })
        })
        this.setData({
          teachIcon: this.data.teachIcon.slice(0, 6)
        })
      })
  },
  // 添加食谱图片
  _chooseHealthyPic: function () {
    var pageSize = this.data.pageSize - this.data.recipeIcon.length
    this._choosePic(pageSize)
      .then(res => {
        res.forEach(i => {
          this.data.recipeIcon.push({ type: 5, picture: i.url })
        })
        this.setData({
          recipeIcon: this.data.recipeIcon.slice(0, 6)
        })
      })
  },
  // 添加园所介绍图片
  _chooseIntroducePicPic: function() {
    var pageSize = this.data.pageSize - this.data.schoolOtherIcon.length;
    this._choosePic(pageSize)
      .then(res => {
        res.forEach(i => {
          this.data.schoolOtherIcon.push({ type: 6, picture: i.url })
        })
        this.setData({
          schoolOtherIcon: this.data.schoolOtherIcon.slice(0, 6)
        })
      })
  },
  _choosePic: function (pageSize) {
    pageSize = pageSize >= 0 ?pageSize:6;
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: pageSize,
        success: res => {
          console.log('res--->', res);
          var arrUrl = [];
          res.tempFilePaths.forEach((ele,inx)=> {
            return AdmissionsSev.uploadFile(ele)
            .then(result => {
              if (result.statusCode == 200) {
                var data = JSON.parse(result.data).data;
                data.inx = inx;
                arrUrl.push(data);
                console.log('arrUrl', arrUrl);
                if (arrUrl.length == res.tempFilePaths.length){
                  arrUrl.sort(function (a, b) {
                    return a.inx - b.inx;
                  });
                  resolve(arrUrl);
                }
              }
            }, err => {
              reject(err);
            })
          }) 
        }
      })
    })


  },
  // 选择日期
  bindDateChange: function (e) {
    this.setData({
      recruitmentStartDate: e.detail.value
    })
  },
  _bindEndDateChange: function (e) {
    this.setData({
      recruitmentEndDate: e.detail.value
    })
  },
  _onChangeUserName: function (e) {
    this.setData({
      tempUserName: e.detail.value
    })
  },

  _confirmEventUpdateUser: function (e) {
    if (!this.data.tempUserName) {
      UI.alert("请填写您的自定义名称!");
      return;
    }
    var flag = false;
    this.data.schoolFeature.forEach( i=> {
      if (i.value == this.data.tempUserName){
          flag = true;
      }
    })
    if(!flag){
      // if (this.data.schoolFeature.filter(o => {
      //   return o.active == true
      // }).length >= 5) {
      //   UI.alert('最多选择5项');
      //   return;
      // }

      this.data.schoolFeature.push({
        name: this.data.tempUserName,
        value: this.data.tempUserName,
        active: false
      })
    }
    else{
      UI.alert("自定义名称重复了!");
    }
    
    this.setData({
      schoolFeature: this.data.schoolFeature
    });
    this.userEasyModal.hide();
  },


  _addItem: function (e) {
    this.userEasyModal.show();
    this.setData({
      isFocusUserName: true,
      tempUserName: this.data.featuresName || ''
    })
  },

  /**
   * 选择园所性质
   */
  _chooseRadio: function (e) {
    this.data.schoolTypeList.forEach(i => {
      if (i.value == e.currentTarget.dataset.id) {
        i.active = true;
      }
      else {
        i.active = false;
      }
    })
    this.setData({
      schoolTypeList: this.data.schoolTypeList
    })
  },
/**
 * 园所特色的选择
 */
  _chooseCheckBox: function (e) {
   
    this.data.schoolFeature.forEach(i => {
      if (!i.active && i.value == e.currentTarget.dataset.value) {
        if (this.data.schoolFeature.filter(o => {
          return o.active == true
        }).length >= 5) {
          UI.alert('最多选择5项');
          return;
        }
        i.active = true;
      } else if (i.value == e.currentTarget.dataset.value) {
        if (this.data.schoolFeature.filter(o => {
          return o.active == true
        }).length == 1) {
          UI.alert('至少选择1项');
          return;
        }
        i.active = false;
      }
    })
    this.setData({
      schoolFeature: this.data.schoolFeature
    })
  },

/**
 *  选择营养保健
 */
  _chooseHealthy: function (e) {
    this.data.nutritionHelathy.forEach(i => {
      if (!i.active && i.value == e.currentTarget.dataset.value) {
        i.active = true;
      }
      else if (i.value == e.currentTarget.dataset.value){
        if (this.data.nutritionHelathy.filter(o => {
          return o.active == true
        }).length == 1) {
          UI.alert('至少选择1项');
          return;
        }
        i.active = false;
      }
    })
    this.setData({
      nutritionHelathy: this.data.nutritionHelathy
    })
  },

  _onFormSubmit: function (e) {
    // 园所特色
    UI.loading(true);

    let params = e.detail.value;
    console.log('parasm', params);

    var schoolFeature = this.data.schoolFeature.filter((i) => {
      return i.active == true;
    })
    var tempArr = [];
    schoolFeature.forEach(o => {
      tempArr.push(o.value)
    })

    // 营养健康
    var schoolFoods = this.data.nutritionHelathy.filter((i) => {
      return i.active == true;
    })
    var tempArr1 = [];
    schoolFoods.forEach(o => {
      tempArr1.push(o.value)
    })
    // 园所性质
    let schoolType = ''
    this.data.schoolTypeList.forEach( i => {
      if(i.active){
        schoolType = i.value;
      }
    }) 
    var schoolRange = []
    this.data.schoolRange.forEach( (ele,inx) => {
      if (ele.grade != '' || ele.num != '' || ele.age != ''){
        schoolRange.push(ele);
      }
    })
    if (!params.schoolIntro) { UI.toast("请输入招生标题"); return; };
    if (!params.phoneNum) { UI.toast("请输入报名热线"); return; };
    if (!this.data.recruitmentStartDate) { UI.toast("请选择开始时间"); return; };
    if (!this.data.recruitmentEndDate) { UI.toast("请选择结束时间"); return; };
    //if (this.data.studentActiveIcon.length < 2) { UI.toast("请至少添加"); return; };
    let data = {
      schoolIntro: params.schoolIntro,
      phoneNum: params.phoneNum,
      recruitmentStartDate: this.data.recruitmentStartDate,
      recruitmentEndDate: this.data.recruitmentEndDate,
      schoolIntroduction: params.schoolIntroduction,

      // 封面的
      recruitmentIcon: this.data.recruitmentIcon,
      // 园所性质
      schoolType: schoolType,
      // 招生范围
      schoolRange: schoolRange,
      // 小朋友的
      studentActiveIcon: this.data.studentActiveIcon,
      // 园所特色
      schoolFeature: tempArr.join(','),
      // 教学的
      teachIcon: this.data.teachIcon,
      // 营养健康
      nutritionHelathy: tempArr1.join(','),
      // 营养的
      recipeIcon: this.data.recipeIcon,
      // 添加园所图片
      schoolOtherIcon: this.data.schoolOtherIcon,

      
      
    }
    console.log('data', data);
    AdmissionsSev.submitForm(data)
      .then(res => {
        UI.loading(false);
        StorageUtil.setStorageSync("pageFormdata", data);
        navigation.navigateTo("/pages/me/admissions/showAdmissions");
      }, err => {
        UI.loading(false);
      })
  },
  _backtoBack:function(){
    navigation.redirectTo("/pages/me/admissions/showAdmissions");
  }
})