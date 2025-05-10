import sqlite3
from typing import List, Tuple, Optional


class Database:
    def __init__(self, db_path: str = "database.sqlite", schema_path: str = "schema.sql"):
        self.db_path = db_path
        self.schema_path = schema_path
        self._init_db()

    def _init_db(self):
        """Initializes the database using the schema.sql file."""
        with sqlite3.connect(self.db_path) as conn:
            with open(self.schema_path, 'r') as f:
                conn.executescript(f.read())

    def add_user(self, username: str, password: str):
        """Creates a user if not already exists."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
                (username, password)
            )

    def get_user(self, username: str) -> Optional[Tuple[str, str]]:
        """Fetches a user by username."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT username, password FROM users WHERE username = ?",
                (username,)
            )
            return cursor.fetchone()

    def add_company(self, name: str, expiration: str, admin_username: str):
        """Registers a new company under an admin user."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO companies (company_name, subscription_expiration, admin_username) VALUES (?, ?, ?)",
                (name, expiration, admin_username)
            )

    def add_employee(
        self,
        company_id: int,
        username: str,
        password: str,
        first_name: str,
        last_name: str,
        gender: Optional[str] = None,
        birthdate: Optional[str] = None
    ):
        """Creates the employee and user and assigns them to a company."""
        with sqlite3.connect(self.db_path) as conn:
            # Ensure user exists
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
                (username, password)
            )
            # Insert employee record
            conn.execute(
                """
                INSERT INTO employees (
                    company_id,
                    user_username,
                    first_name,
                    last_name,
                    gender,
                    birthdate
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (company_id, username, first_name, last_name, gender, birthdate)
            )

    def add_call_record(
        self,
        employee_id: int,
        timestamp: str,
        duration: int,
        transcription: Optional[str],
        audio_path: str,
        conflict: Optional[bool]
    ):
        """Adds a call record for an employee."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO call_records (
                    employee_id,
                    call_timestamp,
                    call_duration,
                    transcription,
                    audio_file_path,
                    conflict_detected
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (employee_id, timestamp, duration, transcription, audio_path, conflict)
            )

    def get_analyzed_calls(self) -> List[Tuple]:
        """Fetches calls that have been transcribed and analyzed for conflict."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM call_records
                WHERE transcription IS NOT NULL AND conflict_detected IS NOT NULL
                """
            )
            return cursor.fetchall()
