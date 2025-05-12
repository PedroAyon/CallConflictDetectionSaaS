# app/routes/companies.py
from flask import Blueprint, request, jsonify, g, current_app
from datetime import datetime

from app.extensions import db_service
from app.utils import run_blocking_io
from app.auth.decorators import token_required, admin_only

companies_bp = Blueprint('companies', __name__, url_prefix='/companies')

@companies_bp.route('', methods=['POST'])
# @token_required # Decide auth requirements
# @some_super_admin_role # Decide auth requirements
async def api_add_company():
    """Registers a new company and its initial admin user."""
    data = request.get_json()
    required_fields = ['company_name', 'subscription_expiration', 'admin_username', 'admin_password']
    if not data or not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        datetime.strptime(data['subscription_expiration'], '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format for subscription_expiration. Use YYYY-MM-DD."}), 400

    try:
        await run_blocking_io(
            db_service.add_company,
            data['company_name'],
            data['subscription_expiration'],
            data['admin_username'],
            data['admin_password']
        )
        created_company = await run_blocking_io(db_service.get_company_by_admin, admin_username=data['admin_username'])
        if created_company:
            return jsonify({"message": "Company registered successfully", "company": created_company}), 201
        else:
            current_app.logger.error(f"Company possibly created for admin {data['admin_username']} but couldn't be retrieved immediately.")
            return jsonify({"message": "Company registration processed, but confirmation retrieval failed."}), 207
    except Exception as e:
        current_app.logger.error(f"Error adding company: {e}", exc_info=True)
        if "UNIQUE constraint failed" in str(e):
             return jsonify({"error": "Admin username or company name might already exist."}), 409
        return jsonify({"error": "Failed to register company."}), 500


@companies_bp.route('/admin/me', methods=['GET'])
@token_required
@admin_only
async def api_get_my_company_details():
    """Retrieves the company details for the currently logged-in admin."""
    admin_username_from_token = g.current_user.get('sub')

    if not admin_username_from_token:
        current_app.logger.error("Critical: Admin username ('sub') missing in token payload despite passing decorators.")
        return jsonify({"error": "Internal server error: Cannot identify admin user."}), 500

    company = await run_blocking_io(db_service.get_company_by_admin, admin_username=admin_username_from_token)

    if company:
        return jsonify(company), 200
    else:
        current_app.logger.warning(f"Admin {admin_username_from_token} authenticated but no associated company found.")
        return jsonify({"error": "Company details not found for this administrator."}), 404