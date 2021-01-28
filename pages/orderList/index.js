// pages/orderList/index.js
const app = getApp();
let that;
import * as mClient from '../../utils/requestUrl';
import * as api from '../../config/api';
import * as util from '../../utils/util';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    pageIndex: '1',
    pageSize: '10',
    isFlag: false,
    pull: {
      isLoading: false,
      loading: '../../resource/img/pull_refresh.gif',
      pullText: '正在刷新'
    },
    push: {
      isLoading: false,
      loading: '../../resource/img/pull_refresh.gif',
      pullText: ''
    },
    date: '',
    priceSum: -1, //当日销售总额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let pageIndex = '1';
    // let date = util.customFormatTime(new Date());
    // that.setData({
    //   date: date
    // })
    that.orderListFn(pageIndex);
  },

  // 订单列表
  orderListFn: (pageIndex,searchDate) => {
    that.setData({
      isFlag: false
    })
    const data = {
      pageSize: that.data.pageSize,
      pageIndex,
      pointId: wx.getStorageSync('pointId'),
      searchDate
    }
    mClient.wxGetRequest(api.OrderList, data)
      .then(res => {
        console.log("订单列表", res);
        if (res.data.code == "200") {
          let orderList = res.data.data.orderList;
          // that.setData({
          //   priceSum: res.data.data.priceSum
          // })
          if (orderList) {
            orderList.forEach(element => {
              element.createDate = util.timestampToTimeLong(element.createDate);
            });
          }
          orderList = that.data.orderList.concat(orderList);
          if (orderList.length >= 10) {
            const pullText = '- 上拉加载更多 -'
            that.setData({
              'push.pullText': pullText,
            })
          }
          if (orderList.length <= 0) {
            that.setData({
              isFlag: true
            })
          }
          console.log('修改后订单列表', orderList);
          that.setData({
            orderList: orderList,
            pageIndex: pageIndex,
            count: res.data.data.count,
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
          that.setData({
            isFlag: true
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
        that.setData({
          isFlag: true
        })
      })
  },

  //日期选择
  bindDateChange: (e) => {
    console.log(e);
    let date = e.detail.value;
    that.setData({
      date: date,
      'push.pullText': ''
    })
    let pageIndex = '1';
    that.setData({
      pageIndex: '1',
      orderList: []
    })
    that.orderListFn(pageIndex, date);
  },


  refresh() {
    let pageIndex = '1';
    // let date = util.customFormatTime(new Date());
    that.setData({
      pageIndex: '1',
      orderList: [],
      date: '',
      priceSum: -1
    })
    if (that.data.orderList.length <= 0) {
      that.setData({
        'pull.isLoading': true,
        'pull.loading': '../../resource/img/pull_refresh.gif',
        'pull.pullText': '正在刷新',
        'push.pullText': '',
      })
      that.orderListFn(pageIndex);
      setTimeout(() => {
        that.setData({
          'pull.loading': '../../resource/img/finish.png',
          'pull.pullText': '刷新完成',
          'pull.isLoading': false
        })
      }, 1500)
    }
  },


  toload() {
    let pageIndex = that.data.pageIndex;
    let count = that.data.count;
    let date = that.data.date;
    console.log('加载时时间', date);
    if (that.data.orderList.length < count) {
      that.setData({
        'push.isLoading': true,
        'push.pullText': '正在加载',
        'push.loading': '../../resource/img/pull_refresh.gif',
      })
      pageIndex++;
      console.log(pageIndex)
      pageIndex = String(pageIndex);
      console.log(pageIndex)
      that.orderListFn(pageIndex, date);
      setTimeout(() => {
        that.setData({
          pageIndex: pageIndex,
          'push.isLoading': false,
          'push.pullText': '- 上拉加载更多 -',
          'push.loading': '../../resource/img/finish.png',
        })
      }, 1500)
    } else if (that.data.orderList.length > 0 && (pageIndex * that.data.pageSize) > count) {
      that.setData({
        'push.isLoading': false,
        'push.pullText': '- 我也是有底线的 -'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery().in(this)
    query.selectAll('.custom').boundingClientRect(function (res) {
      const customHeight = res[0].height;
      that.setData({
        customHeight: customHeight
      })
    }).exec()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 点击跳转订单详情
  clickOrder: (e) => {
    console.log(e);
    const orderId = e.currentTarget.dataset.id;
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
    console.log('触底了')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})