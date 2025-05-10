import azure.cognitiveservices.speech as speech


class SpeechToTextService:
    def __init__(self, speech_api_key: str, azure_service_region: str):
        """
        Initializes the SpeechToTextService instance with Azure credentials.

        Args:
            speech_api_key (str): Azure Speech API subscription key.
            azure_service_region (str): Azure service region.
        """
        self.speech_config = speech.SpeechConfig(subscription=speech_api_key, region=azure_service_region)

    def speech_to_text_from_file(self, audio_file_path: str):
        """
        Recognizes speech from a longer audio file and returns the recognized text along with an error code.

        Args:
            audio_file_path (str): Path to the audio file to be processed.

        Returns:
            tuple: A tuple containing the recognized text (or None if no match) and the error code (or None if no error).
        """
        audio_config = speech.audio.AudioConfig(filename=audio_file_path)
        speech_recognizer = speech.SpeechRecognizer(speech_config=self.speech_config, audio_config=audio_config)

        recognized_texts = []
        recognition_complete = False

        def handle_recognized(evt):
            if evt.result.reason == speech.ResultReason.RecognizedSpeech:
                recognized_texts.append(evt.result.text)

        def handle_canceled(evt):
            if evt.reason == speech.CancellationReason.Error:
                print(f"Recognition canceled: {evt.error_details}")

        def stop_recognition(evt):
            nonlocal recognition_complete
            recognition_complete = True

        speech_recognizer.recognized.connect(handle_recognized)
        speech_recognizer.canceled.connect(handle_canceled)
        speech_recognizer.session_stopped.connect(stop_recognition)

        speech_recognizer.start_continuous_recognition()

        while not recognition_complete:
            pass  # Wait for the recognition session to complete

        speech_recognizer.stop_continuous_recognition()

        full_text = " ".join(recognized_texts).strip() if recognized_texts else None
        return full_text, None if full_text else 404
