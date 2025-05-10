import os
import pytest
from db.database import Database

# Calculate path to Server/db/schema.sql regardless of cwd
HERE = os.path.dirname(__file__)
SCHEMA_PATH = os.path.abspath(os.path.join(HERE, "..", "db", "schema.sql"))

@pytest.fixture(autouse=True)
def clean_db(tmp_path):
    db_file = tmp_path / "test.db"
    db = Database(str(db_file), SCHEMA_PATH)
    yield db
    # tmp_path is auto‐cleaned after test
