"""常用断言封装。"""

from __future__ import annotations

from typing import Any

from core.client import ApiResponse


def assert_status(resp: ApiResponse, *allowed: int) -> None:
    assert resp.status_code in allowed, (
        f"expected {allowed}, got {resp.status_code}, body={resp.data!r}"
    )


def assert_json_keys(data: dict, *keys: str) -> None:
    missing = [k for k in keys if k not in data]
    assert not missing, f"missing keys {missing} in {data!r}"


def assert_has_result_or_growth(resp: ApiResponse) -> None:
    """AI 生成类接口：成功返回 result/growth/saved，或 publish-pack 额度不足 402。"""
    data = resp.data if isinstance(resp.data, dict) else {}
    quota_ok = (
        resp.status_code == 402
        and data.get("error") == "quota_insufficient"
    )
    success = resp.ok and (
        data.get("result") is not None
        or data.get("growth") is not None
        or data.get("saved") is True
    )
    assert quota_ok or success, f"unexpected response: {resp.status_code} {data!r}"
