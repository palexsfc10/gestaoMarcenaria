from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class Company(Base):
    __tablename__ = "company"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    document = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    responsible = Column(String, nullable=True)
    pix = Column(String, nullable=True)
    default_notes = Column(Text, nullable=True)


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)

    budgets = relationship("Budget", back_populates="client")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    environment = Column(String, nullable=True)
    delivery_time = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    validity = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    discount = Column(Float, default=0)
    extra_cost = Column(Float, default=0)
    total = Column(Float, default=0)
    status = Column(String, default="rascunho")

    client = relationship("Client", back_populates="budgets")
    items = relationship("BudgetItem", back_populates="budget", cascade="all, delete-orphan")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"))
    description = Column(String, nullable=False)
    quantity = Column(Float, default=1)
    unit_price = Column(Float, default=0)
    subtotal = Column(Float, default=0)

    budget = relationship("Budget", back_populates="items")