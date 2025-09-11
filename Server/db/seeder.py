from db.database import Database


def seed_data(db: Database):
    """
    Seeds the database with initial users, companies, and employees.
    """

    # 1. Create admin users
    admins = [
        {"username": "admin", "password": "123"},
        {"username": "admin2", "password": "123"}
    ]
    for admin in admins:
        try:
            db.add_user(admin["username"], admin["password"])
            print(f"Added user: {admin['username']}")
        except Exception as e:
            print(f"Error adding user {admin['username']}: {e}")

    # 2. Create companies and track their IDs by admin_username
    companies = [
        {"name": "PC Components", "expiration": "2025-12-31", "admin_username": "admin", "admin_password": "123"},
        {"name": "BetaSolutions", "expiration": "2026-06-30", "admin_username": "admin2", "admin_password": "123"}
    ]
    company_ids = {}
    for comp in companies:
        try:
            db.add_company(
                name=comp["name"],
                expiration=comp["expiration"],
                admin_username=comp["admin_username"],
                admin_password=comp["admin_password"]
            )
            company = db.get_company_by_admin(comp["admin_username"])
            if company and "company_id" in company:
                company_ids[comp["admin_username"]] = company["company_id"]
                print(f"Added company: {comp['name']} (ID: {company['company_id']})")
            else:
                print(f"Company created but not found: {comp['name']}")
        except Exception as e:
            print(f"Error adding company {comp['name']}: {e}")

    # 3. Create employees for each company
    employees = [
        {"admin_username": "admin", "username": "bob",   "password": "passbob",   "first_name": "Bob",   "last_name": "Smith",   "gender": "M", "birthdate": "1990-05-15"},
        {"admin_username": "admin2","username": "alice", "password": "passalice", "first_name": "Alice", "last_name": "Johnson", "gender": "F", "birthdate": "1988-11-22"}
    ]
    for emp in employees:
        admin_user = emp["admin_username"]
        company_id = company_ids.get(admin_user)
        if not company_id:
            print(f"Skipping employee {emp['username']}: company for admin {admin_user} not found.")
            continue
        try:
            db.add_user(emp["username"], emp["password"])
            db.add_employee(
                company_id=company_id,
                username=emp["username"],
                password=emp["password"],
                first_name=emp["first_name"],
                last_name=emp["last_name"],
                gender=emp.get("gender"),
                birthdate=emp.get("birthdate")
            )
            print(f"Added employee: {emp['first_name']} {emp['last_name']} to company ID {company_id}")
        except Exception as e:
            print(f"Error adding employee {emp['username']}: {e}")


if __name__ == "__main__":
    database = Database()
    seed_data(database)
    print("Database seeding completed.")
