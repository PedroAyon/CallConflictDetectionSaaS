import os
import pytest
from pathlib import Path
from dotenv import load_dotenv
from tools.speech_to_text import SpeechToTextService

# Load environment variables from .env at the project root
load_dotenv()


def test_speech_to_text_returns_string():
    # Fetch environment variables
    api_key = os.getenv("AZURE_SPEECH_API_KEY")
    region = os.getenv("AZURE_SERVICE_REGION")
    language = os.getenv("SPEECH_LANG")

    assert api_key, "Missing AZURE_SPEECH_API_KEY in environment variables."
    assert region, "Missing AZURE_SERVICE_REGION in environment variables."
    assert language, "Missing SPEECH_LANG in environment variables."

    # Initialize the speech-to-text service
    service = SpeechToTextService(
        speech_api_key=api_key,
        azure_service_region=region,
        lang=language
    )

    # Path to test audio file
    audio_path = Path(__file__).parent / "test_audio.wav"
    assert audio_path.exists(), f"Test audio file not found: {audio_path}"

    # Perform speech recognition
    result_text, error = service.speech_to_text_from_file_once(str(audio_path))

    if error:
        pytest.fail(f"Speech recognition failed with error code: {error}")


    assert isinstance(result_text, str) and result_text.strip(), "Expected a non-empty string as transcription."
