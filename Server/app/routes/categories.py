from flask import Blueprint, request, jsonify, g, current_app

from app.extensions import db_service
from app.utils import run_blocking_io
from app.auth.decorators import check_company_admin

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/companies/<int:company_id>/categories', methods=['POST'])
@check_company_admin(company_id_arg_name='company_id')
async def api_add_category(company_id: int):
    """
    Adds a new call category for the specified company.
    Only the company's admin can perform this action.
    """
    data = request.get_json()
    if not data or not data.get('category_name'):
        return jsonify({"error": "Missing required field: 'category_name'"}), 400

    category_name = data['category_name']
    category_description = data.get('category_description') # Optional

    try:
        await run_blocking_io(
            db_service.add_category,
            company_id,
            category_name,
            category_description
        )
        return jsonify({"message": f"Category '{category_name}' created successfully for company {company_id}"}), 201
    except Exception as e:
        current_app.logger.error(f"Error adding category to company {company_id}: {e}", exc_info=True)
        if "UNIQUE constraint failed" in str(e):
             return jsonify({"error": f"Category name '{category_name}' already exists for this company."}), 409
        return jsonify({"error": "Failed to create category."}), 500


@categories_bp.route('/companies/<int:company_id>/categories', methods=['GET'])
@check_company_admin(company_id_arg_name='company_id')
async def api_get_categories_by_company(company_id: int):
    """
    Retrieves a list of all call categories for the specified company.
    Only the company's admin can perform this action.
    """
    try:
        categories = await run_blocking_io(db_service.get_categories_by_company, company_id=company_id)
        return jsonify(categories), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving categories for company {company_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve categories."}), 500


@categories_bp.route('/companies/<int:company_id>/categories/<int:category_id>', methods=['DELETE'])
@check_company_admin(company_id_arg_name='company_id')
async def api_delete_category(company_id: int, category_id: int):
    """
    Deletes a specific category for a company.
    Ensures the category belongs to the company before deletion.
    Only the company's admin can perform this action.
    """
    try:
        # The db_service function should verify that the category_id belongs to the company_id
        # as a security measure before deleting.
        await run_blocking_io(db_service.delete_category, category_id=category_id, company_id=company_id)
        return jsonify({"message": f"Category {category_id} deleted successfully"}), 200
    except ValueError as e:
        # This error is raised from db_service if the category is not found or doesn't belong to the company
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting category {category_id} for company {company_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete category."}), 500
