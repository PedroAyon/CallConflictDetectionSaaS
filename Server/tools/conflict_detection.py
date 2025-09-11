from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification


class ConflictDetector:
    def __init__(self):
        """Initializes the translation and sentiment analysis pipelines."""
        # Load tokenizer and model for translator
        translation_model_name = "Helsinki-NLP/opus-mt-es-en"
        self.translation_tokenizer = AutoTokenizer.from_pretrained(translation_model_name)
        self.translator = pipeline(
            "translation_es_to_en",
            model=translation_model_name,
            tokenizer=self.translation_tokenizer
        )

        # Load tokenizer and model for sentiment analysis
        sentiment_model_name = "cardiffnlp/twitter-roberta-base-sentiment"
        sentiment_tokenizer = AutoTokenizer.from_pretrained(sentiment_model_name)
        sentiment_model = AutoModelForSequenceClassification.from_pretrained(sentiment_model_name)
        self.sentiment_analyzer = pipeline("sentiment-analysis", model=sentiment_model, tokenizer=sentiment_tokenizer)

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
        # Get the maximum length for the translation model's input
        max_translation_length = self.translation_tokenizer.model_max_length

        try:
            # Encode the exchange to get token length and truncate if necessary.
            # This prevents the "Token indices sequence length is longer..." error.
            tokens = self.translation_tokenizer.encode(
                conversation,
                truncation=True,
                max_length=max_translation_length
            )

            # Decode the tokens back to a string for translation
            truncated_exchange = self.translation_tokenizer.decode(tokens, skip_special_tokens=True)

            # Translate the exchange to English
            translated = self.translator(truncated_exchange)[0]['translation_text']
            print(f"Translated: {translated}")

            # Analyze sentiment on the English text
            sentiment = self.sentiment_analyzer(translated)[0]
            label = self.label_map.get(sentiment['label'], sentiment['label'])
            score = sentiment['score']
            print(f"Sentiment: {label} (score: {score:.4f})")
            if label == "Negative" and score < 0.8:
                label = "Neutral"
            return label
        except Exception as e:
            print(f"Error processing line: {conversation}\n{e}")
        return False
