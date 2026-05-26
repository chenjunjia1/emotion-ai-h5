const { API_BASE } = require("./utils/config");

App({
  globalData: {
    apiBase: API_BASE,
    token: "",
    user: null,
  },

  onLaunch() {
    const token = wx.getStorageSync("sv_token") || "";
    this.globalData.token = token;
  },

  setSession(token, user) {
    this.globalData.token = token || "";
    this.globalData.user = user || null;
    if (token) wx.setStorageSync("sv_token", token);
    else wx.removeStorageSync("sv_token");
  },
});
