// pages/notify/statistics/statistics.js
import Navigation from "../../../utils/navigationUtil";
import LookParkSev from "../../../api/lookPark";
import VisitorSev from "../../../api/visitor";
import UI from "../../../utils/uiUtil";
import CommonSev from "../../../common/commonSev";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    staticsData : '',
    currentSchool : ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {    

    this._getGradeList();
   
  },

  /**
    * 生命周期函数--监听页面显示
    */
  onShow: function () { 
      
    let appSchool = getApp().globalData.currentSchool;       
    if (appSchool.schoolId != this.data.currentSchool.schoolId) {
      this.setData({
        currentSchool: appSchool
      })
    }

    Navigation.setNavigationBarTitle(appSchool.schoolName); 
    

    this._getVisitorData(); 
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  onShareAppMessage: function () {
    return Object.assign({}, CommonSev.getWxShare(), {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败          
      }
    })
  },

  _getGradeList: function () {
    LookParkSev.getGradeList({ schoolId: getApp().globalData.currentSchool.schoolId })
      .then(res => {
          getApp().globalData.purposeGradeList = res.bizData;       
      });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._getVisitorData();
  },


  onForwardPage : function(e){
    let url = '';
    switch (e.currentTarget.dataset.type){
      case "lookPark":
        url = '/pages/notify/lookParkList/lookParkList';
        break;

    }

    Navigation.navigateTo(url);
  },

  _getVisitorData : function(){
    UI.navLoading(true);
    VisitorSev.getVisitorData()
      .then((res) => {
        this.setData({
          staticsData: res.bizData
        })
        
        UI.navLoading(false);              
        wx.stopPullDownRefresh();

        if (getApp().globalData.refreshNotice) {
          getApp().globalData.refreshNotice = false;
        }

      }, (err) => {
        UI.navLoading(false);
        wx.stopPullDownRefresh();
      });

  }
})