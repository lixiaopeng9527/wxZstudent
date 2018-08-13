// pages/qrcode/shareCode/shareCode.js
import CodeSev from "../../../api/code";
import FormatUtil from "../../../utils/formatUtil";
import Navigation from "../../../utils/navigationUtil";
import BaseUtil from "../../../utils/baseUtil";
import UI from "../../../utils/uiUtil";
import Net from "../../../utils/netUtil";
import StorageUtil from "../../../utils/storageUtil.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareImg: ""
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
    Navigation.setNavigationBarTitle("保存图片分享");
    UI.loading(true);
    //获得用户信息
    var data = StorageUtil.getStorageSync('pageData') || {};
    StorageUtil.removeStorageSync('pageData');
    CodeSev.getShareZsQrcode({}, data)
      .then(res => {
        this.setData({
          shareImg: res.bizData
        });
        UI.loading(false);

      }, (err) => {
        UI.loading(false);
      });
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


  _onPreviewImg: function () {

    UI.previewImage({
      urls: [this.data.shareImg]
    });

  },

  /**
   * 保存图片本地
   */
  _onSaveImg: function () {
    let params = {
      url: this.data.shareImg
    }

    UI.loading(true);
    Net.downloadFile(params)
      .then(res => {
        let filePath = res.tempFilePath;
        return UI.saveImageToPhotosAlbum({ filePath: filePath });
      })
      .then(res => {
        UI.loading(false);
        UI.alert("该图片已经保存到您的手机相册，可以直接去朋友圈分享啦!");
      }, (err) => {
        UI.loading(false);
        console.log(err);
        UI.alert(err.errMsg);
      });

  }



})