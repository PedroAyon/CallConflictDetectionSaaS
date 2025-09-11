import sqlite3
from datetime import datetime, timezone
from typing import List, Optional, Dict

from werkzeug.security import generate_password_hash, check_password_hash


class Database:
    def __init__(self, db_path: str = "database.sqlite", schema_path: str = "schema.sql"):
        self.db_path = db_path
        self.schema_path = schema_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_db(self):
        conn = self._get_connection()
        with conn:
            with open(self.schema_path, 'r') as f:
                conn.executescript(f.read())

    def add_user(self, username: str, password: str):
        hashed_password = generate_password_hash(password)
        last_updated = datetime.now(timezone.utc)
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password, last_updated) VALUES (?, ?, ?)",
                (username, hashed_password, last_updated)
            )

    def get_user(self, username: str) -> Optional[Dict]:
        """Fetches a user by username (only username, no password info). For dev/debug."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT username FROM users WHERE username = ?",  # Does not select password
                (username,)
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_details_for_login(self, username: str, password_attempt: str) -> Optional[Dict]:
        """
        Fetches user details for login if credentials are valid and user is admin or employee.
        Verifies password using check_password_hash.
        Returns a dict with username, user_type, company_id, and employee_id (if applicable).
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Step 1: Fetch user and their hashed password
            cursor.execute(
                "SELECT username, password AS hashed_password FROM users WHERE username = ?",
                (username,)
            )
            user_auth_data = cursor.fetchone()

            if not user_auth_data:
                return None  # User not found

            if not check_password_hash(user_auth_data['hashed_password'], password_attempt):
                return None  # Password incorrect

            # Step 2: User authenticated, now determine role and fetch role-specific details
            # Check if admin
            cursor.execute(
                "SELECT company_id FROM companies WHERE admin_username = ?",
                (username,)
            )
            admin_company_data = cursor.fetchone()
            if admin_company_data:
                return {
                    "username": username,
                    "user_type": "admin",
                    "company_id": admin_company_data['company_id'],
                    "employee_id": None
                }

            # Check if employee
            cursor.execute(
                "SELECT employee_id, company_id FROM employees WHERE user_username = ?",
                (username,)
            )
            employee_data = cursor.fetchone()
            if employee_data:
                return {
                    "username": username,
                    "user_type": "employee",
                    "company_id": employee_data['company_id'],
                    "employee_id": employee_data['employee_id']
                }

            # User exists and password is correct, but not an admin or employee.
            return None

    def is_user_admin(self, username: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM companies WHERE admin_username = ?",
                (username,)
            )
            return cursor.fetchone() is not None

    def get_company_id_by_employee_id(self, employee_id: int) -> Optional[int]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT company_id FROM employees WHERE employee_id = ?",
                (employee_id,)
            )
            row = cursor.fetchone()
            return row['company_id'] if row else None

    def add_company(
            self,
            name: str,
            expiration: str,
            admin_username: str,
            admin_password: str
    ):
        hashed_admin_password = generate_password_hash(admin_password)
        last_updated = datetime.now(timezone.utc)
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password, last_updated) VALUES (?, ?, ?)",
                (admin_username, hashed_admin_password, last_updated)
            )
            conn.execute(
                "INSERT INTO companies (company_name, subscription_expiration, admin_username) VALUES (?, ?, ?)",
                (name, expiration, admin_username)
            )

    def get_company_by_admin(self, admin_username: str) -> Optional[Dict]:
        with self._get_connection() as conn:
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
        hashed_password = generate_password_hash(password)
        last_updated = datetime.now(timezone.utc)
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (username, password, last_updated) VALUES (?, ?, ?)",
                (username, hashed_password, last_updated)
            )
            conn.execute(
                """
                INSERT INTO employees (
                    company_id, user_username, first_name, last_name, gender, birthdate
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (company_id, username, first_name, last_name, gender, birthdate)
            )

    def get_employees_by_company(self, company_id: int) -> List[Dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT e.employee_id, e.user_username AS username, 
                       e.first_name, e.last_name, e.gender, e.birthdate, e.company_id
                FROM employees e
                WHERE e.company_id = ?
                """,
                (company_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def update_employee(
        self,
        employee_id: int,
        new_username: str,
        new_password: Optional[str],   # now optional
        first_name: str,
        last_name: str,
        gender: Optional[str] = None,
        birthdate: Optional[str] = None
    ) -> None:
        last_updated = datetime.now(timezone.utc)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT user_username FROM employees WHERE employee_id = ?",
                (employee_id,)
            )
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Employee ID {employee_id} does not exist.")
            old_username = row['user_username']

            # 1) Update users table
            if new_password is not None:
                # hash the new password
                hashed_new_password = generate_password_hash(new_password)
                conn.execute(
                    "UPDATE users SET username = ?, password = ?, last_updated = ? WHERE username = ?",
                    (new_username, hashed_new_password, last_updated, old_username)
                )
            else:
                # keep existing password hash
                conn.execute(
                    "UPDATE users SET username = ?, last_updated = ? WHERE username = ?",
                    (new_username, last_updated, old_username)
                )

            # 2) Prepare fields for employees table
            update_fields = {
                "first_name": first_name,
                "last_name": last_name,
                "gender": gender,
                "birthdate": birthdate,
            }
            # handle username change cascading
            if new_username != old_username:
                update_fields["user_username"] = new_username

            set_clause = ", ".join(f"{key} = ?" for key in update_fields)
            params = list(update_fields.values())
            params.append(employee_id)

            conn.execute(
                f"UPDATE employees SET {set_clause} WHERE employee_id = ?",
                tuple(params)
            )
            conn.commit()


    def delete_employee(self, employee_id: int) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_username FROM employees WHERE employee_id = ?", (employee_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Employee ID {employee_id} does not exist.")
            username = row['user_username']

            conn.execute("DELETE FROM employees WHERE employee_id = ?", (employee_id,))
            # Consider if user should be deleted if they might have other roles (e.g. admin)
            # For this model, deleting employee also deletes their general user entry.
            conn.execute("DELETE FROM users WHERE username = ?", (username,))
            conn.commit()

    def add_category(self, company_id: int, name: str, description: Optional[str]):
        """Adds a new category for a company."""
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO categories (company_id, category_name, category_description) VALUES (?, ?, ?)",
                (company_id, name, description)
            )

    def get_categories_by_company(self, company_id: int) -> List[Dict]:
        """Retrieves all categories for a specific company."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM categories WHERE company_id = ?",
                (company_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def delete_category(self, company_id: int, category_id: int):
        """Deletes a category for a specific company."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM categories WHERE category_id = ? AND company_id = ?",
                (category_id, company_id)
            )
            if cursor.rowcount == 0:
                raise ValueError(f"Category ID {category_id} not found or does not belong to company {company_id}.")

    def add_call_record(
            self,
            employee_id: int,
            timestamp: str,
            duration: int,
            transcription: Optional[str],
            audio_path: str,
            conflict: Optional[bool]
    ):
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO call_records (
                    employee_id, category_id, call_timestamp, call_duration, transcription,
                    audio_file_path, conflict_detected
                ) VALUES (?, null, ?, ?, ?, ?, ?)
                """,
                (employee_id, timestamp, duration, transcription, audio_path, conflict)
            )

    def update_call_analysis(self, audio_file_path: str, transcription: str, conflict: bool):
        with self._get_connection() as conn:
            conn.execute(
                "UPDATE call_records SET transcription = ?, conflict_detected = ? WHERE audio_file_path = ?",
                (transcription, conflict, audio_file_path)
            )

    def get_call_records(
            self,
            company_id: int,
            start_time: str,
            end_time: str,
            employee_id_filter: Optional[int] = None
    ) -> List[Dict]:
        query = """
            SELECT 
                cr.call_id,
                cr.employee_id,
                cr.call_timestamp,
                cr.call_duration,
                cr.transcription,
                cr.audio_file_path,
                cr.conflict_detected AS conflict_value,
                e.user_username AS employee_username, 
                e.first_name AS employee_first_name, 
                e.last_name AS employee_last_name
            FROM call_records cr
            JOIN employees e ON cr.employee_id = e.employee_id
            WHERE e.company_id = ? AND cr.call_timestamp BETWEEN ? AND ?
        """
        params: List[any] = [company_id, start_time, end_time]  # Type 'any' for params list

        if employee_id_filter is not None:
            query += " AND cr.employee_id = ?"
            params.append(employee_id_filter)

        query += " ORDER BY cr.call_timestamp DESC"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def count_calls(records: List[Dict]) -> int:
        return len(records)

    @staticmethod
    def sum_call_durations(records: List[Dict]) -> int:
        return sum(r.get('call_duration', 0) for r in records if r.get('call_duration') is not None)

    @staticmethod
    def calculate_conflict_percentage(records: List[Dict]) -> float:
        total = len(records)
        if total == 0:
            return 0.0
        conflicts = sum(1 for r in records if r.get('conflict_value') in (1, True))
        return (conflicts / total) * 100.0

    def get_user_last_updated(self, username: str) -> Optional[datetime]:
        """
        Fetches the last_updated timestamp for a user.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT last_updated FROM users WHERE username = ?", (username,))
            result = cursor.fetchone()
            if result and result[0]:
                try:
                    return datetime.fromisoformat(result[0])
                except ValueError:
                    return None  # Handle potential issues with the stored format
            return None

    def update_user(self, username: str, password_hash: str, last_updated: datetime = datetime.now(timezone.utc)):
        """
        Updates a user's password and last_updated timestamp.
        """
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET password_hash=?, last_updated=? WHERE username=?",
                       (password_hash, last_updated.isoformat(), username))
        conn.commit()

    def get_summary_at_day(self, company_id: int, summary_day: str) -> Optional[str]:
        """Retrieves a daily summary for a specific company and day."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT summary FROM daily_summary WHERE company_id = ? AND day = ?",
                (company_id, summary_day)
            )
            row = cursor.fetchone()
            return row['summary'] if row else None

    def add_daily_summary(self, company_id: int, summary_day: str, summary_text: str) -> Optional[int]:
        query = "INSERT OR IGNORE INTO daily_summary (company_id, day, summary) VALUES (?, ?, ?);"
        params = (company_id, summary_day, summary_text)
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
        

    def update_daily_summary(self, company_id: int, summary_day: str, summary_text: str) -> int:
        query = "UPDATE daily_summary SET summary = ? WHERE day = ? AND company_id = ?;"
        params = (summary_text, summary_day, company_id)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()