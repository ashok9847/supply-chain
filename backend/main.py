from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import Optional

app = FastAPI(title="Supply Chain Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load CSV once on startup
df = pd.read_csv("data/cleaned_data.csv")

MONTH_NAMES = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
    5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
    9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
}

def apply_filters(
    data: pd.DataFrame,
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
    department: Optional[str] = None,
) -> pd.DataFrame:
    if month:
        data = data[data["order_month"] == month]
    if shipping_mode:
        data = data[data["Shipping Mode"] == shipping_mode]
    if segment:
        data = data[data["Customer Segment"] == segment]
    if region:
        data = data[data["Order Region"] == region]
    if department:
        data = data[data["Department Name"] == department]
    return data


@app.get("/")
def root():
    return {"message": "Supply Chain Dashboard API is running"}


@app.get("/kpis")
def get_kpis(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, segment, region)
    avg_shipping_days = round(float(data["Days for shipping (real)"].mean()), 2)
    return {
        "total_sales": round(float(data["Sales"].sum()), 2),
        "total_orders": int(data.shape[0]),
        "total_profit": round(float(data["Order Profit Per Order"].sum()), 2),
        "late_delivery_rate": round(float(data["Late_delivery_risk"].mean()) * 100, 2),
        "avg_shipping_days": avg_shipping_days,
        "avg_profit_ratio": round(float(data["Order Item Profit Ratio"].mean()) * 100, 2),
    }


@app.get("/monthly-sales")
def monthly_sales(
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, None, shipping_mode, segment, region)
    result = (
        data.groupby("order_month")["Sales"]
        .sum()
        .reset_index()
        .sort_values("order_month")
    )
    result["month_name"] = result["order_month"].map(MONTH_NAMES)
    result["Sales"] = result["Sales"].round(2)
    return result.to_dict(orient="records")


@app.get("/category-sales")
def category_sales(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, segment, region)
    result = (
        data.groupby("Category Name")["Sales"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
        .reset_index()
    )
    result["Sales"] = result["Sales"].round(2)
    return result.to_dict(orient="records")


@app.get("/department-sales")
def department_sales(
    month: Optional[int] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, None, segment, region)
    result = (
        data.groupby("Department Name")["Sales"]
        .sum()
        .sort_values(ascending=False)
        .reset_index()
    )
    result["Sales"] = result["Sales"].round(2)
    return result.to_dict(orient="records")


@app.get("/shipping-performance")
def shipping_performance(
    month: Optional[int] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, None, segment, region)
    result = (
        data.groupby("Shipping Mode")
        .agg(
            avg_processing_time=("Order Processing Time", "mean"),
            avg_shipping_days=("Days for shipping (real)", "mean"),
            total_orders=("Sales", "count"),
            late_rate=("Late_delivery_risk", "mean"),
        )
        .reset_index()
    )
    result["avg_processing_time"] = result["avg_processing_time"].round(2)
    result["avg_shipping_days"] = result["avg_shipping_days"].round(2)
    result["late_rate"] = (result["late_rate"] * 100).round(2)
    return result.to_dict(orient="records")


@app.get("/delivery-status")
def delivery_status(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, segment, region)
    result = (
        data.groupby("Delivery Status")["Sales"]
        .count()
        .reset_index()
        .rename(columns={"Sales": "count"})
    )
    return result.to_dict(orient="records")


@app.get("/region-sales")
def region_sales(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, segment)
    result = (
        data.groupby("Order Region")
        .agg(sales=("Sales", "sum"), orders=("Sales", "count"))
        .sort_values("sales", ascending=False)
        .reset_index()
    )
    result["sales"] = result["sales"].round(2)
    return result.to_dict(orient="records")


@app.get("/customer-segments")
def customer_segments(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    region: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, None, region)
    result = (
        data.groupby("Customer Segment")
        .agg(sales=("Sales", "sum"), orders=("Sales", "count"), profit=("Order Profit Per Order", "sum"))
        .reset_index()
    )
    result["sales"] = result["sales"].round(2)
    result["profit"] = result["profit"].round(2)
    return result.to_dict(orient="records")


@app.get("/top-products")
def top_products(
    month: Optional[int] = None,
    region: Optional[str] = None,
    segment: Optional[str] = None,
):
    data = apply_filters(df, month, None, segment, region)
    result = (
        data.groupby("Product Name")
        .agg(sales=("Sales", "sum"), orders=("Sales", "count"), profit=("Order Profit Per Order", "sum"))
        .sort_values("sales", ascending=False)
        .head(10)
        .reset_index()
    )
    result["sales"] = result["sales"].round(2)
    result["profit"] = result["profit"].round(2)
    return result.to_dict(orient="records")


@app.get("/profitability")
def profitability(
    month: Optional[int] = None,
    shipping_mode: Optional[str] = None,
    segment: Optional[str] = None,
):
    data = apply_filters(df, month, shipping_mode, segment)
    result = (
        data.groupby("Category Name")
        .agg(
            total_profit=("Order Profit Per Order", "sum"),
            avg_profit_ratio=("Order Item Profit Ratio", "mean"),
        )
        .sort_values("total_profit", ascending=False)
        .head(10)
        .reset_index()
    )
    result["total_profit"] = result["total_profit"].round(2)
    result["avg_profit_ratio"] = (result["avg_profit_ratio"] * 100).round(2)
    return result.to_dict(orient="records")


@app.get("/filters-meta")
def filters_meta():
    """Returns all unique filter values for dropdowns"""
    return {
        "months": [{"value": k, "label": v} for k, v in MONTH_NAMES.items()],
        "shipping_modes": sorted(df["Shipping Mode"].dropna().unique().tolist()),
        "segments": sorted(df["Customer Segment"].dropna().unique().tolist()),
        "regions": sorted(df["Order Region"].dropna().unique().tolist()),
        "departments": sorted(df["Department Name"].dropna().unique().tolist()),
    }
