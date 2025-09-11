from flask import Blueprint, request, jsonify, current_app
from app.extensions import db_service
from app.utils import run_blocking_io
from datetime import date
from typing import List, Dict
from app.tasks import summarize_with_gemini

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

            formatted_lines.append(f"---{employee_name} {rec['transcription']}")
    return "\n\n".join(formatted_lines)


@summary_bp.route('', methods=['POST'])
async def api_add_summary():
    """
    adds a daily summary for the day specified
    expects JSON: {"employee_id": <id>, "day": "YYYY-MM-DD" (optional)}
    """
    data = request.get_json()
    if not data or 'employee_id' not in data:
        return jsonify({"error": "'employee_id' is required"}), 400

    employee_id = data['employee_id']
    summary_day = data.get('day') or date.today().strftime('%Y-%m-%d')

    try:
        company_id = await run_blocking_io(
            db_service.get_company_id_by_emp_id,
            employee_id=employee_id
        )

        if company_id is None:
            return jsonify({"error": f"No company found for employee with ID {employee_id}"}), 404

        start_of_day = f"{summary_day} 00:00:00"
        end_of_day = f"{summary_day} 23:59:59"

        records = await run_blocking_io(db_service.get_call_records, company_id, start_of_day, end_of_day)
        formatted_text = format_transcriptions_for_summary(records)

        if not formatted_text:
            return jsonify({"message": f"No transcription for {summary_day}"}), 200

        summary_text = summarize_with_gemini(formatted_text)

        inserted_id = await run_blocking_io(
            db_service.add_daily_summary,
            company_id,
            summary_day,
            summary_text
        )

        if inserted_id:
            return jsonify({
                "message": f"Summary for {summary_day} created.",
                "daily_id": inserted_id,
                "summary": summary_text
            }), 201
        else:
            return jsonify({"error": f"Summary for {summary_day} in company #{company_id} already exists"}), 409

    except Exception as e:
        current_app.logger.error(f"Error creating summary via employee {employee_id} for {summary_day}: {e}")
        return jsonify({"error": "Error."}), 500


@summary_bp.route('/<int:company_id>/<string:summary_date>', methods=['GET'])
async def api_get_summary(company_id: int, summary_date: str):
    """
    Retrieves the summary for a specific day and company.
    """
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


@summary_bp.route('/<int:company_id>/<string:summary_date>', methods=['PUT'])
async def api_update_summary(company_id: int, summary_date: str):
    """
    Updates the summary from specific day and company.
    parameters: company id and date.
    Expects JSON: {"summary": "<new summary>"}
    """
    data = request.get_json()
    if not data or 'summary' not in data:
        return jsonify({"error": "'summary' is requerido "}), 400

    new_summary_text = data['summary']

    try:
        rows_affected = await run_blocking_io(
            db_service.update_daily_summary,
            company_id=company_id,
            summary_day=summary_date,
            summary_text=new_summary_text
        )

        if rows_affected > 0:
            return jsonify({"message": f"Summary on {company_id} at'{summary_date}'updated."}), 200
        else:
            return jsonify({"error": f"No summary for {company_id} at '{summary_date}'"}), 404

    except Exception as e:
        current_app.logger.error(f"Error {company_id} & {summary_date}: {e}")
        return jsonify({"error": "Error."}), 500
