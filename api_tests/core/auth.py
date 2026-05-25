"""登录流程：send-code → login，可选从 Supabase 读取验证码。"""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

from config.settings import settings

if TYPE_CHECKING:
    from core.client import HttpClient


def _fetch_code_from_supabase(mobile: str) -> str | None:
    if not settings.supabase_url or not settings.supabase_service_key:
        return None
    try:
        from supabase import create_client

        client = create_client(settings.supabase_url, settings.supabase_service_key)
        row = (
            client.table("sms_logs")
            .select("code")
            .eq("mobile", mobile)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if row.data:
            return str(row.data[0].get("code") or "")
    except Exception:
        return None
    return None


def grant_test_quota(user_id: str) -> None:
    """为测试账号补充灵感额度，避免 AI 用例因额度不足失败。"""
    if not settings.supabase_url or not settings.supabase_service_key:
        return
    try:
        from supabase import create_client

        client = create_client(settings.supabase_url, settings.supabase_service_key)
        client.table("users").update(
            {
                "bonus_quota": 30,
                "used_count": 0,
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        ).eq("id", user_id).execute()
    except Exception:
        pass


def login_with_mobile(client: HttpClient, mobile: str | None = None) -> dict:
    """完成登录并返回 user 信息；Session Cookie 保存在 client 中。"""
    mobile = mobile or f"199{str(int(time.time() * 1000))[-8:]}"
    send = client.post("/api/auth/send-code", json={"mobile": mobile})
    if not send.ok:
        raise RuntimeError(f"send-code failed: {send.status_code} {send.data}")

    code = None
    if isinstance(send.data, dict):
        code = send.data.get("devCode")
    if not code:
        code = _fetch_code_from_supabase(mobile)
    if not code:
        code = settings.mock_sms_code

    login = client.post(
        "/api/auth/login",
        json={"mobile": mobile, "code": str(code)},
    )
    if not login.ok or not isinstance(login.data, dict) or not login.data.get("user"):
        raise RuntimeError(f"login failed: {login.status_code} {login.data}")

    user = login.data["user"]
    grant_test_quota(user["id"])
    return user
