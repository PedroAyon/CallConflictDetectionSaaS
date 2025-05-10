from transformers import pipeline


class ConflictDetector:
    def __init__(self):
        """Initializes the sentiment analysis pipeline."""
        self.sentiment_analyzer = pipeline("sentiment-analysis")

    def detect_conflict(self, conversation: str) -> bool:
        """
        Determines if a conversation contains conflict.

        Args:
            conversation (str): The conversation text.

        Returns:
            bool: True if conflict is detected, False otherwise.
        """
        exchanges = conversation.strip().split("\n")
        for exchange in exchanges:
            try:
                sentiment = self.sentiment_analyzer(exchange)
                sentiment_result = sentiment[0]
                if sentiment_result['label'] == "NEGATIVE" and sentiment_result['score'] > 0.7:
                    return True

            except ValueError:
                continue
        return False
