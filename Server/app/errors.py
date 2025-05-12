# app/errors.py
import sqlite3
from flask import jsonify, current_app

def register_error_handlers(app):
    """Registers error handlers with the Flask app instance."""

    @app.errorhandler(sqlite3.IntegrityError)
    def handle_db_integrity_error(error):
        current_app.logger.error(f"Database integrity error: {error}")
        return jsonify({"error": "Database integrity constraint violated.", "details": str(error)}), 409

    @app.errorhandler(ValueError)
    def handle_value_error(error):
        current_app.logger.error(f"Value error: {error}")
        return jsonify({"error": "Invalid value provided.", "details": str(error)}), 400

    @app.errorhandler(FileNotFoundError)
    def handle_file_not_found_error(error):
        current_app.logger.error(f"File not found error: {error}")
        return jsonify({"error": "File not found.", "details": str(error)}), 404

    @app.errorhandler(404)
    def handle_not_found_error(error):
         current_app.logger.warning(f"Resource not found: {error}")
         return jsonify({"error": "The requested resource was not found on the server."}), 404

    @app.errorhandler(413)
    def handle_request_entity_too_large(error):
         limit_mb = current_app.config.get('MAX_CONTENT_LENGTH', 0) // (1024*1024)
         current_app.logger.warning(f"Upload failed: File too large (limit: {limit_mb}MB).")
         return jsonify({"error": f"File too large. Maximum size allowed is {limit_mb}MB."}), 413

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        current_app.logger.error(f"An unexpected error occurred: {error}", exc_info=True)
        # Avoid leaking internal error details in production
        error_detail = str(error) if current_app.debug else "Internal Server Error"
        return jsonify({"error": "An unexpected server error occurred.", "details": error_detail}), 500