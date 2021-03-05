// pages/faceVerification/infoIdCard/index.js
import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
let that;

function postParam(data, url, callback) {
  const keys = Object.keys(data)
  let params = '?'
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    let value = data[key]
    if (value != null && value != '') {
      if (i != 0) {
        params += '&'
      }
      //对特殊字符进行转义
      value = encodeURIComponent(value)
      params += key + '=' + value
    }
  }
  return params;
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let orderid = options.orderid,
      checked_ids = options.checked_ids,
      unchecked_ids = options.unchecked_ids,
      entrance = options.entrance;
    if (checked_ids && unchecked_ids) {
      that.setData({
        checked_ids: checked_ids,
        unchecked_ids: unchecked_ids,
        orderid: orderid
      })
    }
    if (entrance) {
      that.setData({
        entrance: entrance
      })
    }
  },

  //提交
  formFaceUpload: (e) => {
    console.log('提交表单', e)
    // let customerId = that.data.customerId,
    //   tempImagePath = that.data.tempImagePath;
    let infoName = e.detail.value.info,
      idCard = e.detail.value.idCard,
      checked_ids = that.data.checked_ids,
      unchecked_ids = that.data.unchecked_ids;
    if (!infoName) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (!idCard) {
      wx.showToast({
        title: '请填写身份证号',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (idCard.length < 18) {
      wx.showToast({
        title: '身份证号有误',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    // that.setData({
    //   disabled: true
    // })
    wx.navigateTo({
      url: '/pages/faceVerification/index?infoName=' + infoName + '&idCard=' + idCard + '&checked_ids=' + checked_ids + '&unchecked_ids=' + unchecked_ids + '&orderid=' + that.data.orderid + '&entrance=' + that.data.entrance,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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