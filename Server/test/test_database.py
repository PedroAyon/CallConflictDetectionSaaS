import pytest
from datetime import datetime, timedelta

def test_add_and_get_user(clean_db):
    db = clean_db
    db.add_user("john", "doe123")
    user = db.get_user("john")
    assert user == {"username":"john", "password":"doe123"}

def test_add_company_and_lookup(clean_db):
    db = clean_db
    db.add_company("Acme", "2099-12-31", "alice", "alicepwd")
    company = db.get_company_by_admin("alice")
    assert company["company_name"] == "Acme"
    assert company["admin_username"] == "alice"

def test_employee_lifecycle(clean_db):
    db = clean_db
    # prepare an admin & company
    db.add_company("XCorp", "2099-01-01", "bob", "bobpwd")
    comp = db.get_company_by_admin("bob")
    cid = comp["company_id"]

    # add employee
    db.add_employee(cid, "emp1", "pw1", "First", "Last", "M", "1990-01-01")
    emps = db.get_employees_by_company(cid)
    assert len(emps) == 1
    eid = emps[0]["employee_id"]

    # update
    db.update_employee(eid, "empX", "newpw", "F", "L", "F", "1991-02-02")
    updated = db.get_employees_by_company(cid)[0]
    assert updated["username"] == "empX"
    assert updated["first_name"] == "F"

    # delete
    db.delete_employee(eid)
    assert db.get_employees_by_company(cid) == []

def test_call_record_filters(clean_db):
    db = clean_db
    # setup company & employee
    db.add_company("Zeta", "2099-06-30", "carol", "cpwd")
    cid = db.get_company_by_admin("carol")["company_id"]
    db.add_employee(cid, "agent9", "pass9", "A", "G", None, None)
    eid = db.get_employees_by_company(cid)[0]["employee_id"]

    base = datetime(2025,5,1,8,0,0)
    # insert calls at different times
    for i in range(3):
        ts = (base + timedelta(hours=i)).strftime("%Y-%m-%d %H:%M:%S")
        db.add_call_record(eid, ts, duration=60, transcription=None, audio_path=f"f{i}.wav", conflict=None)

    # filter window: skip the last
    start = base.strftime("%Y-%m-%d %H:%M:%S")
    end   = (base + timedelta(hours=1, minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
    recs = db.get_call_records(cid, start, end)
    assert len(recs) == 2

    # metrics
    assert db.count_calls(recs) == 2
    assert db.sum_call_durations(recs) == 120
    assert db.calculate_conflict_percentage(recs) == 0.0
