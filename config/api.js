// const ApiRootUrl = 'https://w3.morninggo.cn/'; //晨购
// const ApiRootUrl = 'https://api.morninggo.cn/';
const ApiRootUrl = 'http://192.168.126.247:8080/morninggo_app_http_war/';
module.exports = {
    Login: ApiRootUrl + 'tobaccos/payment/checkUserByOpenid', //用户信息

    GoodsCart: ApiRootUrl + 'tobaccos/payment/shoppingCart', //购物车列表

    CartAddOrSub: ApiRootUrl + 'tobaccos/payment/shoppingCartAddOrSub', //增减

    CheckedProductPrice: ApiRootUrl + 'tobaccos/payment/checkedProductPrice', //计算购物车金额

    ConfirmOrder: ApiRootUrl + 'tobaccos/payment/confirmOrder', //提交订单

    Wxpay: ApiRootUrl + 'tobaccos/payment/wx_pay', //支付
    
    OrderList: ApiRootUrl + 'tobaccos/payment/orderList',
    OrderDetails: ApiRootUrl + 'tobaccos/payment/orderDetails',

    Detect: ApiRootUrl + 'tobaccoss/person/detect', //无身份证人脸
    Verify: ApiRootUrl + 'tobaccoss/person/verify',

    GetAdult: ApiRootUrl + 'tobaccos/payment/getAdult' //我的验证状态
}