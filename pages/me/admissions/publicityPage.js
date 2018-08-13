import Admissions from "../../../api/admissions";
import navigation from "../../../utils/navigationUtil";
import UI from "../../../utils/uiUtil";
import LookParkSev from "../../../api/lookPark";
import StorageUtil from "../../../utils/storageUtil.js";
import FormaUtil from "../../../utils/formatUtil.js";
import CompatibleUtil from "../../../utils/compatibleUtil.js";
import BaseUtil from "../../../utils/baseUtil.js";
import CommonSev from '../../../common/commonSev.js';
import TeacherSev from '../../../api/teacher.js';
const sexList = ['男', '女'];
const shareConst = ['给好友分享图片', '分享名片至朋友圈']

Page({

  /**
   * 页面的初始数据
   */
  data: {
    table: [
      { className: "小班", advice: "2-3岁", sum: 5 },
      { className: "中班", advice: "3-4岁", sum: 5 },
      { className: "小班", advice: "4-5岁", sum: 5 },
    ],
    features: [
      { name: '民办园' },
      { name: '国学' },
      { name: '美术' },
      { name: '双语教学' },
      { name: '幼儿舞蹈' },
    ],
    // 学生姓名
    childName: '',
    // 学生性别
    childSex: '',
    // 学生生日
    childBirth: FormaUtil.getDate(new Date(), '-'),
    // 家长关系
    relation: '',
    //家长电话
    phoneNum: '',
    // 家长姓名
    userName: '',
    // 家庭住址
    address: '',
    // 备注
    attach: '',
    // 意向年级列表
    purposeGradeList: [],

    relationList: ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'],
    pic: "../../../imgs/pic1.png",
    fruit: "../../../imgs/fruit.png",
    nurse: "../../../imgs/nurse.png",
    dividingLine: "../../../imgs/dividingLine.png",
    measurement: "../../../imgs/measurement.png",
    // 过去页面的 填写信息
    pageFormData: {},
    isFormDisabled: true,
    isSubmit: false,
    // 控制textare 显示与隐藏
    textareShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    this.currentSchool = {
      schoolId:'6101130308',
      schoolName:'知了花田幼儿园',
      qrcodeAddress:'都市之门c座'
    }
    navigation.setNavigationBarTitle(this.currentSchool.schoolName);
    this._getFormData();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    LookParkSev.getGradeList({ schoolId: this.currentSchool.schoolId })
      .then(res => {
        this.setData({
          purposeGradeList: res.bizData
        })

      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //  从后台 拉取数据
  _getFormData: function () {



  

      // 分享过来的 
      UI.loading(true);
    Admissions.getFormInfo({ schoolId: this.currentSchool.schoolId })
        .then(res => {
          UI.loading(false);
          this.data.pageFormData = res.bizData;

          console.log('this.data.pageFormdata', this.data.pageFormData);
          this.data.pageFormData.recruitmentIcon = this.data.pageFormData.recruitmentIcon ? this.data.pageFormData.recruitmentIcon : '/imgs/normal_house.png'
          this.data.pageFormData.schoolFeature = this.data.pageFormData.schoolFeature.split(',');
          this.data.pageFormData.nutritionHelathy = this.data.pageFormData.nutritionHelathy.split(',');
          this.data.pageFormData.gardenAdds = this.currentSchool.qrcodeAddress;
          this.data.pageFormData.schoolName = this.currentSchool.schoolName;
          this.setData({
            pageFormData: this.data.pageFormData
          })
        }, err => {
          UI.loading(false);
        })

  },
  /**
   *  验证表单
   */
  _onTestData: function () {
    if (this.data.childName && this.data.childSex && this.data.childBirth && this.data.relation && this.data.userName && this.data.phoneNum) {
      this.setData({
        isFormDisabled: false
      })
    } else {
      this.setData({
        isFormDisabled: true
      })
    }
  },
  _onFormSubmit: function () {
    if (!this.data.childName) { UI.toast("请输入宝贝姓名"); return; };
    if (!this.data.childSex) { UI.toast("请选择宝贝性别"); return; };
    if (!this.data.childBirth) { UI.toast("请选择宝贝生日"); return; };
    if (!this.data.relation) { UI.toast("请选择家长关系"); return; };
    if (!this.data.userName) { UI.toast("请输入家长姓名"); return; };
    if (!this.data.phoneNum) { UI.toast("请输入家长电话"); return; };

    if (!(/^1[3456789]\d{9}$/.test(this.data.phoneNum))) {
      UI.toast("请输入正确的电话"); return;
    }

    UI.loading(true);
    let data = Object.assign({}, this.data, {
      schoolId: this.currentSchool.schoolId,
      reason: 1,
      childBirth: new Date(this.data.childBirth).getTime(),
      childSex: this.data.childSex == "男" ? 1 : this.data.childSex == "女" ? 2 : 0,
      dataSource: 1,
      //其它
      type: 4,
      //添加推荐人
      rcomId: this.userId

    })

    LookParkSev.addChild({ schoolId: this.currentSchool.schoolId }, data)
      .then(res => {
        UI.loading(false);
        this.setData({
          isSubmit: true
        })
        var requestData = {
          childName: this.data.childName,
          relation: this.data.relation,
          parentName: this.data.userName,
          parentPhoneNum: this.data.phoneNum
        }
        return TeacherSev.pushStudentsImssage({ schoolId: this.currentSchool.schoolId }, requestData);
      }, (err) => {
        UI.loading(false);
        return;
      }).then(res => {
        UI.toast("添加成功");
      }, (err) => {
        UI.loading(false);
      })
  },
  // 输入学生姓名
  _onChangeChildName: function (e) {
    let childName = e.detail.value;
    console.log('childName', childName);
    this.setData({
      childName: childName,
    })
    this._onTestData();
  },
  // 选择性别
  _onSelectSex: function (e) {
    UI.actionSheet({
      itemList: sexList
    })
      .then(res => {
        this.setData({
          childSex: sexList[res.tapIndex]
        })

      })
    this._onTestData();
  },
  //  选择 生日
  _onBirthDateChange: function (e) {
    console.log(e.detail.value);
    this.setData({
      childBirth: e.detail.value
    })
    this._onTestData();
  },
  // 选择 关系
  _onRelationChange: function (e) {
    let index = e.detail.value;
    console.log('index');
    this.setData({
      relation: this.data.relationList[index]
    })
    this._onTestData();
  },
  _onChangeParentPhoneNumber: function (e) {
    this.setData({
      phoneNum: e.detail.value
    })
    this._onTestData();
  },

  _onChangeAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  // 备注
  _onChangeAttach: function (e) {
    this.setData({
      attach: e.detail.value
    })
  },

  _onChangeParentName: function (e) {
    this.setData({
      userName: e.detail.value
    })
    this._onTestData();
  },
  onShareAppMessage: function (e) {
    console.log('e', e);
    getApp().globalData.systemInfo = wx.getSystemInfoSync();
    //检测版本
    if (!CompatibleUtil.minVersion('1.2.4')) {
      CompatibleUtil.upgradeModal();
      return;
    }

    let url = '', imageUrl = '', type = e.target ? e.target.dataset.params : '';
    let title = '';
    return Object.assign({}, CommonSev.getWxShare(title, url, imageUrl), {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败          
      }
    })

  },
 
  // 显示图片
  _onShowCodeImg: function (event) {
    let params = event.currentTarget.dataset;
    var arr = [];
    params.urls.forEach(i => {
      arr.push(i.picture)
    })
    wx.previewImage({
      current: arr[params.index], // 当前显示图片的http链接
      urls: arr// 需要预览的图片http链接列表
    })
  },
  _onShowOneCodeImg: function (event) {
    let params = event.currentTarget.dataset;
    wx.previewImage({
      current: params.index, // 当前显示图片的http链接
      urls: [params.index]
    })
  },

  /**
   * 点击我要开园
   */
  _openGarden: function () {
    navigation.redirectTo("/pages/index/index");
  }
})