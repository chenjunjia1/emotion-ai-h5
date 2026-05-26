const { API_BASE } = require("../../utils/config");
const api = require("../../utils/api");

Page({
  data: {
    src: `${API_BASE}/profile?pricing=1`,
  },

  async onBuyPack() {
    try {
      const data = await api.createPayOrder("灵感包·50");
      if (data.wechatPayParams) {
        wx.requestPayment({
          ...data.wechatPayParams,
          success: () => wx.showToast({ title: "支付成功", icon: "success" }),
          fail: () => wx.showToast({ title: "已取消", icon: "none" }),
        });
        return;
      }
      if (data.mock) {
        wx.showToast({ title: "演示订单已创建", icon: "none" });
      }
    } catch (e) {
      wx.showToast({
        title: (e && e.error) || "下单失败",
        icon: "none",
      });
    }
  },
});
