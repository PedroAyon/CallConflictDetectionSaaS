# app/tasks.py
import threading
import logging

from app.extensions import (
    audio_queue,
    db_service,
    speech_recognition_service,
    conflict_analysis_service
)

logger = logging.getLogger(__name__)

def audio_processing_worker():
    """Continuously process queued audio files for transcription and conflict detection."""
    logger.info("Audio processing worker started.")
    while True:
        # Blocks here until an item is available
        audio_path = audio_queue.get()
        logger.info(f"Processing audio file: {audio_path}")
        try:
            transcription_text = None
            # 1. Transcribe
            if speech_recognition_service:
                raw_text, error_code = speech_recognition_service.speech_to_text_from_file(audio_path)
                if error_code:
                    logger.error(f"Transcription error for {audio_path}: {error_code}")
                transcription_text = raw_text or ""
            else:
                logger.warning(f"Speech recognition service not available for {audio_path}")
                transcription_text = None # Explicitly None if service is off

            # 2. Conflict detection (only if transcription succeeded)
            conflict_value = None
            if transcription_text is not None: # Check if transcription was attempted and yielded text (even empty)
                try:
                    conflict_value = conflict_analysis_service.detect_conflict(transcription_text)
                    logger.info(f"Conflict detection result for {audio_path}: {conflict_value}")
                except Exception as conflict_e:
                    logger.error(f"Conflict detection error for {audio_path}: {conflict_e}")
                    conflict_value = None
            else:
                 logger.info(f"Skipping conflict detection for {audio_path} due to missing transcription.")


            # 3. Update database record
            db_service.update_call_analysis(audio_path, transcription_text, conflict_value)
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