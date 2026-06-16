from pydantic import BaseModel
from typing import Optional, List


class LoginRequest(BaseModel):
    username: str
    password: str


class CompanyCreate(BaseModel):
    name: str
    document: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    responsible: Optional[str] = None
    pix: Optional[str] = None
    default_notes: Optional[str] = None


class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class BudgetItemCreate(BaseModel):
    description: str
    quantity: float
    unit_price: float


class BudgetCreate(BaseModel):
    client_id: int
    title: str
    description: Optional[str] = None
    environment: Optional[str] = None
    delivery_time: Optional[str] = None
    payment_method: Optional[str] = None
    validity: Optional[str] = None
    notes: Optional[str] = None
    discount: float = 0
    extra_cost: float = 0
    items: List[BudgetItemCreate]