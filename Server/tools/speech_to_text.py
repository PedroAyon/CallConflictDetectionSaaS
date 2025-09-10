# tools/speech_to_text.py

import threading
import azure.cognitiveservices.speech as speech


class SpeechToTextService:
    def __init__(self, speech_api_key: str, azure_service_region: str, lang: str):
        self.speech_config = speech.SpeechConfig(
            subscription=speech_api_key,
            region=azure_service_region,
            speech_recognition_language=lang
        )

    def speech_to_text_from_file(self, audio_file_path: str, timeout_sec: float = 0.5):
        """
        Continuously recognize speech from the entire audio file.
        Returns (full_text, error_code) where error_code is None on success.
        """
        audio_config = speech.audio.AudioConfig(filename=audio_file_path)
        recognizer = speech.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=audio_config
        )

        full_text_chunks = []
        error_code = None
        stop_recognition = threading.Event()

        # Event handler: when a piece of speech is recognized
        def on_recognized(evt):
            if evt.result.reason == speech.ResultReason.RecognizedSpeech:
                chunk = evt.result.text.strip()
                if chunk:
                    full_text_chunks.append(chunk)
                    print(f"Chunk recognized: {chunk}")

        # Event handler: session stopped
        def on_session_stopped(evt):
            print("Session stopped.")
            stop_recognition.set()

        # Event handler: canceled/error
        def on_canceled(evt):
            nonlocal error_code
            print(f"Recognition canceled: {evt.reason}")
            if evt.reason == speech.CancellationReason.Error:
                error_code = f"Error: {evt.error_details}"
                print(f"Error details: {evt.error_details}")
            stop_recognition.set()

        # Hook up events
        recognizer.recognized.connect(on_recognized)
        recognizer.session_stopped.connect(on_session_stopped)
        recognizer.canceled.connect(on_canceled)

        print(f"Starting continuous recognition on: {audio_file_path}")
        recognizer.start_continuous_recognition()

        # Wait until session is stopped or canceled
        while not stop_recognition.wait(timeout=timeout_sec):
            pass

        recognizer.stop_continuous_recognition()

        full_text = " ".join(full_text_chunks).strip() or None
        return full_text, error_code
