// pages/orderDetail/indx.js
import * as mClient from "../../utils/requestUrl";
import * as api from "../../config/api";
import * as util from "../../utils/util";
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    console.log(options)
    let orderid = options.orderid;
    if (orderid) {
      // let orderid = "1355035207031324672";
      that.orderDetailFn(orderid);
    }
  },

  orderDetailFn: orderid => {
    let data = {
      orderid
    };
    mClient.wxGetRequest(api.OrderDetails, data)
      .then(res => {
        console.log('订单详情', res)
        if (res.data.code == '200') {
          let orderDetail = res.data.data;
          let tbOrderInfo = res.data.data.tbOrderInfo;
          if (tbOrderInfo.payDate) {
            tbOrderInfo.payDate = util.timestampToTimeLong(tbOrderInfo.payDate);
          }
          that.setData({
            orderDetail: orderDetail,
            tbOrderInfo: tbOrderInfo
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      })
      .catch(rej => {
        console.log(rej)
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