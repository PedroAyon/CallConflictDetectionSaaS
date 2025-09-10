# app/auth/decorators.py
from functools import wraps
from datetime import datetime, timezone
from flask import request, jsonify, g, current_app
import jwt

from app.extensions import db_service
from app.utils import run_blocking_io

def token_required(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Bearer token malformed"}), 401
        # Check the original path again when looking for query param token
        elif request.path == '/validate_auth_token' and 'token' in request.args: # <-- REVERTED PATH
             token = request.args.get('token')

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        try:
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=[current_app.config['JWT_ALGORITHM']]
            )
            g.current_user = payload

            username = payload.get('sub')
            token_issued_at_ts = payload.get('iat')

            if username and token_issued_at_ts:
                user_last_updated = await run_blocking_io(db_service.get_user_last_updated, username)
                if user_last_updated:
                    token_issued_at_dt = datetime.fromtimestamp(token_issued_at_ts, timezone.utc)

                    if isinstance(user_last_updated, str):
                        try:
                            user_last_updated = datetime.fromisoformat(user_last_updated.replace("Z", "+00:00"))
                        except ValueError:
                             current_app.logger.warning(f"Could not parse user_last_updated string: {user_last_updated}")
                             user_last_updated = None

                    if isinstance(user_last_updated, datetime):
                        if user_last_updated.tzinfo is None:
                             user_last_updated = user_last_updated.replace(tzinfo=timezone.utc)

                        if user_last_updated > token_issued_at_dt:
                            current_app.logger.warning(f"Outdated token used for user {username}. Token issue time: {token_issued_at_dt}, User updated: {user_last_updated}")
                            return jsonify({"error": "Token is outdated due to user profile changes. Please log in again."}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.error(f"Invalid token encountered: {e}")
            return jsonify({"error": "Token is invalid"}), 401
        except Exception as e:
            current_app.logger.error(f"Unexpected token validation error: {e}", exc_info=True)
            return jsonify({"error": "Token processing error"}), 401

        return await f(*args, **kwargs)
    return decorated_function


def admin_only(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user.get('user_type') != 'admin':
            return jsonify({"error": "Administrator access required"}), 403
        return await f(*args, **kwargs)
    return decorated_function


def employee_only(f):
    @wraps(f)
    async def decorated_function(*args, **kwargs):
        if not hasattr(g, 'current_user') or g.current_user.get('user_type') != 'employee':
            return jsonify({"error": "Employee access required"}), 403
        return await f(*args, **kwargs)
    return decorated_function


def check_admin_self(f):
    @wraps(f)
    @token_required
    @admin_only
    async def decorated_function(admin_username: str, *args, **kwargs):
        if g.current_user.get('sub') != admin_username:
            return jsonify({"error": "Access denied: Admins can only access their own details via this endpoint."}), 403
        return await f(admin_username, *args, **kwargs)
    return decorated_function


def check_company_admin(company_id_arg_name='company_id'):
    def decorator(f):
        @wraps(f)
        @token_required
        @admin_only
        async def decorated_function(*args, **kwargs):
            company_id_from_path_str = str(kwargs.get(company_id_arg_name))
            token_company_id_str = str(g.current_user.get('company_id'))

            if not company_id_from_path_str or company_id_from_path_str == 'None':
                 current_app.logger.error(f"Decorator check_company_admin failed: missing or invalid path arg '{company_id_arg_name}' value '{kwargs.get(company_id_arg_name)}'")
                 return jsonify({"error": f"Internal configuration error: Missing '{company_id_arg_name}' in path"}), 500

            if company_id_from_path_str != token_company_id_str:
                return jsonify({"error": f"Access denied: Admin not authorized for company ID {company_id_from_path_str}."}), 403
            return await f(*args, **kwargs)
        return decorated_function
    return decorator


def check_admin_of_employee_company(employee_id_arg_name='employee_id'):
    def decorator(f):
        @wraps(f)
        @token_required
        @admin_only
        async def decorated_function(*args, **kwargs):
            employee_id_from_path = kwargs.get(employee_id_arg_name)
            if employee_id_from_path is None:
                return jsonify({"error": f"Employee ID missing in request path (expected '{employee_id_arg_name}')"}), 400

            try:
                employee_id_int = int(employee_id_from_path)
            except ValueError:
                return jsonify({"error": f"Invalid Employee ID format: '{employee_id_from_path}'"}), 400

            employee_company_id = await run_blocking_io(
                db_service.get_company_id_by_employee_id,
                employee_id=employee_id_int
            )

            if employee_company_id is None:
                return jsonify({"error": f"Employee with ID {employee_id_int} not found."}), 404

            admin_company_id = str(g.current_user.get('company_id'))

            if admin_company_id != str(employee_company_id):
                return jsonify({"error": f"Access denied: Admin not authorized for the company of employee ID {employee_id_int}."}), 403

            return await f(*args, **kwargs)
        return decorated_function
    return decorator

def check_self_employee(employee_id_arg_name='employee_id'):
    def decorator(f):
        @wraps(f)
        @token_required
        @employee_only
        async def decorated_function(*args, **kwargs):
            employee_id_from_path = kwargs.get(employee_id_arg_name)
            token_employee_id = g.current_user.get('employee_id')

            if str(token_employee_id) != str(employee_id_from_path):
                return jsonify({"error": "Access denied: Employees can only access their own records via this endpoint."}), 403
            return await f(*args, **kwargs)
        return decorated_function
    return decorator