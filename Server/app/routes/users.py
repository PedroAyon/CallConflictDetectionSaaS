# app/routes/users.py
# TODO: Remove in production!

from flask import Blueprint, request, jsonify, current_app

from app.extensions import db_service
from app.utils import run_blocking_io

users_bp = Blueprint('users', __name__, url_prefix='/users')

@users_bp.route('', methods=['POST'])

async def api_add_user():
    """Adds a new basic user."""
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data['username']
    password = data['password']

    try:
        await run_blocking_io(db_service.add_user, username, password)
        return jsonify({"message": f"User '{username}' created successfully."}), 201
    except Exception as e:
        current_app.logger.error(f"Error adding user {username}: {e}")
        # Consider more specific error checking, e.g., for duplicates
        if "UNIQUE constraint failed" in str(e):
             return jsonify({"error": f"Username '{username}' already exists."}), 409
        return jsonify({"error": "Failed to add user."}), 500


@users_bp.route('/<username>', methods=['GET'])
async def api_get_user(username: str):
    """Retrieves basic information for a specific user."""
    user_info = await run_blocking_io(db_service.get_user, username) # Assumes password excluded
    if user_info:
        return jsonify(user_info), 200
    else:
        return jsonify({"error": f"User '{username}' not found"}), 404