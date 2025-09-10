# app/routes/calls.py
import os
import ntpath
import uuid
import time
from flask import (
    Blueprint, request, jsonify, g, current_app, send_from_directory
)
from datetime import datetime
from werkzeug.utils import secure_filename
from pydub import AudioSegment # Requires ffmpeg

from app.extensions import db_service, audio_queue
from config import config
from app.utils import run_blocking_io, is_allowed_audio_file
from app.auth.decorators import (
    token_required,
    employee_only,
    admin_only,
    check_company_admin
)
from tools.audio_utils import convert_m4a_to_wav

calls_bp = Blueprint('calls', __name__)

@calls_bp.route('/call_records', methods=['POST'])
@token_required
@employee_only
async def api_add_call_record():
    """Adds a call record for the authenticated employee."""
    start_time = time.monotonic()
    employee_id = g.current_user.get('employee_id')
    if not employee_id:
        return jsonify({"error": "Employee identity could not be determined from token."}), 401

    if 'audio_file' not in request.files:
        return jsonify({"error": "Missing 'audio_file' part in the request"}), 400
    audio_file = request.files['audio_file']
    if not audio_file or audio_file.filename == '':
        return jsonify({"error": "No audio file selected or file is empty"}), 400
    if not is_allowed_audio_file(audio_file.filename):
        allowed_str = ", ".join(config.ALLOWED_AUDIO_EXTENSIONS)
        return jsonify({"error": f"Invalid audio file type. Allowed types: {allowed_str}"}), 400

    call_timestamp_str = request.form.get('call_timestamp')
    if not call_timestamp_str:
        return jsonify({"error": "Missing 'call_timestamp' form field"}), 400
    try:
        call_timestamp = datetime.fromisoformat(call_timestamp_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid 'call_timestamp' format. Use ISO 8601."}), 400

    original_filename = secure_filename(audio_file.filename)
    file_ext = original_filename.rsplit('.', 1)[1].lower()
    unique_id = uuid.uuid4().hex
    base_name = f"{employee_id}_{unique_id}_{os.path.splitext(original_filename)[0]}"
    saved_path = os.path.join(config.RECORDINGS_DIR, f"{base_name}.{file_ext}")

    try:
        await run_blocking_io(audio_file.save, saved_path)
    except Exception as e:
         current_app.logger.error(f"Failed to save uploaded audio file {saved_path}: {e}", exc_info=True)
         return jsonify({"error": f"Failed to save audio file on server."}), 500

    path_for_processing = saved_path
    path_for_duration_calc = saved_path
    converted_to_wav = False
    wav_path = None # Define wav_path outside the if block

    if file_ext == 'm4a':
        wav_path = os.path.join(config.RECORDINGS_DIR, f"{base_name}.wav")
        current_app.logger.info(f"Converting M4A file {saved_path} to {wav_path}")
        try:
            converted_path = await run_blocking_io(convert_m4a_to_wav, saved_path, wav_path)
            if converted_path and os.path.exists(converted_path):
                path_for_processing = converted_path
                path_for_duration_calc = converted_path
                converted_to_wav = True
                # Optional: remove original m4a file here if desired
            else:
                 raise RuntimeError(f"Conversion function did not return a valid path or file not found: {converted_path}")
        except Exception as e:
            current_app.logger.error(f"Audio conversion from M4A failed for {saved_path}: {e}", exc_info=True)
            if os.path.exists(saved_path): os.remove(saved_path)
            if wav_path and os.path.exists(wav_path): os.remove(wav_path)
            return jsonify({"error": f"Audio conversion failed: {e}"}), 500

    call_duration_seconds = None
    try:
        audio_segment = await run_blocking_io(AudioSegment.from_file, path_for_duration_calc)
        duration_ms = len(audio_segment)
        call_duration_seconds = int(duration_ms / 1000)
    except Exception as e:
        current_app.logger.error(f"Failed to calculate audio duration for {path_for_duration_calc}: {e}", exc_info=True)
        if os.path.exists(saved_path): os.remove(saved_path)
        if converted_to_wav and os.path.exists(path_for_processing): os.remove(path_for_processing)
        return jsonify({"error": "Could not calculate audio duration."}), 500

    try:
        await run_blocking_io(
            db_service.add_call_record,
            employee_id,
            call_timestamp_str,
            call_duration_seconds,
            None,
            path_for_processing,
            None
        )
    except Exception as e:
        current_app.logger.error(f"Failed to add initial call record to DB for {path_for_processing}: {e}", exc_info=True)
        if os.path.exists(saved_path): os.remove(saved_path)
        if converted_to_wav and os.path.exists(path_for_processing): os.remove(path_for_processing)
        return jsonify({"error": "Failed to save call record metadata."}), 500

    audio_queue.put(path_for_processing)
    current_app.logger.info(f"Enqueued {path_for_processing} for background processing. Queue size: {audio_queue.qsize()}")

    elapsed = time.monotonic() - start_time
    current_app.logger.info(f"Call record POST request completed in {elapsed:.2f} seconds for {original_filename}")

    return jsonify({
        "message": "Call record received successfully. Transcription and analysis pending.",
        "processed_filename": ntpath.basename(path_for_processing),
        "call_duration_seconds": call_duration_seconds,
    }), 201


@calls_bp.route('/companies/<int:company_id>/call_records', methods=['GET'])
@check_company_admin(company_id_arg_name='company_id')
async def api_get_call_records(company_id: int):
    """Retrieves call records for a company within a time range."""
    start_time_str = request.args.get('start_time')
    end_time_str = request.args.get('end_time')
    print("FILTRO APLICADO: ", start_time_str, end_time_str)
    employee_id_filter_str = request.args.get('employee_id')

    if not start_time_str or not end_time_str:
        return jsonify({"error": "Missing required query parameters: 'start_time' and 'end_time'"}), 400

    try:
        datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format for start_time or end_time. Use ISO 8601."}), 400

    employee_id_filter = None
    if employee_id_filter_str:
        try:
            employee_id_filter = int(employee_id_filter_str)
        except ValueError:
            return jsonify({"error": "Invalid 'employee_id' filter. Must be an integer."}), 400

    try:
        records = await run_blocking_io(
            db_service.get_call_records,
            company_id, start_time_str, end_time_str, employee_id_filter
        )

        sanitized_records = []
        for record in records:
            if record.get('audio_file_path'):
                record['audio_filename'] = ntpath.basename(record['audio_file_path'])
            record.pop('audio_file_path', None)
            sanitized_records.append(record)

        return jsonify(sanitized_records), 200
    except Exception as e:
         current_app.logger.error(f"Error retrieving call records for company {company_id}: {e}", exc_info=True)
         return jsonify({"error": "Failed to retrieve call records."}), 500


@calls_bp.route('/companies/<int:company_id>/call_records/stats', methods=['GET'])
@check_company_admin(company_id_arg_name='company_id')
async def api_get_call_record_stats(company_id: int):
    """Calculates statistics for call records based on filters."""
    start_time_str = request.args.get('start_time')
    end_time_str = request.args.get('end_time')
    employee_id_filter_str = request.args.get('employee_id')

    if not start_time_str or not end_time_str:
        return jsonify({"error": "Missing required query parameters: 'start_time' and 'end_time'"}), 400
    try:
        datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        datetime.fromisoformat(end_time_str.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format for start_time or end_time. Use ISO 8601."}), 400
    employee_id_filter = None
    if employee_id_filter_str:
        try:
            employee_id_filter = int(employee_id_filter_str)
        except ValueError:
            return jsonify({"error": "Invalid 'employee_id' filter. Must be an integer."}), 400

    try:
        # Consider optimizing this by calculating stats in the DB directly
        records = await run_blocking_io(
            db_service.get_call_records,
            company_id, start_time_str, end_time_str, employee_id_filter
        )

        filters_applied = {
            "company_id": company_id,
            "start_time": start_time_str,
            "end_time": end_time_str,
            "employee_id": employee_id_filter
        }

        if not records:
            stats = {"total_calls": 0, "total_duration_seconds": 0, "conflict_percentage": 0.0,
                     "filters_applied": filters_applied}
        else:
            stats = {
                "total_calls": db_service.count_calls(records),
                "total_duration_seconds": db_service.sum_call_durations(records),
                "conflict_percentage": db_service.calculate_conflict_percentage(records),
                "filters_applied": filters_applied
            }
        return jsonify(stats), 200

    except Exception as e:
         current_app.logger.error(f"Error calculating call stats for company {company_id}: {e}", exc_info=True)
         return jsonify({"error": "Failed to calculate call statistics."}), 500


@calls_bp.route('/recordings/<path:filename>', methods=['GET'])
@token_required
@admin_only # Assuming only admins can download
async def serve_recording(filename: str):
    """Serves a specific recording file."""
    if '..' in filename or filename.startswith('/'):
        return jsonify({"error": "Invalid filename."}), 400

    recordings_dir_abs = os.path.abspath(config.RECORDINGS_DIR)
    requested_path_abs = os.path.abspath(os.path.join(recordings_dir_abs, filename))

    if not requested_path_abs.startswith(recordings_dir_abs):
         current_app.logger.warning(f"Attempted directory traversal: {filename}")
         return jsonify({"error": "Access denied to the requested file path."}), 403

    # Optional: Add check if admin's company owns this recording
    # Requires DB lookup based on filename -> company_id comparison
    try:
        response = await run_blocking_io(
            send_from_directory,
            config.RECORDINGS_DIR,
            filename,
            as_attachment=False
        )
        return response
    except FileNotFoundError:
        return jsonify({"error": "Recording file not found on server."}), 404
    except Exception as e:
        current_app.logger.error(f"Error serving recording file {filename}: {e}", exc_info=True)
        return jsonify({"error": "Could not serve recording file."}), 500