import requests
import os
import argparse
from datetime import datetime, timezone
from pydub import AudioSegment

# --- Configuration ---
# Base URL of your local server.
BASE_URL = "http://127.0.0.1:5000"
LOGIN_URL = f"{BASE_URL}/login"
API_URL = f"{BASE_URL}/call_records"
TEST_FILENAME = "/home/pedro-ayon/Downloads/test_audio.m4a"


def get_auth_token(username: str, password: str) -> str | None:
    """
    Authenticates with the API to get a JWT token.

    Args:
        username (str): The username for login.
        password (str): The password for login.

    Returns:
        str | None: The JWT token if login is successful, otherwise None.
    """
    print(f"Attempting to log in as user: '{username}'...")
    try:
        response = requests.post(LOGIN_URL, json={"username": username, "password": password})

        if response.status_code == 200:
            token = response.json().get("token")
            if token:
                print("Login successful. Token received.")
                return token
            else:
                print("Error: Login successful, but no token was found in the response.")
                return None
        else:
            print(f"Login failed. Server responded with status code: {response.status_code}")
            print("Response:", response.text)
            return None

    except requests.exceptions.RequestException as e:
        print(f"\nAn error occurred during the login request: {e}")
        print("Please ensure your Flask server is running and accessible.")
        return None



def send_test_request(token: str):
    """
    Creates a test audio file and sends it to the API endpoint.

    Args:
        token (str): The JWT authentication token for the request header.
    """
    call_timestamp = datetime.now(timezone.utc).isoformat()

    # Define the headers, including the authorization token
    headers = {
        "Authorization": f"Bearer {token}"
    }

    payload_data = {"call_timestamp": call_timestamp}

    try:
        # Open the test audio file in binary read mode
        with open(TEST_FILENAME, "rb") as audio_file:
            files = {"audio_file": (TEST_FILENAME, audio_file, "audio/wav")}

            # 3. Send the POST request
            print(f"\nSending POST request to {API_URL}...")
            response = requests.post(API_URL, headers=headers, data=payload_data, files=files)

            # 4. Print the server's response
            print(f"Server responded with status code: {response.status_code}")
            try:
                print("Response JSON:")
                print(response.json())
            except requests.exceptions.JSONDecodeError:
                print("Response content (not JSON):")
                print(response.text)

    except requests.exceptions.RequestException as e:
        print(f"\nAn error occurred during the request: {e}")
        print("Please ensure your Flask server is running and accessible at the specified URL.")


if __name__ == "__main__":
    # Set up command-line argument parsing to accept user credentials
    parser = argparse.ArgumentParser(description="Send a test audio recording to the Call Conflict Detection API.")
    parser.add_argument(
        "--username",
        default="bob",
        help="The username for authentication. Defaults to 'bob'."
    )
    parser.add_argument(
        "--password",
        default="passbob",
        help="The password for authentication. Defaults to 'passbob'."
    )
    args = parser.parse_args()

    # First, get the authentication token
    auth_token = get_auth_token(args.username, args.password)

    # If a token was successfully retrieved, proceed to send the audio file
    if auth_token:
        send_test_request(auth_token)
    else:
        print("\nCould not proceed with sending the audio file due to login failure.")

