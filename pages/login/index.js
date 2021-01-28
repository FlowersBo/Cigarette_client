let that;
import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
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

  //扫码
  scanCode() {
    wx.scanCode({
      onlyFromCamera: true, //只允许相机
      success(res) {
        console.log("扫码", res)
        var path = decodeURIComponent(res.result);
        // let rawData = res.rawData;
        // console.log(base.base64_decode(rawData));
        console.log('解码', path);
        if (path) {
          // 登录
          mClient.login()
            .then(resp => {
              console.log('code', resp);
              if (resp) {
                let data = {
                  js_code: resp
                }
                mClient.wxGetRequest(api.Login, data)
                  .then(resp => {
                    console.log("授权返回参数", resp);
                    if (resp.data.code == "0") {
                      wx.setStorageSync('open_id', resp.data.data.openid);
                      wx.setStorageSync('sessionKey', resp.data.data.sessionKey);
                      let customerId = resp.data.data.customerId;
                      if (customerId === '0') {
                        wx.showModal({
                          showCancel: false,
                          title: '提示',
                          content: '您未关注公众号将无法使用此功能，请微信扫码关注公众号进入',
                        })
                      } else {
                        const data = {
                          short_url: path
                        }
                        mClient.wxGetRequest(api.shortUrlDistinguish, data)
                          .then(res => {
                            console.log("返回参数", res);
                            if (res.data.code == "0") {
                              if (res.data.data.types === '1') {
                                let factoryNO = res.data.data.param;
                                wx.navigateTo({
                                  url: '/pages/select_specification/index?factoryNO=' + factoryNO + '&customerId=' + customerId + '&qrcode=' + 'qr',
                                  // success: function (res) {
                                  //   res.eventChannel.emit('acceptData', {
                                  //     data: param
                                  //   })
                                  // }
                                })
                              } else {
                                let param = res.data.data.param;
                                param = param.split(',');
                                let [customerId, factoryNO, specifications] = param;
                                console.log('截取后', customerId, factoryNO, specifications);
                                wx.navigateTo({
                                  url: '/pages/wxlogin/index?customerId=' + customerId + '&factoryNO=' + factoryNO + '&specifications=' + specifications + '&qrcode=' + 'qr',
                                })
                              }
                            } else {
                              wx.showToast({
                                title: res.data.message,
                                icon: 'none',
                                duration: 1000
                              })
                              wx.hideLoading();
                            }
                          })
                          .catch(rej => {
                            console.log(rej)
                            wx.showToast({
                              title: rej.error,
                              icon: 'none',
                              duration: 2000
                            })
                          })
                      }
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  })
                  .catch(rej => {
                    console.log(rej)
                  })
              } else {
                console.log('获取用户登录态失败！' + res);
              }
            })
            .catch(rej => {
              console.log(rej)
            })
        }
        // const pathPart = path.split('vd/')[1].split('|');
        // console.log(pathPart);
        // var pathPart = path.substring(0, 6);
        // if (pathPart) {
        //   wx.setStorageSync('pathPart', pathPart);
        //   wx.navigateTo({
        //     url: '/pages/wxlogin/index',
        //   })
        // } else {
        //   wx.showToast({
        //     title: '扫码失败',
        //     icon: 'none',
        //     duration: 2000
        //   })
        // }
      }
    })
  },

  // 跳转我的
  gotouser: () => {
    wx.navigateTo({
      url: '/pages/user/index',
    })
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