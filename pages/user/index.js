// pages/user/index.js
import * as util from '../../utils/util';
import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
let app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.mask = this.selectComponent('#mask');
    let date = util.customFormatTime(new Date());
  },

  userInfoFn: () => {
    let data = {
      customerId: wx.getStorageSync('customerId'),
    }
    mClient.wxGetRequest(api.GetAdult, data)
      .then(resp => {
        console.log('我的返回', resp);
        if (resp.data.code == 200) {
          that.setData({
            adult: resp.data.data.adult
          });

        } else {
          wx.showToast({
            title: resp.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      });
  },

  faceFn: () => {
    let adult = that.data.adult;
    if (adult === 2) {
      wx.showToast({
        title: '身份核验已完成',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.navigateTo({
        url: "../faceVerification/index?identificationLevel=" + 3
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onShow: function () {
    that.userInfoFn();
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})