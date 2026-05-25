"""从环境变量与 .env.local 加载测试配置。"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import dotenv_values

ROOT = Path(__file__).resolve().parents[2]
ENV_LOCAL = ROOT / ".env.local"
ENV_API = ROOT / "api_tests" / ".env"


def _load_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for path in (ENV_LOCAL, ENV_API):
        if path.is_file():
            merged.update({k: v for k, v in dotenv_values(path).items() if v is not None})
    merged.update({k: v for k, v in os.environ.items() if v})
    return merged


@dataclass(frozen=True)
class Settings:
    base_url: str = ""
    timeout: float = 15.0
    slow_timeout: float = 60.0
    mock_sms_code: str = "1234"
    supabase_url: str = ""
    supabase_service_key: str = ""
    cron_secret: str = ""
    auto_detect_port: bool = True
    candidate_ports: tuple[int, ...] = field(
        default_factory=lambda: (3010, 3006, 3005, 3004, 3003, 3002, 3001, 3000)
    )

    @classmethod
    def from_env(cls) -> Settings:
        env = _load_env()
        base = env.get("API_BASE_URL", "").rstrip("/")
        auto = env.get("API_AUTO_DETECT_PORT", "true").lower() in ("1", "true", "yes")
        ports_raw = env.get("API_CANDIDATE_PORTS", "")
        ports = (
            tuple(int(p.strip()) for p in ports_raw.split(",") if p.strip())
            if ports_raw
            else (3010, 3006, 3005, 3004, 3003, 3002, 3001, 3000)
        )
        return cls(
            base_url=base,
            timeout=float(env.get("API_TIMEOUT", "15")),
            slow_timeout=float(env.get("API_SLOW_TIMEOUT", "60")),
            mock_sms_code=env.get("MOCK_SMS_CODE", "1234"),
            supabase_url=env.get("NEXT_PUBLIC_SUPABASE_URL", ""),
            supabase_service_key=env.get("SUPABASE_SERVICE_ROLE_KEY", ""),
            cron_secret=env.get("CRON_SECRET", ""),
            auto_detect_port=auto and not base,
            candidate_ports=ports,
        )


settings = Settings.from_env()
