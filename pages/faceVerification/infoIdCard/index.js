// pages/faceVerification/infoIdCard/index.js
import * as mClient from '../../../utils/requestUrl';
import * as api from '../../../config/api';
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
    let customerId = options.customerId,
      tempImagePath = options.tempImagePath;
    if (customerId && tempImagePath) {
      that.setData({
        customerId: customerId,
        tempImagePath: tempImagePath
      })
      // that.formFaceUpload(customerId, tempImagePath);
    }
  },

  //人脸上传
  formFaceUpload: (e) => {
    console.log('提交表单', e)
    let customerId = that.data.customerId,
      tempImagePath = that.data.tempImagePath;
    console.log('文件路径', tempImagePath);
    let info = e.detail.value.info,
      idCard = e.detail.value.idCard;
    if (!info) {
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
        title: '身份证号码有误',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    that.setData({
      disabled: true
    })
    let data = {
      customerId: customerId,
      name: info,
      idCardNumber: idCard
    }
    let params = postParam(data);
    console.log('返回data参数', params);
    wx.uploadFile({
      url: api.Verify + params,
      filePath: tempImagePath,
      name: 'file',
      formData: {},
      header: {
        'Content-Type': 'multipart/form-data'
      },
      success: function (res) {
        console.log('上传返回', res);
        if (res.statusCode == 200) {
          let data = JSON.parse(res.data);
          console.log(data)
          if (data.success) {
            wx.showToast({
              title: data.data,
              icon: 'none',
              duration: 1500
            })
            setTimeout(() => {
              that.setData({
                disabled: false
              })
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
          } else {
            wx.showToast({
              title: data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          that.setData({
            disabled: false
          })
          wx.showToast({
            title: '人脸验证失败，请重试',
            icon: 'none',
            duration: 1500
          })
        }
      },
      fail: function (err) {
        console.log('错误', err);
        wx.showToast({
          title: err,
          icon: 'none',
          duration: 1500
        })
        setTimeout(() => {
          that.setData({
            disabled: false
          })
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      },
      complete: function (e) {

      }
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