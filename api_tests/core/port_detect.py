"""自动探测本地 Next.js 开发/生产实例端口。"""

from __future__ import annotations

import requests

from config.settings import settings


def detect_base_url() -> str | None:
    if settings.base_url:
        return settings.base_url

    if not settings.auto_detect_port:
        return None

    for port in settings.candidate_ports:
        for host in ("127.0.0.1", "localhost"):
            url = f"http://{host}:{port}/api/me"
            try:
                resp = requests.get(url, timeout=4)
                if resp.status_code in (200, 401):
                    return f"http://{host}:{port}"
            except requests.RequestException:
                continue
    return None
