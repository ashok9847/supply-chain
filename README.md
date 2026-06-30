# ⛓️ Supply Chain Analytics Dashboard

A full-stack analytics dashboard built with **React + FastAPI** to visualize supply chain data.

## 🏗️ Architecture

```
React (Vite)  →  FastAPI  →  cleaned_data.csv (172,765 orders)
```

## 📊 Features

| Page | What You See |
|------|-------------|
| **Dashboard** | KPI cards, monthly trend, delivery status, top categories |
| **Sales Analysis** | Monthly area chart, top 10 categories, departments, products table |
| **Delivery Analysis** | Delivery status pie, shipping mode performance, late rate, profitability |
| **Geographic Analysis** | Revenue by region, customer segment pie, region table |

**Global Filters**: Month · Shipping Mode · Customer Segment · Region

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, React Router DOM, Axios
- **Backend**: FastAPI, Uvicorn, Pandas
- **Data**: DataCo Supply Chain Dataset (172,765 rows, 27 columns)

## 🚀 Running Locally

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API running at http://127.0.0.1:8000
# Docs at http://127.0.0.1:8000/docs
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

## 📁 Project Structure

```
sales-analysis-prj/
├── backend/
│   ├── main.py              # FastAPI app with 10 endpoints
│   ├── requirements.txt
│   └── data/
│       └── cleaned_data.csv
├── frontend/
│   └── src/
│       ├── components/      # Sidebar, KPICard, Utils
│       ├── pages/           # Dashboard, SalesAnalysis, DeliveryAnalysis, GeographicAnalysis
│       └── services/api.js
├── data/                    # Original dataset copy
└── notebooks/               # EDA notebook
```

## 📈 Key Metrics (from dataset)

- **Total Sales**: $35.2M
- **Total Orders**: 172,765
- **Total Profit**: $3.8M
- **Late Delivery Rate**: 57.3%
- **Categories**: 50 | **Regions**: 23

## 🔗 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /kpis` | Total sales, orders, profit, late delivery % |
| `GET /monthly-sales` | Sales per month |
| `GET /category-sales` | Top 10 categories |
| `GET /department-sales` | Sales by department |
| `GET /shipping-performance` | Shipping mode metrics |
| `GET /delivery-status` | On-time vs late counts |
| `GET /region-sales` | Revenue by region |
| `GET /customer-segments` | Sales by segment |
| `GET /top-products` | Top 10 products |
| `GET /profitability` | Profit by category |
