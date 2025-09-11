import threading
import logging
import json
import os

from app.extensions import (
    audio_queue,
    db_service,
    speech_recognition_service,
    conflict_analysis_service,
    gemini
)

logger = logging.getLogger(__name__)


def audio_processing_worker():
    """Continuously process queued audio files for transcription, conflict detection, and categorization."""
    logger.info("Audio processing worker started.")
    while True:
        # Blocks here until an item is available
        audio_path = audio_queue.get()
        logger.info(f"Processing audio file: {audio_path}")

        transcription_text = None
        sentiment_value = None
        category_id = None

        try:
            # 1. Transcribe
            if speech_recognition_service:
                raw_text, error_code = speech_recognition_service.speech_to_text_from_file(audio_path)
                if error_code:
                    logger.error(f"Transcription error for {audio_path}: {error_code}")
                transcription_text = raw_text or ""
            else:
                logger.warning(f"Speech recognition service not available for {audio_path}")
                transcription_text = None

            # Check if a transcription was successfully generated
            if transcription_text is not None and transcription_text.strip():
                # 2. Conflict detection
                try:
                    sentiment_value = conflict_analysis_service.detect_conflict(transcription_text)
                    logger.info(f"Conflict detection result for {audio_path}: {sentiment_value}")
                except Exception as conflict_e:
                    logger.error(f"Conflict detection error for {audio_path}: {conflict_e}")
                    sentiment_value = None

                # 3. Categorize
                try:
                    employee_id = int(os.path.basename(audio_path).split('_')[0])
                    company_id = db_service.get_company_id_by_employee_id(employee_id)
                    if company_id:
                        categories = db_service.get_categories_by_company(company_id)
                        # Reformat categories for the LLM prompt
                        llm_categories = [
                            {"id": cat["category_id"], "name": cat["category_name"],
                             "description": cat["category_description"]}
                            for cat in categories
                        ]

                        llm_response_text = categorize_call_transcription_with_llm(llm_categories, transcription_text)

                        category_id = None
                        try:
                            category_id = int(llm_response_text)
                            if category_id == 0:
                                category_id = None
                        except json.JSONDecodeError:
                            print(f"Could not convert '{llm_response_text}' to an integer. Setting category_id to None.")

                        logger.info(f"Categorization result for {audio_path}: {category_id}")
                    else:
                        logger.warning(f"Company ID not found for employee {employee_id}, skipping categorization.")

                except Exception as cat_e:
                    logger.error(f"Categorization error for {audio_path}: {cat_e}", exc_info=True)
                    category_id = None
            else:
                logger.info(f"Skipping analysis for {audio_path} due to empty transcription.")

            # 4. Update database record with all analysis results
            db_service.update_call_analysis(audio_path, transcription_text, sentiment_value, category_id)
            logger.info(f"Database updated for audio file: {audio_path}")

        except Exception as e:
            logger.error(f"Unhandled error processing audio {audio_path}: {e}", exc_info=True)

        finally:
            audio_queue.task_done()
            logger.debug(f"Task done for audio file: {audio_path}")


def start_background_tasks():
    """Starts the background worker threads."""
    # daemon=True ensures the thread exits when the main process exits
    threading.Thread(target=audio_processing_worker, daemon=True, name="AudioWorker").start()


def summarize_with_llm(transcriptions: str) -> str:
    if not gemini:
        logging.warning("Gemini service is not available or not configured.")
        return "Error"

    try:

        with open('/home/pedro-ayon/dev/hackatec/CallConflictDetectionSaaS/Server/prompt/summarize_prompt.md', 'r',
                  encoding='utf-8') as f:
            prompt_template = f.read()

        full_prompt = prompt_template.format(transcriptions_text=transcriptions)

        response = gemini.generate_content(full_prompt)

        return response.text

    except FileNotFoundError:
        error_msg = "Error: No prompt'."
        logging.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Error: {e}"
        logging.error(error_msg)
        return error_msg


def categorize_call_transcription_with_llm(categories, transcription):
    if not gemini:
        logging.warning("Gemini service is not available or not configured.")
        return "Error"
    try:

        with open('/home/pedro-ayon/dev/hackatec/CallConflictDetectionSaaS/Server/prompt/categorize_prompt.md', 'r',
                  encoding='utf-8') as f:
            prompt_template = f.read()

        input = f"""
        Categories: {json.dumps(categories, indent=2)}
        Transcription: {transcription}
        """
        full_prompt = prompt_template + input

        response = gemini.generate_content(full_prompt)

        return response.text

    except FileNotFoundError:
        error_msg = "Error: No prompt'."
        logging.error(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"Error: {e}"
        logging.error(error_msg)
        return error_msg
