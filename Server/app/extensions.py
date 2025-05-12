# app/extensions.py
import queue
import sys
from flask_cors import CORS

from db.database import Database
from tools.speech_to_text import SpeechToTextService
from tools.conflict_detection import ConflictDetector
from config import config

cors = CORS()

db_service = Database(db_path=config.DATABASE_PATH, schema_path=config.SCHEMA_PATH)

if config.AZURE_SPEECH_API_KEY and config.AZURE_SERVICE_REGION:
    speech_recognition_service = SpeechToTextService(
        config.AZURE_SPEECH_API_KEY, config.AZURE_SERVICE_REGION, config.SPEECH_LANG
    )
else:
    speech_recognition_service = None
    print("Warning: Azure Speech API Key or Region not configured. Speech-to-text functionality will be disabled.", file=sys.stderr)

conflict_analysis_service = ConflictDetector()

audio_queue = queue.Queue()