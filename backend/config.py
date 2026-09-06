from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE: str
    CORS_ORIGIN: str
    END_POINT: str
    MODEL_NAME: str
    DEPLOYMENT_NAME: str
    API_KEY: str

    # read from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra = "ignore" 
        )

# Initialize and export the settings object
settings = Settings()
