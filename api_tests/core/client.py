"""HTTP 客户端：统一请求、Cookie 会话、JSON 解析。"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from config.settings import settings


@dataclass
class ApiResponse:
    status_code: int
    data: Any
    headers: dict[str, str]
    raw: requests.Response

    @property
    def ok(self) -> bool:
        return 200 <= self.status_code < 300


class HttpClient:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json"})

    def request(
        self,
        method: str,
        path: str,
        *,
        json: dict | None = None,
        params: dict | None = None,
        headers: dict | None = None,
        timeout: float | None = None,
        auth: bool = False,
    ) -> ApiResponse:
        url = path if path.startswith("http") else f"{self.base_url}{path}"
        req_headers = dict(headers or {})
        resp = self.session.request(
            method=method.upper(),
            url=url,
            json=json,
            params=params,
            headers=req_headers,
            timeout=timeout or settings.timeout,
        )
        try:
            data = resp.json()
        except ValueError:
            data = resp.text
        return ApiResponse(
            status_code=resp.status_code,
            data=data,
            headers={k: v for k, v in resp.headers.items()},
            raw=resp,
        )

    def get(self, path: str, **kwargs: Any) -> ApiResponse:
        return self.request("GET", path, **kwargs)

    def post(self, path: str, **kwargs: Any) -> ApiResponse:
        return self.request("POST", path, **kwargs)
