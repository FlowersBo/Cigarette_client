// camera.js
Page({
  data: {
    src: "",
    token: "",
    base64: "",
    msg: "",
  },
  //上传至人脸库
  upload() {
    this.takePhoto();
    this.faceUpload();
  },
  //进行人脸识别
  check() {
    this.takePhoto();
    this.faceRecognition();
  },

  //拍照
  takePhoto() {
    let that = this;
    //创建拍照上下文对象
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      //拍照成功
      success: (res) => {
        console.log(res)
        wx.getFileSystemManager().readFile({
          filePath: res.tempImagePath,
          encoding: 'base64',
          success: res => {
            console.log(res)
            this.setData({
              base64: res.data
            })
          },
          //拍照失败
          fail: err => {
            console.log(err)
            this.showToast("调用失败,请稍后重试");
          }
        })
      },
      fail: err => {
        this.showToast("调用失败,请稍后重试");
      }
    })
  },
  
  //人脸上传
  faceUpload(group_id, user_id) {
    //调用接口，获取token
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', //百度智能云相关的接口地址
      data: {
        grant_type: 'client_credentials',
        client_id: 'xxxxxxxxxxxxxxxx', //用你创建的应用的API Key
        client_secret: 'xxxxxxxxxxxxxxxx' //用你创建的应用的Secret Key
      },
      header: {
        'Content-Type': 'application/json' // 默认值
      },
      //获取到之后，请求接口，向人脸库添加照片
      success: res => {
        console.log(res)
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + res.data.access_token,
          method: 'POST',
          data: {
            image: this.data.base64,
            image_type: 'BASE64',
            group_id: 'xxx', //用户组的id
            user_id: "xxxx" //给用户指定的id
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: res => {
            // console.log(res)
            if (res.data.error_msg == 'SUCCESS') {
              wx.hideLoading();
              this.showToast("上传成功");
            } else {
              this.showToast("上传失败，请稍后重试");
            }
          },
          fail(err) {
            this.showToast("上传失败，请稍后重试");
          }
        })
      },
      fail(err) {
        // console.log(err)
        this.showToast("上传失败，请稍后重试");
      }
    })
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
                that.goodsCartFn();
                //用户已点击;授权
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

  //人脸识别
  faceRecognition(group_id_list) {
    var that = this;
    wx.showLoading({
      title: '识别中',
    })
    //获取token
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token', //真实的接口地址
      data: {
        // grant_type: 'client_credentials',
        // client_id: 'xxxxxxxxxxxxxx',
        // client_secret: 'xxxxxxxxxxxxxxxx'
      },
      header: {
        'Content-Type': 'application/json'
      },
      //有了token之后，进行人脸识别
      success: res => {
        wx.request({
          url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + res.data.access_token,
          method: 'POST',
          data: {
            image: that.data.base64,
            image_type: 'BASE64',
            group_id_list: 'xxxx' //你创建的应用的用户组id
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: res => {
            wx.hideLoading();
            console.log(res)
            that.setData({
              msg: parseInt(res.data.result.user_list[0].score)
            })
            if (that.data.msg > 80) {
              let title = "识别通过,匹配率:" + this.data.msg + "%";
              this.showToast(title)
            } else {
              let title = "识别未通过,匹配率:" + this.data.msg + "%";
              this.showToast(title)
            }
          },
          fail: err => {
            wx.hideLoading();
            this.showToast("调用失败,请稍后重试")
          }
        });
      }
    })
  },
  //封装的wx.showToast
  showToast(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 3000
    })
  }
})