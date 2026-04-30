from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    google_client_id: str
    google_client_secret: str

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    api_key_encryption_secret: str  # 32-byte hex string

    frontend_url: str = "http://localhost:3000"


settings = Settings()
