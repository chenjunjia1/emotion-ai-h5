"""Pytest 全局 fixture。"""

from __future__ import annotations

import pytest

from config.settings import settings
from core.auth import login_with_mobile
from core.client import HttpClient
from core.port_detect import detect_base_url


@pytest.fixture(scope="session")
def base_url() -> str:
    url = detect_base_url()
    if not url:
        pytest.skip(
            "未检测到可用服务。请先 npm run dev 或 npm run start -p 3010，"
            "或设置 API_BASE_URL=http://127.0.0.1:3010"
        )
    return url


@pytest.fixture(scope="session")
def client(base_url: str) -> HttpClient:
    return HttpClient(base_url)


@pytest.fixture(scope="session")
def auth_client(base_url: str) -> HttpClient:
    c = HttpClient(base_url)
    login_with_mobile(c)
    return c


@pytest.fixture
def fresh_auth_client(base_url: str) -> HttpClient:
    """每个用例独立登录，避免状态污染。"""
    c = HttpClient(base_url)
    login_with_mobile(c)
    return c
