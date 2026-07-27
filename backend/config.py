from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE: str
    # CORS_ORIGIN: str

    # read from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
        # extra = "ignore" 
        )

# Initialize and export the settings object
settings = Settings()
