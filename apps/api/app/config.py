from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
ENV_FILE = REPO_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    chain_id: int = 1
    rpc_urls: str = "https://ethereum-rpc.publicnode.com,https://1rpc.io/eth"
    request_timeout_seconds: float = 10.0

    @field_validator("request_timeout_seconds")
    @classmethod
    def _timeout_must_be_positive(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("REQUEST_TIMEOUT_SECONDS must be positive")
        return value

    @property
    def rpc_endpoints(self) -> tuple[str, ...]:
        endpoints = tuple(url.strip() for url in self.rpc_urls.split(",") if url.strip())
        if not endpoints:
            raise ValueError("RPC_URLS must contain at least one endpoint")
        if not all(url.startswith(("http://", "https://")) for url in endpoints):
            raise ValueError("RPC_URLS endpoints must use http:// or https://")
        return endpoints


@lru_cache
def get_settings() -> Settings:
    return Settings()
