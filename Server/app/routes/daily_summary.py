from flask import Blueprint, request, jsonify, current_app
from app.extensions import db_service
from app.utils import run_blocking_io
from datetime import datetime, date, timezone
from typing import List, Dict
from app.tasks import summarize_with_llm

summary_bp = Blueprint('summaries', __name__, url_prefix='/summaries')


def format_transcriptions_for_summary(records: List[Dict]) -> str:
    """
    Format: "---<Name> <Last name> <Transcription>"
    """
    if not records:
        return ""

    formatted_lines = []
    for rec in records:
        if rec and rec.get('transcription'):
            first_name = rec.get('employee_first_name', 'Name')
            last_name = rec.get('employee_last_name', '-')
            employee_name = f"{first_name} {last_name}".strip()

            formatted_lines.append(f"Nombre del empleado: {employee_name}\nTranscripción: {rec['transcription']}")
    return "\n\n".join(formatted_lines)


@summary_bp.route('', methods=['POST'])
async def api_add_summary():
    """
    Adds a daily summary for the day specified, replacing it if it already exists.
    Expects JSON: {"employee_id": <id>, "day": "YYYY-MM-DD" (optional)}
    """
    data = request.get_json()
    if not data or 'company_id' not in data:
        return jsonify({"error": "'company_id' is required"}), 400

    company_id = data['company_id']
    summary_day_str = data.get('day') or date.today().strftime('%Y-%m-%d')
    summary_day = datetime.fromisoformat(summary_day_str)

    try:
        if company_id is None:
            return jsonify({"error": "No company id"}), 404

        start_of_day = datetime.combine(summary_day.date(), datetime.min.time(), tzinfo=timezone.utc)
        end_of_day = datetime.combine(summary_day.date(), datetime.max.time(), tzinfo=timezone.utc)

        records = await run_blocking_io(
            db_service.get_call_records,
            company_id,
            start_of_day.isoformat(),
            end_of_day.isoformat()
        )
        formatted_text = format_transcriptions_for_summary(records)

        if not formatted_text:
            return jsonify({"message": f"No transcription for {summary_day_str}"}), 200

        summary_text = summarize_with_llm(formatted_text)

        # Use the upsert method to replace the summary if it already exists
        await run_blocking_io(
            db_service.add_or_update_daily_summary,
            company_id,
            summary_day_str,
            summary_text
        )

        return jsonify({
            "message": f"Summary for {summary_day_str} created or replaced.",
            "summary": summary_text
        }), 201

    except Exception as e:
        current_app.logger.error(f"Error creating/replacing summary: {e}")
        return jsonify({"error": "Error."}), 500


@summary_bp.route('/<int:company_id>/<string:summary_date>', methods=['GET'])
async def api_get_summary(company_id: int, summary_date: str):
    """
    Retrieves the summary for a specific day and company.
    Validates that the provided date string is in the expected ISO 8601 format.
    """
    try:
        # Validate the date format received from the URL
        datetime.fromisoformat(summary_date)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format. Use ISO 8601 format like YYYY-MM-DD."}), 400

    try:
        summary_text = await run_blocking_io(
            db_service.get_summary_at_day,
            company_id=company_id,
            summary_day=summary_date
        )

        if summary_text is not None:
            return jsonify({"summary": summary_text}), 200
        else:
            return jsonify({"error": f"No summary found for company {company_id} on '{summary_date}'"}), 404

    except Exception as e:
        current_app.logger.error(f"Error retrieving summary for company {company_id} on {summary_date}: {e}")
        return jsonify({"error": "Failed to retrieve summary."}), 500