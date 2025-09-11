# app/__init__.py
import logging
from flask import Flask

from config import config
from app.extensions import cors, db_service # Import only necessary instances
from app.tasks import start_background_tasks
from app.errors import register_error_handlers

def create_app(config_object=config):
    """Factory to create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Initialize extensions
    cors.init_app(app) # Configure specific origins in config if needed

    # Register blueprints
    from app.auth.routes import auth_bp
    from app.routes.users import users_bp
    from app.routes.companies import companies_bp
    from app.routes.employees import employees_bp
    from app.routes.calls import calls_bp
    from app.routes.categories import categories_bp
    from app.routes.daily_summary import summary_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(companies_bp)
    app.register_blueprint(employees_bp)
    app.register_blueprint(calls_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(summary_bp)

    # Register error handlers
    register_error_handlers(app)

    # Configure logging
    log_level = logging.DEBUG if app.debug else logging.INFO
    # Use basicConfig or more advanced logging setup (e.g., RotatingFileHandler)
    logging.basicConfig(level=log_level,
                        format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
    app.logger.setLevel(log_level) # Ensure Flask logger uses the same level
    app.logger.info("Flask application configured.")
    app.logger.info(f"Debug mode: {app.debug}")

    # App context needed for tasks that might access app config/logger indirectly
    with app.app_context():
        start_background_tasks()
        app.logger.info("Background tasks started.")

    return app