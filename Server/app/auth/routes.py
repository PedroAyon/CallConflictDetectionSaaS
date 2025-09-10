# app/auth/routes.py
from flask import Blueprint, request, jsonify, g, current_app
import jwt
from datetime import datetime, timedelta, timezone

from app.extensions import db_service
from app.utils import run_blocking_io
from app.auth.decorators import token_required

# Remove the url_prefix
auth_bp = Blueprint('auth', __name__)

# Route path must now be the full original path
@auth_bp.route('/login', methods=['POST'])
async def login():
    """Authenticate user and return JWT token."""
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data['username']
    password_attempt = data['password']

    user_details = await run_blocking_io(
        db_service.get_user_details_for_login,
        username=username,
        password_attempt=password_attempt
    )

    print(username, password_attempt, user_details)

    if not user_details:
        return jsonify({"error": "Invalid credentials or insufficient permissions"}), 401

    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(days=current_app.config['JWT_EXPIRATION_DAYS'])

    payload = {
        'sub': user_details['username'],
        'user_type': user_details['user_type'],
        'iat': issued_at,
        'exp': expires_at
    }

    if user_details['user_type'] == 'admin':
        payload['company_id'] = user_details['company_id']
    elif user_details['user_type'] == 'employee':
        payload['company_id'] = user_details['company_id']
        payload['employee_id'] = user_details['employee_id']

    try:
        token = jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm=current_app.config['JWT_ALGORITHM']
        )
        return jsonify({"token": token}), 200
    except Exception as e:
        current_app.logger.error(f"JWT encoding error during login for {username}: {e}")
        return jsonify({"error": "Could not generate authentication token"}), 500

# Route path must now be the full original path
@auth_bp.route('/validate_auth_token', methods=['GET', 'POST'])
@token_required
async def validate_auth_token():
    """Validate the provided JWT token."""
    return jsonify({
        "message": "Token is valid",
        "user_payload": g.current_user
        }), 200