const { API_BASE } = require("./config");

function getToken() {
  const app = getApp();
  return (app && app.globalData.token) || wx.getStorageSync("sv_token") || "";
}

function request(path, options = {}) {
  const token = getToken();
  const header = {
    "Content-Type": "application/json",
    ...(options.header || {}),
  };
  if (token) header.Authorization = `Bearer ${token}`;
  header["X-Client-Channel"] = "mini";

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${path}`,
      method: options.method || "GET",
      data: options.data,
      header,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || { error: "request_failed" });
        }
      },
      fail: reject,
    });
  });
}

function miniLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject({ error: "no_wx_code" });
          return;
        }
        request("/api/auth/wechat/mini-login", {
          method: "POST",
          data: { code: loginRes.code },
        })
          .then((data) => {
            const app = getApp();
            app.setSession(data.token, data.user);
            resolve(data);
          })
          .catch(reject);
      },
      fail: reject,
    });
  });
}

function createPayOrder(productName) {
  return request("/api/pay/create", {
    method: "POST",
    data: { productName, client: "mini" },
  });
}

function reportSubscribe(templateId) {
  return request("/api/wechat/subscribe", {
    method: "POST",
    data: { templateId },
  });
}

module.exports = {
  request,
  miniLogin,
  createPayOrder,
  reportSubscribe,
};
