# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration variables."""
    # --- Paths ---
    DATABASE_PATH = os.getenv("DATABASE_PATH", "database.sqlite")
    SCHEMA_PATH = os.getenv("SCHEMA_PATH", "schema.sql")
    RECORDINGS_DIR = os.getenv("RECORDINGS_DIR", "recordings")

    # --- Azure Speech ---
    AZURE_SPEECH_API_KEY = os.getenv("AZURE_SPEECH_API_KEY")
    AZURE_SERVICE_REGION = os.getenv("AZURE_SERVICE_REGION")
    SPEECH_LANG = os.getenv("SPEECH_LANG", "en-US")

    # --- File Upload ---
    ALLOWED_AUDIO_EXTENSIONS = {'wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac', 'mp4'}
    MAX_CONTENT_LENGTH = 64 * 1024 * 1024  # 64 MB

    # --- JWT ---
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-and-long-key-please-change")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_DAYS = 30

    # --- Flask ---
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))

    # --- Gemini ---
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', None)
    GEMINI_GENERATIVE_MODEL = os.getenv('GEMINI_GENERATIVE_MODEL', 'gemini-1.5-flash')

    # --- Ensure recordings directory exists ---
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

config = Config()