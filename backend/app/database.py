import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String)
    complaint_date = Column(String)
    customer_name = Column(String)
    product_name = Column(String)
    batch_number = Column(String)
    manufacturing_date = Column(String)
    complaint_description = Column(Text)
    complaint_category = Column(String)
    severity = Column(String)
    country = Column(String)
    received_through = Column(String)
    remarks = Column(Text)
    summary = Column(Text)
    risk_level = Column(String)
    risk_reason = Column(Text)


Base.metadata.create_all(bind=engine)


class ComplaintStore:

    def create(self, complaint: dict):

        db = SessionLocal()

        record = Complaint(**complaint)

        db.add(record)

        db.commit()

        db.refresh(record)

        db.close()

        return {"id": record.id}

    def get(self, complaint_id: str):

        db = SessionLocal()

        complaint = db.query(Complaint).filter(Complaint.id == int(complaint_id)).first()

        db.close()

        if complaint is None:
            return None

        return complaint.__dict__

    def get_all(self):
        

        db = SessionLocal()

        complaints = db.query(Complaint).all()

        data = []

        for c in complaints:
            data.append({
                "id": c.id,
                "customer_name": c.customer_name,
                "product_name": c.product_name,
                "severity": c.severity,
                "country": c.country,
                "complaint_number": c.complaint_number
            })
            

        db.close()

        return data
    def delete(self, complaint_id: int):
        db = SessionLocal()

        complaint = db.query(Complaint).filter(
            Complaint.id == complaint_id
        ).first()

        if complaint is None:
            db.close()
            return False

        db.delete(complaint)
        db.commit()
        db.close()

        return True
    def update(self, complaint_id: int, complaint: dict):
        db = SessionLocal()

        record = db.query(Complaint).filter(
        Complaint.id == complaint_id
        ).first()

        if record is None:
            db.close()
            return None

        for key, value in complaint.items():
            if hasattr(record, key):
                setattr(record, key, value)

        db.commit()
        db.refresh(record)
        db.close()

        return {"message": "Complaint updated successfully"}