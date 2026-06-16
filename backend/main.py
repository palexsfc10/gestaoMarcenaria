from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Company, Client, Budget, BudgetItem
from schemas import LoginRequest, CompanyCreate, ClientCreate, BudgetCreate
from pdf_service import generate_budget_pdf


Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrçaFlow API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "online", "app": "OrçaFlow"}


@app.post("/login")
def login(data: LoginRequest):
    if data.username == "admin" and data.password == "admin123":
        return {"access_token": "demo-token", "token_type": "bearer"}

    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")


@app.get("/company")
def get_company(db: Session = Depends(get_db)):
    return db.query(Company).first()


@app.post("/company/setup")
def setup_company(data: CompanyCreate, db: Session = Depends(get_db)):
    company = db.query(Company).first()

    if company:
        for key, value in data.model_dump().items():
            setattr(company, key, value)
    else:
        company = Company(**data.model_dump())
        db.add(company)

    db.commit()
    db.refresh(company)
    return company


@app.post("/clients")
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@app.get("/clients")
def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()


@app.post("/budgets")
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == data.client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    budget = Budget(
        client_id=data.client_id,
        title=data.title,
        description=data.description,
        environment=data.environment,
        delivery_time=data.delivery_time,
        payment_method=data.payment_method,
        validity=data.validity,
        notes=data.notes,
        discount=data.discount,
        extra_cost=data.extra_cost,
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    subtotal = 0

    for item_data in data.items:
        item_subtotal = item_data.quantity * item_data.unit_price
        subtotal += item_subtotal

        item = BudgetItem(
            budget_id=budget.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            subtotal=item_subtotal
        )
        db.add(item)

    budget.total = subtotal - data.discount + data.extra_cost

    db.commit()
    db.refresh(budget)

    return budget


@app.get("/budgets")
def list_budgets(db: Session = Depends(get_db)):
    return db.query(Budget).all()


@app.get("/budgets/{budget_id}")
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")

    return budget


@app.get("/budgets/{budget_id}/pdf")
def download_budget_pdf(budget_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).first()
    budget = db.query(Budget).filter(Budget.id == budget_id).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado")

    pdf_buffer = generate_budget_pdf(company, budget)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=orcamento-{budget.id}.pdf"
        }
    )