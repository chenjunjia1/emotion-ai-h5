const { API_BASE } = require("../../utils/config");

Page({
  data: {
    src: `${API_BASE}/publish-pack?mode=quick`,
  },
});
