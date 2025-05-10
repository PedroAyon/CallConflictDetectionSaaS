import pytest
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash

def test_add_and_get_user(clean_db):
    db = clean_db
    username = "john"
    password = "doe123"
    db.add_user(username, password)
    user = db.get_user(username)
    assert user == {"username": username}

def test_add_company_and_lookup(clean_db):
    db = clean_db
    company_name = "Acme"
    subscription_expiration = "2099-12-31"
    admin_username = "alice"
    admin_password = "alicepwd"
    db.add_company(company_name, subscription_expiration, admin_username, admin_password)
    company = db.get_company_by_admin(admin_username)
    assert company["company_name"] == company_name
    assert company["admin_username"] == admin_username

def test_employee_lifecycle(clean_db):
    db = clean_db
    # prepare an admin & company
    admin_username = "bob"
    admin_password = "bobpwd"
    company_name = "XCorp"
    subscription_expiration = "2099-01-01"
    db.add_company(company_name, subscription_expiration, admin_username, admin_password)
    comp = db.get_company_by_admin(admin_username)
    cid = comp["company_id"]

    # add employee
    employee_username = "emp1"
    employee_password = "pw1"
    first_name = "First"
    last_name = "Last"
    gender = "M"
    birthdate = "1990-01-01"
    db.add_employee(cid, employee_username, employee_password, first_name, last_name, gender, birthdate)
    emps = db.get_employees_by_company(cid)
    assert len(emps) == 1
    eid = emps[0]["employee_id"]

    # update
    new_username = "empX"
    new_password = "newpw"
    new_first_name = "F"
    new_last_name = "L"
    new_gender = "F"
    new_birthdate = "1991-02-02"
    db.update_employee(eid, new_username, new_password, new_first_name, new_last_name, new_gender, new_birthdate)
    updated = db.get_employees_by_company(cid)[0]
    assert updated["username"] == new_username
    assert updated["first_name"] == new_first_name

    # delete
    db.delete_employee(eid)
    assert db.get_employees_by_company(cid) == []

def test_call_record_filters(clean_db):
    db = clean_db
    # setup company & employee
    admin_username = "carol"
    admin_password = "cpwd"
    company_name = "Zeta"
    subscription_expiration = "2099-06-30"
    db.add_company(company_name, subscription_expiration, admin_username, admin_password)
    cid = db.get_company_by_admin(admin_username)["company_id"]
    employee_username = "agent9"
    employee_password = "pass9"
    first_name = "A"
    last_name = "G"
    db.add_employee(cid, employee_username, employee_password, first_name, last_name, None, None)
    eid = db.get_employees_by_company(cid)[0]["employee_id"]

    base = datetime(2025, 5, 1, 8, 0, 0)
    # insert calls at different times
    for i in range(3):
        ts = (base + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
        db.add_call_record(eid, ts, duration=60, transcription=None, audio_path=f"f{i}.wav", conflict=None)

    # filter window: skip the last
    start = base.strftime("%Y-%m-%d %H:%M:%S")
    end = (base + timedelta(hours=1, minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
    recs = db.get_call_records(cid, start, end)
    assert len(recs) == 2

    # metrics
    assert db.count_calls(recs) == 2
    assert db.sum_call_durations(recs) == 120
    assert db.calculate_conflict_percentage(recs) == 0.0
