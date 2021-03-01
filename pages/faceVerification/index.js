import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
let that;

function postParam(data, url, file, callback) {
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
  data: {
    baseData: "",
    msg: "",
    counting: false,
    showModalStatus: false,
    cameraStatus: true
  },

  onLoad: function (options) {
    that = this;
    // that.wxLogin();
    this.mask = this.selectComponent('#mask');
    let identificationLevel = options.identificationLevel;
    if (identificationLevel) { // 13首次 24每次 34填写身份证 12拍人脸就行
      console.log(identificationLevel)
      that.setData({
        identificationLevel: identificationLevel
      })
    };
  },

  onShow: function () {
    that.ctx = wx.createCameraContext() //创建摄像头对象
    that.settingFn();
  },

  initdonesFn: (e) => {
    console.log('用户允许', e);
    that.settingFn();
  },

  errorFn: (e) => {
    console.log('用户不允许', e)
    if (e.detail.errMsg === 'insertCamera:fail auth deny' || e.detail.errMsg === 'insertXWebCamera:fail:auth denied') {
      that.setData({
        showModalStatus: true,
        cameraStatus: false
      })
    }
  },

  settingFn: () => {
    // 检查权限，看是否跳转
    wx.getSetting({
      success(res) {
        console.log(res)
        console.log('相机授权状态', res.authSetting['scope.camera']);
        if (!res.authSetting['scope.camera']) {
          that.setData({
            showModalStatus: true,
          })
          // wx.authorize({
          //   scope: 'scope.camera',
          //   success() { // 同意摄像头
          //     that.setData({
          //       showModalStatus: false
          //     })
          //     that.wxLogin();
          //   },
          //   fail() {
          //     that.setData({
          //       showModalStatus: true
          //     })
          //   }
          // })
        } else {
          that.setData({
            showModalStatus: false,
            cameraStatus: true
          })
          that.wxLogin();
        }
      }
    })
  },


  // 二次授权允许或拒绝
  gotobargainDetailFun: (e) => {
    console.log(e);
    let status = e.currentTarget.dataset.status;
    if (status == 1) {
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  wxLogin: () => {
    mClient.login()
      .then(resp => {
        if (resp) {
          let data = {
            js_code: resp
          }
          mClient.wxGetRequest(api.Login, data)
            .then(resp => {
              console.log("授权返回参数", resp);
              if (resp.data.code == "200") {
                wx.setStorageSync('open_id', resp.data.data.openid);
                that.setData({
                  customerId: resp.data.data.customerId
                })
                if (!that.data.counting) {
                  //开始倒计时3秒
                  that.countDown(3);
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
  },

  countDown: (count) => {
    console.log(count)
    if (count == 0) {
      that.ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          console.log(res);
          that.setData({
            tempImagePath: res.tempImagePath
          })
          that.faceUpload();

          // wx.getFileSystemManager().readFile({
          //   filePath: res.tempImagePath,
          //   encoding: 'base64',
          //   success: res => {
          //     console.log(res)
          //     that.setData({
          //       baseData: res.data
          //     })
          //     that.faceUpload();
          //   },
          //   fail: err => {
          //     console.log(err)
          //     that.showToastFn("调用失败,请稍后重试");
          //   }
          // })

        },
        fail: err => {
          that.showToastFn("人脸验证失败，请稍后重试");
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      })
      that.setData({
        counting: false
      })
      return;
    }

    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    that.setData({
      counting: true,
    })
    that.data.setTime = setTimeout(function () {
      count--;
      that.countDown(count);
    }, 1000);
  },

  //人脸上传
  faceUpload: () => {
    let identificationLevel = that.data.identificationLevel,
      customerId = that.data.customerId,
      tempImagePath = that.data.tempImagePath;
    if (identificationLevel === '3' || identificationLevel === '4') {
      wx.redirectTo({
        url: 'infoIdCard/index?customerId=' + customerId + '&tempImagePath=' + tempImagePath,
      })
    } else {
      let data = {
        customerId: customerId
      }
      let params = postParam(data);
      console.log('返回data参数', params);
      wx.uploadFile({
        url: api.Detect + params,
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
                icon: 'success',
                image: '/resource/img/face0.png',
                duration: 1500
              })
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
              }, 1000)
            } else {
              that.setData({
                errData: data.msg
              })
              that.mask.util('open');
            }
          } else {
            wx.showToast({
              title: '人脸验证失败，请稍后重试',
              icon: 'none',
              duration: 1500
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
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
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      })
    }
  },

  // mask模态框
  statusNumberFn: (e) => {
    if (e.detail.status === '0') {
      that.countDown(3);
    } else {
      try {
        wx.navigateBack({
          delta: 1
        })
      } catch (e) {
        // Do something when catch error
      }
    }
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
    clearTimeout(that.data.setTime)
  },
  //封装的wx.showToast
  showToastFn: (title) => {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 3000
    })
  }
})