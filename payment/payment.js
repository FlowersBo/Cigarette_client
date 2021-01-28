import * as mClient from '../utils/requestUrl';
import * as api from '../config/api';

function payOrder(orderId){
  return new Promise((resolve, reject)=>{
    wx.login({
        success(res) {
          if (res.code) {
            let data = {
              orderid: orderId,
              code: res.code
            }
            //发起网络请求
            mClient.get(api.UserPayment, data).then(resp => {
              let info = resp.data.data;
              if (info.result === 'SUCCESS') {
                wx.requestPayment({
                  'timeStamp': info.payinfo.timeStamp,
                  'nonceStr': info.payinfo.nonceStr,
                  'package': info.payinfo.package,
                  'signType': info.payinfo.signType,
                  'paySign': info.payinfo.paySign,
                  'success': function (res) {
                    let data = {
                      orderid: orderId,
                      status: '1'
                    }
                    mClient.post(api.Wxpay, data).then(resp => {
                      let result = resp.data.data.result;
                      if (result === true) {
                        resolve(true) ;
                      } else {
                        resolve(false) ;
                      }
                    });
                  },
                  'fail': function (res) {
                    resolve(false) ;
                  },
                  'complete': function (res) {

                  }
                })
              } else if (info.result === 'FAIL') {
                resolve(false) ;
              }
            })
  
          } else {
            wx.showToast({
              title: '用户code无法获取',
              icon: 'fail',
              duration: 2000
            })
            return false;
          }
        }
      })
    })
}

function wxpayOrder(orderId){
  return new Promise((resolve, reject)=>{
    wx.login({
        success(res) {
          if (res.code) {
            let data = {
              orderid: orderId,
              code: res.code
            }
            //发起网络请求
            mClient.get(api.UserPayment, data).then(resp => {
              let info = resp.data.data;
              if (info.result === 'SUCCESS') {
                wx.requestPayment({
                  'timeStamp': info.payinfo.timeStamp,
                  'nonceStr': info.payinfo.nonceStr,
                  'package': info.payinfo.package,
                  'signType': info.payinfo.signType,
                  'paySign': info.payinfo.paySign,
                  'success': function (res) {
                    
                   },
                  'fail': function (res) {
                    resolve(false) ;
                  },
                  'complete': function (res) {
                    
                  }
                })
              } else if (info.result === 'FAIL') {
                resolve(false) ;
              }
            })
  
          } else {
            wx.showToast({
              title: '用户code无法获取',
              icon: 'fail',
              duration: 2000
            })
            return false;
          }
        }
      })
    })
};

function showDialog(orderId){
  wx.showModal({
    title: '提示',
    content: '以产生未支付订单,请前往支付',
    success: function (res) {

      if (res.confirm) {//这里是点击了确定以后            
        wx.navigateTo({
          url: '../status_details/status_details?orderId='+ orderId,
        })
      } else {//这里是点击了取消以后
        wx.navigateBack({
          delta: 1
        })             
      }             
    }             
  })
}

module.exports = {
    payOrder
}