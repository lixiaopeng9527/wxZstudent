// pages/notify/lookParkList/lookParkList.js
import { request, setConfig, Promise } from '../../../lib/wx-promise-request';
import LookParkSev from "../../../api/lookPark";
import VisitorSev from "../../../api/visitor";
import FormatUtil from "../../../utils/formatUtil";
import Navigation from "../../../utils/navigationUtil";
import BaseUtil from "../../../utils/baseUtil";
import UI from "../../../utils/uiUtil";


Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    selectTab: "today",
    staticsData : '',    
    childList : [],
    purposeGradeList : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.params = {
      pageIndex : 1
    }    

    Navigation.setNavigationBarTitle("看园信息");    
  },


  

  onReady : function(){

    this.animationCtrl = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
      success: function (res) {
        console.log(res)
      }
    });


    this._getGradeList()
      .then(res=>{
        this.onPullDownRefresh();
      })
   
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.animationCtrl = null;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._loadLookParkList("refresh");
    this._loadVisitorData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("底部...");

    //加载更多
    if (this.params.pageIndex <= this.params.pageTotal){
      this._loadLookParkList("loadMore");
    }
   
  },


  _getGradeList : function(){
    return new Promise((resolver, reject)=>{
      let data = { schoolId: getApp().globalData.currentSchool.schoolId };
      LookParkSev.getGradeList(data)
        .then(res => {
          this.setData({
            purposeGradeList: res.bizData
          });
          resolver(res.bizData);
        }, (err) => { reject(err)}); 

    });
   
 },

  onChangeTab: function (e) {
    this.setData({
      selectTab: e.currentTarget.dataset.type
    });
    
    this.onPullDownRefresh();
  },

  /**
   * 获得统计
   */
  _loadVisitorData : function(){

    VisitorSev.getVisitorData()
        .then(res=>{      
            this.setData({
              staticsData : res.bizData
            })                
        });
  },

  /**
   * 获得当前看园所列表
   */
  _loadLookParkList : function(type,params){

      UI.navLoading(true);

      if(type == 'refresh'){
        this.params.pageIndex = 1;
      }
      else{
        this.params.pageIndex++;
      }
      
    LookParkSev.getChildList(this.params,{type : this.data.selectTab == 'today' ? 1 : ''})
        .then(res=>{      

            this.params.pageTotal = res.bizData.total;                     
            let childList = this._formatListData(res.bizData.rows);

            if(type == 'loadMore'){
              childList = this.data.childList.concat(childList);
            }

            this.setData({
              childList: childList
            });            

            if(type == 'refresh')
                wx.stopPullDownRefresh();


            UI.navLoading(false);

                
        },(err)=>{
          if (type == 'refresh')
               wx.stopPullDownRefresh();

          UI.navLoading(false);
        })

  },



  _formatListData(list) {

    return list.map((item) => {
      //格式化日期
      let date = FormatUtil.getDateTime(item.childBirth);
      item.filterChildBirth = `${date.y}-${date.M}-${date.d}`;

      //格式化入园时间
      let adviceTime = FormatUtil.getDateTime(item.adviceTime);
      item.filterAdviceTime = `${adviceTime.y}-${adviceTime.M}-${adviceTime.d} ${adviceTime.h}:${adviceTime.m}:${adviceTime.s}`;

      //格式化性别
      item.filterChildSex = item.childSex == 1 ? '男' : item.childSex == 2 ? '女' : '暂无';

     //格式化年级
      let pList = this.data.purposeGradeList;
      if (item.purposeGrade && pList && pList.length > 0){        
        item.filterPurposeGrade = pList.filter((p)=>{
          return p.gradeId == item.purposeGrade
        });
        item.filterPurposeGrade = item.filterPurposeGrade.length > 0 ?
          item.filterPurposeGrade[0].gradeName : '';
      }
      

      return item;
    });

  },

  /**
   * 选中卡片
   */
  _onOpenItemCard: function (event){
    let index = event.currentTarget.dataset.index;       
    let open = !this.data.isOpen;
    if (open) {
      this.animationCtrl.height(80).step();
    }
    else {
      this.animationCtrl.height(0).step();
    }
    //黑科技设置数组data
    BaseUtil.setArrayObject(this,'childList[' + index + '].animation', { isOpen: open }, this.animationCtrl.export())
   
  },

  /**
   * 拨打电话
   */
  _onCallPhone: function (event){
    let index = event.currentTarget.dataset.index;       
    let child = this.data.childList[index];
    if(!child.phoneNum){  UI.toast("没有手机号码!"); return;}
    wx.makePhoneCall({
      phoneNumber: child.phoneNum 
    })

  }
 
})