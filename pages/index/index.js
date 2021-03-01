import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
import * as payment from '../../payment/payment'
// let numbers = 1;
// let bool = true;
let that;
Page({
  data: {
    GoodsCartList: [],
    hasList: true, // 列表是否有数据
    // show_edit: "block",
    // edit_name: "编辑",
    edit_show: "none",
    // 全选状态
    selectAllStatus: true, // 全选状态，默认全选
  },

  onLoad: function (options) {
    that = this;
    let myDate = new Date();
    that.setData({
      myDate: myDate
    })

    console.log("获取参数", options);
    let factoryNO = options.factoryNO;
    if (factoryNO) {
      that.setData({
        factoryNO: options.factoryNO,
        device_details_ids: options.device_details_ids
      })
    } else {
      let path = decodeURIComponent(options.id);
      console.log('解码', path);
      path = path.split('vd/')[1].split('?id=');
      path[1] = path[1].replaceAll('|', '-')
      console.log('截取', path);
      let [factoryNO, device_details_ids] = path;
      console.log('截取后', factoryNO, device_details_ids);
      that.setData({
        factoryNO: factoryNO,
        device_details_ids: device_details_ids
      })

      // const eventChannel = this.getOpenerEventChannel();
      // eventChannel.on('acceptDataFromOpenerPage', function (data) {
      //   console.log('接收参数', data);
      //   that.setData({
      //     device_details_ids: data.device_details_ids,
      //     factoryNO: data.factoryNO
      //   })
      // })
    }
  },
  // 登录
  wxLogin: () => {
    mClient.login()
      .then(resp => {
        console.log('code', resp);
        // wx.setStorageSync('open_id', 'oO8CL5YcvcNcjzX8tqAJjpSk-pWU');
        // that.goodsCartFn();
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

  goodsCartFn: () => {
    let data = {
      openid: wx.getStorageSync('open_id'),
      device_details_ids: that.data.device_details_ids,
      factoryNO: that.data.factoryNO
    }
    // let data = {
    //   openid: wx.getStorageSync('open_id'),
    //   device_details_ids: '1354728575307087872-1354728578029191168-1354728580487053312-1354728582936526848',
    //   factoryNO: 'TC8CFCA0158066'
    // }
    mClient.wxGetRequest(api.GoodsCart, data)
      .then(resp => {
        console.log("购物车返回参数", resp);
        if (resp.data.code == "200") {
          let identificationLevel = resp.data.data.identificationLevel, //跳转人脸
            adult = resp.data.data.adult;
          that.setData({
            identificationLevel: identificationLevel,
            adult: adult
          })
          let GoodsCartList = resp.data.data.orderDetailsList;
          if (GoodsCartList) {
            let orderIdList = [];
            let orderIdListWrap = [];
            for (const key in GoodsCartList) {
              if (GoodsCartList.hasOwnProperty(key)) {
                const element = GoodsCartList[key];
                element.selected = true;
                orderIdList.push(element.id);
                orderIdListWrap.push(element.id);
                if (element.quantity <= 1) {
                  element.isSub = 'isSub';
                } else {
                  element.isSub = '';
                }
              }
            }
            that.setData({
              GoodsCartList: GoodsCartList,
              pointName: resp.data.data.pointName,
              memberPay: resp.data.data.memberPay,
              merchantID: resp.data.data.merchantID,
              orderPrice: resp.data.data.orderPrice,
              orderid: resp.data.data.orderid,
              identificationLevel: resp.data.data.identificationLevel,
              orderIdList: orderIdList,
              orderIdListWrap: orderIdListWrap,
            })
          }
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
   * 当前商品选中事件
   */
  selectList(e) {
    let id = e.currentTarget.dataset.id;
    console.log('选取', id);
    let selected = e.currentTarget.dataset.selected;
    console.log(selected)
    let GoodsCartList = that.data.GoodsCartList;
    let orderIdList = that.data.orderIdList;
    if (orderIdList.length > 0) {
      orderIdList.forEach(function (item, index, arr) {
        if (selected && item === id) {
          console.log('删除')
          orderIdList.splice(orderIdList.indexOf(id), 1);
        } else if (!selected && item != id) {
          console.log('内增加')
          orderIdList.push(id)
          orderIdList = Array.from(new Set(orderIdList))
          console.log('内部去重', orderIdList);
        }
      })
    } else if (!selected) {
      console.log('增加')
      orderIdList.push(id)
    }
    that.setData({
      orderIdList: orderIdList
    })
    console.log('数组', that.data.orderIdList)
    that.data.selectAllStatus = true;
    // GoodsCartList[index].selected = !GoodsCartList[index].selected;
    for (var i = GoodsCartList.length - 1; i >= 0; i--) {
      if (GoodsCartList[i].id === id) {
        GoodsCartList[i].selected = !GoodsCartList[i].selected;
      }
      if (!GoodsCartList[i].selected) {
        that.data.selectAllStatus = false;
        // break;
      }
    }
    that.setData({
      GoodsCartList: GoodsCartList,
      selectAllStatus: that.data.selectAllStatus
    })
    that.checkedProduct(orderIdList);
  },

  /**
   * 购物车全选事件
   */
  selectAll(e) {
    let GoodsCartList = that.data.GoodsCartList;
    let selectAllStatus = that.data.selectAllStatus;
    let orderIdList = [];
    if (selectAllStatus) {
      orderIdList = [];
    } else {
      for (let i = 0; i < GoodsCartList.length; i++) {
        orderIdList.push(GoodsCartList[i].id)
      }
    }
    selectAllStatus = !selectAllStatus;
    for (let i = 0; i < GoodsCartList.length; i++) {
      GoodsCartList[i].selected = selectAllStatus;
    }
    that.setData({
      selectAllStatus: selectAllStatus,
      GoodsCartList: GoodsCartList,
      orderIdList: orderIdList
    });
    that.checkedProduct(orderIdList);
  },


  checkedProduct: orderIdList => {
    // let order_details_ids= encodeURIComponent(orderIdList);
    // let order_details_ids= JSON.stringify(orderIdList);
    let orderIdListWrap = that.data.orderIdListWrap;
    let arr = orderIdListWrap.filter(item => !orderIdList.some(ele => ele === item));
    console.log('合并去重(没选)', arr);
    console.log('选取', orderIdList);
    const data = {
      orderid: that.data.orderid,
      checked_ids: orderIdList,
      unchecked_ids: arr
    };
    mClient.wxRequest(api.CheckedProductPrice, data)
      .then(res => {
        console.log("总价", res);
        if (res.data.code == "200") {
          that.setData({
            orderPrice: res.data.data.allPrice
          })
        } else {
          that.setData({
            orderPrice: ''
          })
          // wx.showToast({
          //   title: res.data.message,
          //   icon: 'none',
          //   duration: 2000
          // })
        }
      })
      .catch(rej => {
        console.log('无法请求', rej);
      })
  },

  submitOrder: () => {
    console.log('购物车验证人脸状态', that.data.identificationLevel);
    if (that.data.identificationLevel !== 0 && that.data.adult == 0) { // 0不核验 13首次 24每次 34填写身份证 12拍人脸就行
      wx.navigateTo({
        url: '/pages/faceVerification/index?identificationLevel=' + that.data.identificationLevel,
      })
      return;
    } else if ((that.data.identificationLevel == 3 || that.data.identificationLevel == 4) && that.data.adult == 1) {
      wx.navigateTo({
        url: '/pages/faceVerification/index?identificationLevel=' + that.data.identificationLevel,
      })
      return;
    } else if (that.data.identificationLevel == 2 && that.data.adult == 1) {
      wx.navigateTo({
        url: '/pages/faceVerification/index?identificationLevel=' + that.data.identificationLevel,
      })
      return;
    } else if (that.data.identificationLevel == 4 && that.data.adult == 2) {
      wx.navigateTo({
        url: '/pages/faceVerification/index?identificationLevel=' + that.data.identificationLevel,
      })
      return;
    }

    let orderIdList = that.data.orderIdList;
    let orderIdListWrap = that.data.orderIdListWrap;
    let arr = orderIdListWrap.filter(item => !orderIdList.some(ele => ele === item));
    console.log('合并去重(没选)', arr);
    console.log('选取', orderIdList);
    that.setData({
      disabled: true
    })
    const data = {
      orderid: that.data.orderid,
      checked_ids: orderIdList,
      unchecked_ids: arr
    };
    mClient.wxRequest(api.ConfirmOrder, data)
      .then(res => {
        console.log("提交", res);
        if (res.data.code == "200") {
          if (res.data.data.finalPrice > 0) {
            that.wxpayFn();
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      })
      .catch(rej => {
        console.log('无法请求', rej);
        that.setData({
          disabled: false
        })
      })
  },

  wxpayFn: () => {
    const data = {
      orderid: that.data.orderid,
      openid: wx.getStorageSync('open_id')
    };
    mClient.wxRequest(api.Wxpay, data)
      .then(res => {
        console.log("支付", res);
        if (res.data.code == "200") {
          let info = res.data.data;
          if (info) {
            wx.requestPayment({
              'timeStamp': info.payinfo.timeStamp,
              'nonceStr': info.payinfo.nonceStr,
              'package': info.payinfo.package,
              'signType': info.payinfo.signType,
              'paySign': info.payinfo.paySign,
              'success': function (res) {
                console.log('支付成功', res)
                wx.redirectTo({
                  url: '/pages/orderDetail/index?orderid=' + that.data.orderid
                })
              },
              'fail': function (res) {
                console.log('支付失败', res);
                wx.redirectTo({
                  url: '/pages/login/index'
                })
              },
              'complete': function (res) {
                that.setData({
                  disabled: false
                })
              }
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      })
      .catch(rej => {
        console.log('无法请求', rej);
        that.setData({
          disabled: false
        })
      })
  },


  // +
  btn_add(e) {
    console.log('add');
    let id = e.currentTarget.dataset.id;
    let quan = e.currentTarget.dataset.quan;
    let mark = 'add';
    quan++;
    that.edit_cart(id, mark, quan);
  },

  //-
  btn_minus(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    let quan = e.currentTarget.dataset.quan;
    console.log('当前数量', quan)
    let mark = 'sub';
    if (quan > 1) {
      quan--;
      that.edit_cart(id, mark, quan);
    } else {
      return;
    }
  },

  //增减
  edit_cart(orderDetailsId, mark, quan) {
    const data = {
      orderDetailsId,
      mark
    };
    mClient.wxGetRequest(api.CartAddOrSub, data)
      .then(res => {
        console.log("增减", res);
        let GoodsCartList = that.data.GoodsCartList;
        if (res.data.code == "200") {
          let resoult = res.data.data;
          that.setData({
            orderPrice: resoult.orderPrice
          })
          for (const key in GoodsCartList) {
            if (GoodsCartList.hasOwnProperty(key)) {
              const element = GoodsCartList[key];
              if (element.id === orderDetailsId) {
                element.quantity = resoult.quantity;
                element.currentPrice = resoult.currentPrice;
                element.isAdd = '';
                if (res.data.data.quantity <= 1) {
                  element.isSub = 'isSub';
                } else {
                  element.isSub = '';
                }
              }
            }
          }
          that.setData({
            GoodsCartList: GoodsCartList
          });
        } else if (res.data.code == "2009") {
          for (const key in GoodsCartList) {
            if (GoodsCartList.hasOwnProperty(key)) {
              const element = GoodsCartList[key];
              if (element.id === orderDetailsId) {
                element.isAdd = 'isAdd';
              }
            }
          }
          that.setData({
            GoodsCartList: GoodsCartList
          })
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
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
        console.log('无法请求', rej);
        wx.showToast({
          title: '服务器忙，请稍后重试',
          icon: 'none',
          duration: 2000
        })
      })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery().in(that)
    query.selectAll('.custom').boundingClientRect(function (res) {
      const customHeight = res[0].height;
      that.setData({
        customHeight: customHeight
      })
    }).exec();
    let myDate1 = new Date();
    let date = myDate1.getTime() - that.data.myDate.getTime();
    console.log(date);
  },

  onShow() {
    that.wxLogin();
  },

  // 下边功能暂不使用








































  //计算金额
  // count_price() {
  //   // 获取商品列表数据
  //   let GoodsCartList = that.data.GoodsCartList;
  //   // 声明一个变量接收数组列表price
  //   let total = 0;
  //   // 循环列表得到每个数据
  //   for (let i = 0; i < GoodsCartList.length; i++) {
  //     // 判断选中计算价格
  //     if (GoodsCartList[i].selected) {
  //       // 所有价格加起来 count_money
  //       total += GoodsCartList[i].num * GoodsCartList[i].price;
  //     }
  //   }
  //   // 最后赋值到data中渲染到页面
  //   that.setData({
  //     GoodsCartList: GoodsCartList,
  //     totalPrice: total.toFixed(1)
  //   });
  // },

  // refresh() {
  //   that.setData({
  //     pageIndex: '1',
  //     GoodsCartList: []
  //   })
  //   if (that.data.GoodsCartList) {
  //     that.setData({
  //       'pull.isLoading': true,
  //       'pull.loading': '../../resource/img/pull_refresh.gif',
  //       'pull.pullText': '正在刷新',
  //       'push.pullText': '',
  //     })
  //     setTimeout(() => {
  //       that.setData({
  //         'pull.loading': '../../resource/img/finish.png',
  //         'pull.pullText': '刷新完成',
  //         'pull.isLoading': false
  //       })
  //     }, 1500)
  //   }
  // },
  // 提交订单
  // btn_submit_order: function () {

  //   console.log(that.data.totalPrice);
  //   // 调起支付
  //   // wx.requestPayment(
  //   //   {
  //   //     'timeStamp': '',
  //   //     'nonceStr': '',
  //   //     'package': '',
  //   //     'signType': 'MD5',
  //   //     'paySign': '',
  //   //     'success': function (res) { },
  //   //     'fail': function (res) { },
  //   //     'complete': function (res) { }
  //   //   })
  //   wx.showModal({
  //     title: '提示',
  //     content: '合计金额-' + that.data.totalPrice + "暂未开发",
  //   })
  // },

  // 编辑
  // btn_edit: function () {
  //   
  //   if (bool) {
  //     that.setData({
  //       edit_show: "block",
  //       edit_name: "取消",
  //       show_edit: "none"
  //     })
  //     bool = false;
  //   } else {
  //     that.setData({
  //       edit_show: "none",
  //       edit_name: "编辑",
  //       show_edit: "block"
  //     })
  //     bool = true;
  //   }
  // },
  //下载图片
  // onShow1: function (object) {
  //   let _this = that;
  //   _this.setData({
  //     isShowCav: true
  //   })
  //   wx.downloadFile({
  //     url: object.avatarurl,
  //     success: function (sres) {
  //       _this.setData({
  //         canvasUserPic: sres.tempFilePath
  //       });
  //       wx.downloadFile({
  //         url: object.show_img,
  //         success: function (sres1) {
  //           _this.setData({
  //             canvasShowImg: sres1.tempFilePath
  //           });
  //           _this.canvas(object);
  //         }
  //       })
  //     }
  //   })
  // },
  // canvas: function (object) {
  //   let _this = that;
  //   let realWidth, realHeight;
  //   //创建节点选择器
  //   var query = wx.createSelectorQuery();
  //   //选择id
  //   query.select('#mycanvas').boundingClientRect()
  //   query.exec(function (res) {
  //     //res就是 该元素的信息 数组
  //     realWidth = res[0].width;
  //     realHeight = res[0].height;
  //     console.log('realHeight', realHeight);
  //     console.log('realWidth', realWidth);
  //     const ctx = wx.createCanvasContext('mycanvas');
  //     ctx.drawImage("../../images/ctx-bg.jpg", 0, 0, realWidth, realHeight);
  //     ctx.drawImage(_this.data.canvasUserPic, (realWidth * 0.099), (realHeight * 0.052), (realWidth * 0.091), (realWidth * 0.091));
  //     ctx.setFontSize(12);
  //     ctx.setFillStyle("#a38874");
  //     ctx.fillText(object.date, (realWidth * 0.201), (realHeight * 0.076));
  //     ctx.setFontSize(14);
  //     ctx.setFillStyle("#a38874");
  //     ctx.fillText("农历" + object.lunar, (realWidth * 0.201), (realHeight * 0.099));
  //     ctx.drawImage("../../images/swiper-bg.png", (realWidth * 0.099), (realHeight * 0.112), (realWidth * 0.8), (realHeight * 0.60));
  //     ctx.drawImage(_this.data.canvasShowImg, (realWidth * 0.099), (realHeight * 0.112), (realWidth * 0.8), (realHeight * 0.30));
  //     ctx.drawImage("../../images/swiper-detail.png", (realWidth * 0.099), (realHeight * 0.395), (realWidth * 0.8), (realHeight * 0.03));
  //     ctx.setFontSize(16);
  //     ctx.setFillStyle("#8d7665");
  //     ctx.setTextAlign('center')
  //     ctx.fillText(object.title1, realWidth / 2, _this.calculateWH(2, 620, realWidth, realHeight));
  //     ctx.fillText(object.title2, realWidth / 2, _this.calculateWH(2, 666, realWidth, realHeight));
  //     ctx.drawImage("../../images/swiper-line.png", (realWidth - realWidth * 0.71) / 2, (realHeight * 0.528), (realWidth * 0.71), (realHeight * 0.0195));
  //     ctx.drawImage("../../images/luckpic.png", _this.calculateWH(1, 267, realWidth, realHeight), _this.calculateWH(2, 763, realWidth, realHeight), _this.calculateWH(1, 204, realWidth, realHeight), _this.calculateWH(2, 60, realWidth, realHeight));
  //     ctx.setFontSize(12);
  //     ctx.fillText(object.luck_title, realWidth / 2, _this.calculateWH(2, 880, realWidth, realHeight));
  //     ctx.drawImage("../../images/code.jpg", _this.calculateWH(1, 229, realWidth, realHeight), _this.calculateWH(2, 989, realWidth, realHeight), _this.calculateWH(1, 292, realWidth, realHeight), _this.calculateWH(1, 292, realWidth, realHeight))
  //     ctx.draw();
  //     setTimeout(function () {
  //       wx.canvasToTempFilePath({
  //         canvasId: 'mycanvas',
  //         success: function (res) {
  //           var tempFilePath = res.tempFilePath;
  //           _this.setData({
  //             canvasUrl: tempFilePath
  //           })
  //           if (tempFilePath !== '') {
  //             _this.setData({
  //               isShowCav: false
  //             });
  //             wx.hideLoading();
  //             wx.previewImage({
  //               current: _this.data.canvasUrl, // 当前显示图片的http链接  
  //               urls: [_this.data.canvasUrl], // 需要预览的图片http链接列表  
  //             })
  //           }
  //         },
  //         fail: function (res) {
  //           console.log(res);
  //         }
  //       });
  //     }, 500);
  //   })
  // },


  // // 删除
  // deletes: function (e) {
  //   
  //   // 获取索引
  //   const id = e.currentTarget.dataset.id;
  //   // 获取商品列表数据
  //   let GoodsCartList = that.data.GoodsCartList;
  //   wx.showModal({
  //     title: '提示',
  //     content: '确认删除吗',
  //     success: function (res) {
  //       if (res.confirm) {
  //         // 删除索引从1
  //         GoodsCartList.splice(id, 1);
  //         // 页面渲染数据
  //         that.setData({
  //           GoodsCartList: GoodsCartList
  //         });
  //         // 如果数据为空
  //         if (!GoodsCartList.length) {
  //           that.setData({
  //             hasList: false
  //           });
  //         } else {
  //           // 调用金额渲染数据
  //           that.count_price();
  //         }
  //       } else {
  //         console.log(res);
  //       }
  //     },
  //     fail: function (res) {
  //       console.log(res);
  //     }
  //   })
  // },

  // 收藏
  // btn_collert: function () {
  //   wx.showToast({
  //     title: '收藏暂未开发',
  //     duration: 2000
  //   })
  // },
  /**
   * 计算总价
   */

  // 下拉刷新
  // onPullDownRefresh: function () {
  //   // 显示顶部刷新图标  
  //   wx.showNavigationBarLoading();
  //   
  //   console.log(that.data.types_id);
  //   console.log(that.data.sel_name);
  //   wx.request({
  //     url: host + '请求后台数据地址',
  //     method: "post",
  //     data: {
  //       // 刷新显示最新数据
  //       page: 1,
  //     },
  //     success: function (res) {
  //       // console.log(res.data.data.datas);
  //       that.setData({
  //         GoodsCartList: res.data.data.datas
  //       })
  //     }
  //   })
  //   // 隐藏导航栏加载框  
  //   wx.hideNavigationBarLoading();
  //   // 停止下拉动作  
  //   wx.stopPullDownRefresh();
  // },
  // 加载更多
  // onReachBottom: function () {
  //   
  //   // 显示加载图标  
  //   wx.showLoading({
  //     title: '正在加载中...',
  //   })
  //   numbers++;
  //   // 页数+1  
  //   wx.request({
  //     url: host + '后台数据地址',
  //     method: "post",
  //     data: {
  //     // 分页
  //       page: numbers,
  //     },
  //     // 请求头部  
  //     header: {
  //       'content-type': 'application/json'
  //     },
  //     success: function (res) {
  //       // 回调函数 
  //       var num = res.data.data.datas.length;
  //       // console.log(num);
  //       // 判断数据长度如果不等于0，前台展示数据，false显示暂无订单提示信息
  //       if (res.data.data.status == 0) {
  //         for (var i = 0; i < res.data.data.datas.length; i++) {
  //           that.data.GoodsCartList.push(res.data.data.datas[i]);
  //         }
  //         // 设置数据  
  //         that.setData({
  //           GoodsCartList: that.data.GoodsCartList
  //         })
  //       } else {
  //         wx.showToast({ title: '没有更多了', icon: 'loading', duration: 2000 })
  //       }
  //       // 隐藏加载框  
  //       wx.hideLoading();
  //     }
  //   })
  // },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {

  },

})