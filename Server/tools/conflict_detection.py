from transformers import pipeline

class ConflictDetector:
    def __init__(self):
        """Initializes the translation and sentiment analysis pipelines."""
        # Translator from English to Spanish
        self.translator = pipeline(
            "translation_en_to_es",
            model="Helsinki-NLP/opus-mt-en-es"
        )
        # Spanish sentiment analyzer
        self.sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

    def detect_conflict(self, conversation: str) -> bool:
        """
        Determines if a conversation contains conflict by translating each line
        to Spanish and then analyzing its sentiment.

        Args:
            conversation (str): The conversation text in English.

        Returns:
            bool: True if conflict is detected, False otherwise.
        """
        exchanges = conversation.strip().split("\n")
        for exchange in exchanges:
            try:
                # Translate the exchange to Spanish
                translated = self.translator(exchange, max_length=512)[0]['translation_text']
                # Analyze sentiment on the Spanish text
                sentiment = self.sentiment_analyzer(translated)
                result = sentiment[0]
                # Depending on the Spanish sentiment model, adjust label/threshold
                if result['label'] in ["1 star", "2 stars"] and result['score'] > 0.7:
                    return True
            except Exception:
                # Skip any lines that fail translation or analysis
                continue
        return False
