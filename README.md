# Gestão Marcenaria

Estrutura inicial do projeto com backend em Python (FastAPI) e frontend em React (Vite).

Estrutura criada:

```
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── pdf_service.py
│   └── requirements.txt
├── frontend/
│   └── React-Vite
├── docker-compose.yml
└── README.md
```

Como iniciar (local):

- Backend (dentro de `backend`):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

- Frontend (dentro de `frontend/React-Vite`):

```bash
npm install
npm run dev
```

- Alternativa com Docker Compose:

```bash
docker-compose up
```

Observações:
- Substitua a `SECRET_KEY` em `backend/auth.py` antes de usar em produção.
- Os arquivos fornecem um esqueleto inicial; ajuste conforme a lógica de negócio.
