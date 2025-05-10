from db.database import Database
from db.seeder import seed_data

if __name__ == "__main__":
    database = Database()
    seed_data(database)
    print("Database seeding completed.")
