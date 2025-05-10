import sqlite3
from typing import List, Tuple, Optional, Dict


class Database:
    def __init__(self, db_path: str = "database.sqlite", schema_path: str = "schema.sql"):
        self.db_path = db_path
        self.schema_path = schema_path
        self._init_db()

    def _init_db(self):
        """Initializes the database using the schema.sql file."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("PRAGMA foreign_keys = ON;")
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

    def add_company(
        self,
        name: str,
        expiration: str,
        admin_username: str,
        admin_password: str
    ):
        """Registers a new company and its admin user."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
                (admin_username, admin_password)
            )
            conn.execute(
                "INSERT INTO companies (company_name, subscription_expiration, admin_username) VALUES (?, ?, ?)",
                (name, expiration, admin_username)
            )

    def get_company_by_admin(self, admin_username: str) -> Optional[Dict]:
        """Fetches a company associated with an admin user."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM companies WHERE admin_username = ?",
                (admin_username,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

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
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)",
                (username, password)
            )
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

    def get_employees_by_company(self, company_id: int) -> List[Dict]:
        """Returns all employees for a given company, including their username and password."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT e.employee_id, e.user_username AS username, u.password,
                       e.first_name, e.last_name, e.gender, e.birthdate
                FROM employees e
                JOIN users u ON e.user_username = u.username
                WHERE e.company_id = ?
                """,
                (company_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def update_employee(
        self,
        employee_id: int,
        new_username: str,
        new_password: str,
        first_name: str,
        last_name: str,
        gender: Optional[str] = None,
        birthdate: Optional[str] = None
    ) -> None:
        """Updates an employee's details and credentials (excluding company assignment)."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_username FROM employees WHERE employee_id = ?",
                (employee_id,)
            )
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Employee ID {employee_id} does not exist.")
            old_username = row[0]
            cursor.execute(
                "UPDATE users SET username = ?, password = ? WHERE username = ?",
                (new_username, new_password, old_username)
            )
            cursor.execute(
                """
                UPDATE employees
                SET first_name = ?, last_name = ?, gender = ?, birthdate = ?
                WHERE employee_id = ?
                """,
                (first_name, last_name, gender, birthdate, employee_id)
            )
            conn.commit()

    def delete_employee(self, employee_id: int) -> None:
        """Deletes an employee and their user account."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_username FROM employees WHERE employee_id = ?",
                (employee_id,)
            )
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Employee ID {employee_id} does not exist.")
            username = row[0]
            cursor.execute(
                "DELETE FROM employees WHERE employee_id = ?",
                (employee_id,)
            )
            cursor.execute(
                "DELETE FROM users WHERE username = ?",
                (username,)
            )
            conn.commit()

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

    def get_call_records(
            self,
            company_id: int,
            start_time: str,
            end_time: str,
            employee_id: Optional[int] = None
    ) -> List[Dict]:
        """Retrieves call records for a company within a datetime range,
           optionally filtered by a specific employee."""
        query = """
            SELECT c.*
            FROM call_records c
            JOIN employees e ON c.employee_id = e.employee_id
            WHERE e.company_id = ?
        """
        params: List = [company_id]

        # Optionally filter by employee
        if employee_id is not None:
            query += " AND c.employee_id = ?"
            params.append(employee_id)

        # Date‐range filter
        query += " AND c.call_timestamp BETWEEN ? AND ?"
        params.extend([start_time, end_time])

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def count_calls(records: List[Dict]) -> int:
        """Returns the total number of call records."""
        return len(records)

    @staticmethod
    def sum_call_durations(records: List[Dict]) -> int:
        """Returns the sum of all call durations."""
        return sum(r.get('call_duration', 0) for r in records)

    @staticmethod
    def calculate_conflict_percentage(records: List[Dict]) -> float:
        """Calculates the percentage of calls marked as conflictive."""
        total = len(records)
        if total == 0:
            return 0.0
        conflicts = sum(1 for r in records if r.get('conflict_detected') in (1, True))
        return (conflicts / total) * 100.0
