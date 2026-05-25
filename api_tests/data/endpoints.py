"""接口定义与测试数据。"""

PUBLIC_APIS = [
    {"method": "GET", "path": "/api/me", "expect": (401,)},
    {"method": "GET", "path": "/api/v1/hot-topics", "expect": (200,)},
    {"method": "GET", "path": "/api/hot-topics", "expect": (200,)},
    {"method": "GET", "path": "/api/hot-topics/meta", "expect": (200,)},
]

AUTH_POST_APIS = [
    {
        "name": "publish-pack",
        "path": "/api/v1/generate/publish-pack",
        "body": {"platform": "抖音", "topic": "自测发布包", "track": "职场"},
        "slow": True,
    },
    {
        "name": "topic-box",
        "path": "/api/v1/topic-box",
        "body": {"platform": "抖音", "track": "职场", "goal": "涨粉", "style": "温柔"},
        "slow": True,
    },
    {
        "name": "title-gacha",
        "path": "/api/v1/title-gacha",
        "body": {"platform": "抖音", "topic": "自测选题", "style": "温柔"},
        "slow": True,
    },
    {
        "name": "score",
        "path": "/api/v1/score",
        "body": {"title": "冒烟标题", "script": "冒烟脚本"},
        "slow": True,
    },
    {
        "name": "review",
        "path": "/api/v1/review",
        "body": {"title": "本周自测复盘", "views": 100, "likes": 10, "platform": "抖音"},
        "slow": True,
    },
    {
        "name": "growth-checkin",
        "path": "/api/v1/growth",
        "body": {"action": "checkin"},
        "slow": False,
    },
]
