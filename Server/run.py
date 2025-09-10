# run.py
from app import create_app
from config import config

app = create_app(config_object=config)

if __name__ == '__main__':
    # Use Gunicorn or Waitress in production instead of app.run
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )