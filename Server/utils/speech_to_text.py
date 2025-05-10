import azure.cognitiveservices.speech as speech


class SpeechToTextService:
    def __init__(self, speech_api_key: str, azure_service_region: str, lang: str):
        self.speech_config = speech.SpeechConfig(subscription=speech_api_key, region=azure_service_region,
                                                 speech_recognition_language=lang)

    def speech_to_text_from_file_once(self, audio_file_path: str):
        audio_config = speech.audio.AudioConfig(filename=audio_file_path)
        speech_recognizer = speech.SpeechRecognizer(speech_config=self.speech_config, audio_config=audio_config)

        print(f"Attempting to recognize speech from file: {audio_file_path}")
        result = speech_recognizer.recognize_once_async().get()

        error_code = None
        recognized_text = None

        if result.reason == speech.ResultReason.RecognizedSpeech:
            recognized_text = result.text
            print(f"RECOGNIZED: Text={recognized_text}")
        elif result.reason == speech.ResultReason.NoMatch:
            print("NOMATCH: Speech could not be recognized")
            error_code = 404
        elif result.reason == speech.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            print(f"CANCELED: Reason={cancellation_details.reason}")
            if cancellation_details.reason == speech.CancellationReason.Error:
                error_code = f"Error: {cancellation_details.error_details}"
                print(f"CANCELED: ErrorDetails={cancellation_details.error_details}")
            else:
                error_code = f"Canceled: {cancellation_details.reason}"

        return recognized_text, error_code
