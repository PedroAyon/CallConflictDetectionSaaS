PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    last_updated DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now', 'utc'))
);

CREATE TABLE IF NOT EXISTS companies (
    company_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL UNIQUE,
    subscription_expiration DATE NOT NULL,
    admin_username TEXT NOT NULL,
    FOREIGN KEY (admin_username) REFERENCES users(username)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    user_username TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('M', 'F')),
    birthdate DATE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_username) REFERENCES users(username)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE(company_id, user_username)
);

CREATE TABLE IF NOT EXISTS call_records (
    call_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    call_timestamp TEXT NOT NULL,
    call_duration INTEGER NOT NULL CHECK(call_duration >= 0),
    transcription TEXT,
    audio_file_path TEXT NOT NULL UNIQUE,
    conflict_detected BOOLEAN,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (
        (transcription IS NULL AND conflict_detected IS NULL)
        OR (transcription IS NOT NULL AND conflict_detected IN (0,1))
    )
);
