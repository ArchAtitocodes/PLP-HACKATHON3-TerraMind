from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='../.env', env_file_encoding='utf-8', extra='ignore')

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL: str
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # External APIs
    GEMINI_API_KEY: str
    SENTINELHUB_INSTANCE_ID: str
    SENTINELHUB_CLIENT_ID: str
    SENTINELHUB_CLIENT_SECRET: str


settings = Settings()