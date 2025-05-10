from database import Database


def seed_data(db: Database):
    """
    Seeds the database with initial users, companies, and employees.
    """

    # Admin users (username, password)
    users = [
        ("admin", "123"),
        ("admin2", "123")
    ]
    for username, password in users:
        try:
            db.add_user(username=username, password=password)
            print(f"Added user: {username}")
        except Exception as e:
            print(f"Error adding user {username}: {e}")

    # Add companies (name, subscription_expiration, admin_username)
    companies = [
        ("AcmeCorp", "2025-12-31", "admin"),
        ("BetaSolutions", "2026-06-30", "admin2")
    ]
    for name, expiration, admin in companies:
        try:
            db.add_company(name=name, expiration=expiration, admin_username=admin)
            print(f"Added company: {name}")
        except Exception as e:
            print(f"Error adding company {name}: {e}")

    # Add employees (company_id, user_username, first_name, last_name, gender, birthdate)
    employees = [
        (1, "bob", "123","Bob", "Smith", "M", "1990-05-15"),
        (2, "alice", "123", "Robert", "Johnson", "M", "1988-11-22")
    ]
    for company_id, username, password, first_name, last_name, gender, birthdate in employees:
        try:
            db.add_employee(
                company_id=company_id,
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                birthdate=birthdate
            )
            print(f"Added employee: {first_name} {last_name} to company ID {company_id}")
        except Exception as e:
            print(f"Error adding employee {first_name} {last_name}: {e}")


if __name__ == "__main__":
    database = Database()
    seed_data(database)
    print("Database seeding completed.")
