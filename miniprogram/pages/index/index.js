const api = require("../../utils/api");
const { HOT_TOPICS_TEMPLATE_ID } = require("../../utils/config");

Page({
  data: {
    loading: false,
    user: null,
  },

  onShow() {
    const app = getApp();
    this.setData({ user: app.globalData.user });
  },

  async onLogin() {
    this.setData({ loading: true });
    try {
      const data = await api.miniLogin();
      this.setData({ user: data.user });
      wx.showToast({ title: "登录成功", icon: "success" });
      if (data.needBindMobile) {
        wx.showModal({
          title: "绑定手机号",
          content: "可在「我的」页绑定手机号，与 H5 账号合并",
          showCancel: false,
        });
      }
    } catch (e) {
      wx.showToast({
        title: (e && e.error) || "登录失败",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onSubscribe() {
    const tpl = HOT_TOPICS_TEMPLATE_ID;
    if (!tpl) {
      wx.showToast({ title: "请配置模板 ID", icon: "none" });
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [tpl],
      success: async (res) => {
        if (res[tpl] === "accept") {
          try {
            await api.reportSubscribe(tpl);
            wx.showToast({ title: "已订阅热点提醒", icon: "success" });
          } catch {
            wx.showToast({ title: "上报失败", icon: "none" });
          }
        }
      },
    });
  },
});
