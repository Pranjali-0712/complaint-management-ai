from typing import Optional

from pydantic import BaseModel, Field


class ComplaintPayload(BaseModel):
    complaint_number: str = ""
    complaint_date: str = ""
    customer_name: str = ""
    product_name: str = ""
    batch_number: str = ""
    manufacturing_date: str = ""
    complaint_description: str = ""
    complaint_category: str = ""
    severity: str = ""
    country: str = ""
    received_through: str = ""
    remarks: str = ""
    summary: str = ""
    risk_level: str = ""
    risk_reason: str = ""


class UpdateRequest(BaseModel):
    field: str = Field(..., description="Field to update")
    value: str = Field(..., description="New value")


class ChatRequest(BaseModel):
    message: str
    complaint: Optional[ComplaintPayload] = None


class SubmitRequest(BaseModel):
    complaint: ComplaintPayload
