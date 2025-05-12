# app/routes/employees.py
from flask import Blueprint, request, jsonify, g, current_app
from datetime import datetime

from app.extensions import db_service
from app.utils import run_blocking_io
from app.auth.decorators import (
    token_required,
    admin_only,
    check_company_admin,
    check_admin_of_employee_company
)

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('/companies/<int:company_id>/employees', methods=['POST'])
@check_company_admin(company_id_arg_name='company_id')
async def api_add_employee(company_id: int):
    """Adds a new employee to the specified company."""
    data = request.get_json()
    required_fields = ['username', 'password', 'first_name', 'last_name']
    if not data or not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    gender = data.get('gender')
    birthdate = data.get('birthdate')
    if gender and gender not in ('M', 'F', 'O', None, ''):
        return jsonify({"error": "Invalid gender. Use 'M', 'F', 'O', or leave blank."}), 400
    if birthdate:
        try:
            datetime.strptime(birthdate, '%Y-%m-%d')
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid date format for birthdate. Use YYYY-MM-DD."}), 400

    try:
        await run_blocking_io(
            db_service.add_employee,
            company_id, data['username'], data['password'], data['first_name'],
            data['last_name'], gender, birthdate
        )
        return jsonify({"message": f"Employee '{data['username']}' added successfully to company {company_id}"}), 201
    except Exception as e:
        current_app.logger.error(f"Error adding employee to company {company_id}: {e}", exc_info=True)
        if "UNIQUE constraint failed" in str(e):
             return jsonify({"error": f"Username '{data['username']}' already exists."}), 409
        return jsonify({"error": "Failed to add employee."}), 500


@employees_bp.route('/companies/<int:company_id>/employees', methods=['GET'])
@check_company_admin(company_id_arg_name='company_id')
async def api_get_employees_by_company(company_id: int):
    """Retrieves a list of employees for the specified company."""
    try:
        employees = await run_blocking_io(db_service.get_employees_by_company, company_id=company_id)
        return jsonify(employees), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving employees for company {company_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve employees."}), 500


@employees_bp.route('/employees/<int:employee_id>', methods=['PUT'])
@check_admin_of_employee_company(employee_id_arg_name='employee_id')
async def api_update_employee(employee_id: int):
    """Updates details for a specific employee."""
    data = request.get_json()
    required_fields = ['username', 'first_name', 'last_name']
    if not data or not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return jsonify({"error": f"Missing required fields for update: {', '.join(missing)}"}), 400

    username = data['username']
    new_password = data.get('password')
    first_name = data['first_name']
    last_name = data['last_name']
    gender = data.get('gender')
    birthdate = data.get('birthdate')

    if gender and gender not in ('M', 'F', 'O', None, ''):
        return jsonify({"error": "Invalid gender. Use 'M', 'F', 'O', or leave blank."}), 400
    if birthdate:
        try:
            datetime.strptime(birthdate, '%Y-%m-%d')
        except (ValueError, TypeError):
             return jsonify({"error": "Invalid date format for birthdate. Use YYYY-MM-DD."}), 400

    try:
        await run_blocking_io(
            db_service.update_employee,
            employee_id,
            username,
            new_password,
            first_name,
            last_name,
            gender,
            birthdate
        )
        return jsonify({"message": f"Employee {employee_id} updated successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Error updating employee {employee_id}: {e}", exc_info=True)
        if "UNIQUE constraint failed" in str(e):
             return jsonify({"error": f"Username '{username}' may already be taken by another user."}), 409
        return jsonify({"error": "Failed to update employee."}), 500


@employees_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
@check_admin_of_employee_company(employee_id_arg_name='employee_id')
async def api_delete_employee(employee_id: int):
    """Deletes a specific employee."""
    try:
        await run_blocking_io(db_service.delete_employee, employee_id=employee_id)
        return jsonify({"message": f"Employee {employee_id} deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting employee {employee_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete employee."}), 500