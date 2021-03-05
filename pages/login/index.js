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
              if (resp.data.code == "200") {
                wx.setStorageSync('open_id', resp.data.data.openid);
                wx.setStorageSync('customerId', resp.data.data.customerId);
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
        let path = decodeURIComponent(res.result);
        console.log('解码', path);
        // path = path.split('vd/')[1].split('?id=');
        path = path.split('cn/')[1];
        let factoryNO = path.split('|')[0],
          device_details_idsAll = path.split('|').splice(1);
        console.log('设备id', factoryNO);
        console.log('货道id', device_details_idsAll);
        let str = '';
        for (const key in device_details_idsAll) {
          if (device_details_idsAll.hasOwnProperty(key)) {
            const element = device_details_idsAll[key];
            str += element + "-";
          }
        }
        if (str.length > 3) {
          str = str.substring(0, str.length - 1);
        }
        console.log('str', str);
        // device_details_idsAll = device_details_idsAll.replaceAll('|', '-');

        // path = path.split('|')[1];
        // console.log('截取',path)
        // path[1] = path[1].replaceAll('|', '-');
        // var pathPart = path.substring(0, 6);
        // console.log('截取', path);
        // let [factoryNO, device_details_ids] = path;
        // console.log('截取后', factoryNO, device_details_ids);
        wx.navigateTo({
          url: '/pages/index/index?factoryNO=' + factoryNO + '&device_details_ids=' + str,
        })
      }
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