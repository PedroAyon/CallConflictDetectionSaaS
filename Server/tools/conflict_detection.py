from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

class ConflictDetector:
    def __init__(self):
        """Initializes the translation and sentiment analysis pipelines."""
        # Translator from Spanish to English
        self.translator = pipeline(
            "translation_es_to_en",
            model="Helsinki-NLP/opus-mt-es-en"
        )
        # Load tokenizer and model for sentiment analysis
        model_name = "cardiffnlp/twitter-roberta-base-sentiment"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.sentiment_analyzer = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

        # Map label IDs to human-readable form
        self.label_map = {
            "LABEL_0": "Negative",
            "LABEL_1": "Neutral",
            "LABEL_2": "Positive"
        }

    def detect_conflict(self, conversation: str) -> bool:
        """
        Determines if a conversation contains conflict by translating each line
        to English and then analyzing its sentiment.

        Args:
            conversation (str): The conversation text in Spanish.

        Returns:
            bool: True if conflict is detected, False otherwise.
        """
        exchanges = conversation.strip().split("\n")
        for exchange in exchanges:
            try:
                # Translate the exchange to English
                translated = self.translator(exchange, max_length=512)[0]['translation_text']
                print(f"Translated: {translated}")

                # Analyze sentiment on the English text
                sentiment = self.sentiment_analyzer(translated)[0]
                label = self.label_map.get(sentiment['label'], sentiment['label'])
                score = sentiment['score']
                print(f"Sentiment: {label} (score: {score:.4f})")

                # Detect strong negative sentiment
                if label == "Negative" and score > 0.9:
                    return True
            except Exception as e:
                print(f"Error processing line: {exchange}\n{e}")
                continue
        return False
