# Blockradar Intelligence

> Wallet analytics, churn prediction, and retention insights for Blockradar's fintech customers.

Built as a full-stack data solution: a FastAPI backend, PostgreSQL data store, scikit-learn churn model, and a React dashboard — all wired together with Docker.

---

## Stack

| Layer | Technology |
|---|---|
| Data Ingestion | Python + Blockradar REST API |
| Database | PostgreSQL + SQLAlchemy |
| ML Pipeline | scikit-learn (Gradient Boosting) |
| Backend API | FastAPI |
| Frontend | React + Recharts |
| Infra | Docker + docker-compose |

---

## Project Structure

blockradar-intelligence/
├── backend/        # FastAPI — analytics + churn API
├── frontend/       # React dashboard
├── pipeline/       # Data ingestion + ML training scripts
├── .env.example    # Environment variable template
└── docker-compose.yml

---

## Getting Started

### 1. Clone & configure environment
```bash
git clone <your-repo-url>
cd blockradar-intelligence
cp .env.example .env
# Fill in your values in .env
```

### 2. Set up Python backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 3. Run the pipeline (simulated mode)
```bash
cd pipeline
python simulate.py           # generates data
python train.py              # trains churn model
```

### 4. Start the backend
```bash
cd backend
uvicorn app.main:app --reload
# API docs at http://localhost:8000/docs
```

### 5. Start the frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:5173
```

### 6. Full stack with Docker (once installed)
```bash
docker-compose up --build
```

---

## Switching to Real Data

1. Get your API key from [dashboard.blockradar.co](https://dashboard.blockradar.co)
2. Set `BLOCKRADAR_API_KEY` and `BLOCKRADAR_WALLET_ID` in `.env`
3. Set `DATA_MODE=real` in `.env`
4. Run `python pipeline/ingest.py`

---

## Key Features

- **Churn Risk Scoring** — every fintech scored Low / Medium / High
- **Wallet Dormancy Tracking** — activation rates per region and fintech
- **Transaction Volume Trends** — 18-month regional breakdown
- **Regional Performance** — Africa, LatAm, Middle East, Southeast Asia
- **Live Dashboard** — React frontend pulling from FastAPI in real time