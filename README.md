# Call Conflict Detection SaaS for Call Centers

![Project Status](https://img.shields.io/badge/status-Server%20Backend%20Implemented-brightgreen)

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents
1.  [Project Overview](#project-overview)
2.  [Project Structure](#project-structure)
3.  [Server Backend](#server-backend)
    * [Features](#features)
    * [Authentication and Authorization](#authentication-and-authorization)
    * [API Endpoints](#api-endpoints)
4.  [Planned Components](#planned-components)
    * [Dashboard](#dashboard)
    * [Android App](#android-app)
5.  [How It Works (Workflow)](#how-it-works-workflow)
6.  [Setup and Installation](#setup-and-installation)
    * [Prerequisites](#prerequisites)
    * [Cloning the Repository](#cloning-the-repository)
    * [Setting up the Environment](#setting-up-the-environment)
    * [Database Initialization](#database-initialization)
    * [Configuration (.env)](#configuration-env)
    * [Running the Server](#running-the-server)
7.  [Testing](#testing)
8.  [Technologies Used](#technologies-used)
9. [License](#license)

## Project Overview

The **Call Conflict Detection SaaS** project aims to provide a software-as-a-service solution for call centers to automatically detect conflictive, hateful, or negative speech within customer service call recordings. By analyzing the sentiment and content of conversations, call centers can proactively identify potentially problematic interactions, monitor agent performance, ensure quality assurance, and improve customer satisfaction.

This repository currently contains the **Server backend**, which is responsible for receiving call recordings, processing them (audio conversion, speech-to-text transcription, conflict analysis), storing the results, and providing an API for management and reporting.

Future components will include a **Dashboard** for administrators to visualize metrics, manage employees, and review detected conflicts, and an **Android App** for call center employees to easily record and upload customer call audio to the server.

## Project Structure

The project is organized into the following main directories:

```
.
├── Server/          # Contains the entire backend code
├── Dashboard/       # (Planned) Frontend application for administrators
└── Android/         # (Planned) Android application for employees
```

This section focuses on the Server.

Server Folder Structure:

```
└── Server
├── conflict_detection.py
├── database.sqlite        # Default location for the SQLite database file
├── db
│   ├── database.py        # Database interaction logic
│   ├── database.sqlite    # Location for the database file (check .env)
│   ├── schema.sql         # SQL script for database schema
│   └── seeder.py          # Database seeding script
├── main.py                # Flask application entry point and API routes
├── pytest.ini             # Pytest configuration
├── requirements.txt       # Python dependencies
├── test                   # Unit and integration tests
│   ├── conftest.py
│   ├── test_audio.m4a
│   ├── test_audio.wav
│   ├── test_conflict_detection.py
│   ├── test_convert_m4a_to_wav.py
│   ├── test_database.py
│   └── test_text_to_speech.py
└── utils              # Utility functions
├── audio_utils.py     # Audio conversion utilities
└── speech_to_text.py  # Speech-to-Text service integration

```

## Server Backend

The `Server` directory hosts the core logic of the application. It's a Flask-based API that handles receiving audio files, processing them through various steps (audio conversion, transcription, conflict analysis), and managing user, company, employee, and call record data in a SQLite database.

### Features

* **Secure File Upload:** Accepts call recording audio files.
* **Audio Conversion:** Converts M4A files to WAV format for compatibility.
* **Speech-to-Text Transcription:** Integrates with Azure Cognitive Services to transcribe audio into text.
* **Conflict Detection:** Utilizes a sentiment analysis model to identify potential conflict in transcriptions.
* **Data Storage:** Persists user, company, employee, and call record data in a SQLite database.
* **Authentication:** Secure user login using JWT (JSON Web Tokens).
* **Authorization:** Role-based access control (admin, employee) using decorators to protect API endpoints.
* **User and Company Management:** API endpoints for creating and retrieving users and companies.
* **Employee Management:** API endpoints for adding, retrieving, updating, and deleting employees under a company.
* **Call Record Management:** API endpoints for adding new call records and retrieving existing ones with filtering.
* **Call Analytics:** API endpoints to provide statistical insights (total calls, duration, conflict percentage) based on filtered call records.
* **Recording Serving:** Securely serves stored audio recordings (for admins).


### Authentication and Authorization

The server uses JSON Web Tokens (JWT) for authentication.

1.  A user (admin or employee) logs in via the `/login` endpoint with their username and password.
2.  If credentials are valid, the server generates a JWT containing user information (username, user type, company ID, employee ID if applicable) and an expiration timestamp.
3.  The token is returned to the client.
4.  For subsequent requests to protected endpoints, the client must include the JWT in the `Authorization: Bearer <token>` header.

### API Endpoints

The server exposes the following API endpoints:

| Endpoint                                   | Method | Description                                                                                                | Authentication      | Authorization                                     |
| :----------------------------------------- | :----- | :--------------------------------------------------------------------------------------------------------- | :------------------ | :------------------------------------------------ |
| `/login`                                   | `POST` | Authenticates a user and returns a JWT.                                                                    | None                | None (Consider restricting this in production)    |
| `/validate_auth_token`                     | `GET`, `POST` | Validates an existing JWT.                                                                                 | Token Required      | Any authenticated user                            |
| `/users`                                   | `POST` | Creates a new user.                                                                                        | None                | None (Consider restricting this in production)    |
| `/users/<username>`                        | `GET`  | Retrieves basic information for a user.                                                                    | None                | None (Consider restricting this in production)    |
| `/companies`                               | `POST` | Creates a new company and its initial admin user.                                                          | None                | None (Consider restricting this in production)    |
| `/companies/admin/<admin_username>`        | `GET`  | Retrieves company details associated with a specific admin user.                                           | Token Required      | Admin only, must match the admin's own username |
| `/companies/<int:company_id>/employees`    | `POST` | Adds a new employee to a specific company.                                                                 | Token Required      | Admin only, must be admin of the specified company |
| `/companies/<int:company_id>/employees`    | `GET`  | Retrieves all employees belonging to a specific company.                                                 | Token Required      | Admin only, must be admin of the specified company |
| `/employees/<int:employee_id>`             | `PUT`  | Updates details for a specific employee.                                                                 | Token Required      | Admin only, must be admin of the employee's company |
| `/employees/<int:employee_id>`             | `DELETE` | Deletes a specific employee.                                                                               | Token Required      | Admin only, must be admin of the employee's company |
| `/employees/<int:employee_id>/call_records`| `POST` | Uploads a call recording for a specific employee, processes it, and saves the record.                      | Token Required      | Employee only, must match the employee's own ID    |
| `/companies/<int:company_id>/call_records` | `GET`  | Retrieves call records for a company, with optional time range and employee filters.                       | Token Required      | Admin only, must be admin of the specified company |
| `/companies/<int:company_id>/call_records/stats` | `GET`  | Retrieves statistics (total calls, duration, conflict %) for a company, with optional time range/employee filters. | Token Required      | Admin only, must be admin of the specified company |
| `/recordings/<path:filename>`              | `GET`  | Serves a specific call recording audio file.                                                               | Token Required      | Admin only                                        |


## Planned Components

### Dashboard

The `Dashboard/` directory is planned to contain the administrative web interface. This frontend application will interact with the Server backend API to:

* Allow admins to log in.
* Visualize call record statistics and trends.
* Review specific call records, including transcriptions and conflict status.
* Manage employees (add, edit, delete).
* Manage company settings (subscription details - future feature).

### Android App

The `Android/` directory is planned to contain the mobile application for call center employees. This app will facilitate:

* Employee login (interacting with the server's `/login`).
* Recording customer calls.
* Uploading recorded audio files to the server's call record endpoint (`/employees/<int:employee_id>/call_records`) along with relevant metadata (like timestamp).

## How It Works (Workflow)

Here's a typical flow for a call record being processed:

1.  **Employee Recording:** An employee uses the Android app (planned) to record a customer call.
2.  **Upload:** After the call, the Android app uploads the audio file to the `/employees/<int:employee_id>/call_records` endpoint on the server. The request includes the audio file and the call timestamp.
3.  **Server Receives:** The `main.py` endpoint receives the request. It validates the employee's token and ensures the employee ID in the path matches the token's payload.
4.  **File Handling:** The server saves the uploaded audio file to the configured `RECORDINGS_DIR` with a unique filename. If the file is M4A, it's converted to WAV format. The path to the final audio file is stored.
5.  **Duration Calculation:** The duration of the audio file is calculated.
6.  **Transcription:** The audio file is sent to the `SpeechToTextService` for transcription. The resulting text, or an error code if transcription fails, is noted.
7.  **Conflict Detection:** If transcription was successful, the transcribed text is sent to the `ConflictDetector`. The detector translates the text (if needed) and analyzes its sentiment. A boolean value indicating conflict detection is returned.
8.  **Database Storage:** A new record is created in the `call_records` table in `database.sqlite`. This record includes the employee ID, call timestamp, duration, transcription text (if available), a flag indicating if conflict was detected (if available), and the path to the saved audio file.
9.  **Response:** The server returns a success response to the Android app, including details like the saved file path, duration, transcription, and conflict status.
10. **Admin Review:** An administrator logs into the Dashboard (planned). The Dashboard fetches data from the server's API endpoints (e.g., `/companies/<int:company_id>/call_records` or `/companies/<int:company_id>/call_records/stats`) using their admin token.
11. **Analysis and Action:** The Dashboard displays statistics and lists call records. The admin can filter records, view transcriptions, listen to recordings (via the `/recordings/<path:filename>` endpoint), and take appropriate action based on detected conflicts.

## Setup and Installation

Follow these steps to set up and run the server backend:

### Prerequisites

* **Python version:** check out `.python-version`
* **pip:** Python package installer (comes with Python).
* **ffmpeg:** Required by `pydub` for audio conversion. Install it via your system's package manager (e.g., `sudo apt-get install ffmpeg` on Ubuntu, `brew install ffmpeg` on macOS).
* **Azure Account:** If you want to enable speech-to-text, you will need an Azure account and a Speech service resource to obtain an API key.

### Cloning the Repository

```bash
git clone https://github.com/PedroAyon/CallConflictDetectionSaaS.git
cd CallConflictDetectionSaaS/Server
````

### Setting up the Environment

It's recommended to use a virtual environment to manage dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Database Initialization

Automatically Done

### Configuration (.env)

Create a `.env` file in the `Server` directory to configure the application. Copy the contents of `.env.example` (if provided, otherwise create it manually) and fill in the values.

```dotenv
# .env file in the Server directory

# Path to the SQLite database file
DATABASE_PATH=database.sqlite

# Path to the SQL schema file
SCHEMA_PATH=db/schema.sql

# Directory to store call recordings
RECORDINGS_DIR=recordings

# Azure Speech Service Credentials (Optional - Required for Speech-to-Text)
AZURE_SPEECH_API_KEY=YOUR_AZURE_SPEECH_API_KEY
AZURE_SERVICE_REGION=YOUR_AZURE_SERVICE_REGION
SPEECH_LANG=en-US # Language for speech recognition (e.g., en-US, es-ES)

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-and-long-key-please-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=30

# Flask Debug Mode (set to "true" for development, "false" for production)
FLASK_DEBUG=false

# Server Port
PORT=5000
```

**Important:**

  * Replace placeholder values like `YOUR_AZURE_SPEECH_API_KEY` and `YOUR_AZURE_SERVICE_REGION`. If you don't provide these, speech-to-text and thus conflict detection will be disabled.
  * Change `JWT_SECRET_KEY` to a strong, random, and long string for production.
  * Set `FLASK_DEBUG` to `false` in production.

### Running the Server

Make sure your virtual environment is active and the `.env` file is configured.

```bash
python main.py
```

The server should start, listening on the port specified in your `.env` (default: 5000).

## Testing

The project includes unit and integration tests using `pytest`.

1.  Ensure you have installed the development dependencies (included in `requirements.txt`).

2.  Configure a separate test database path in your `.env` or use the default if it's acceptable for testing.

3.  Run pytest from the `Server/` directory:

    ```bash
    pytest
    ```

    This will discover and run all tests in the `test/` directory.

## Technologies Used

  * **Python:** The core programming language.
  * **Flask:** Micro web framework for the server API.
  * **SQLite:** Lightweight database for data storage.
  * **Hugging Face `transformers`:** Used for natural language processing tasks (translation and sentiment analysis).
  * **Azure Cognitive Services Speech SDK:** For integrating with Azure's Speech-to-Text service.


## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/PedroAyon/CallConflictDetectionSaaS/blob/main/LICENSE) file for details.