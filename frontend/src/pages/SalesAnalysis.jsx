import { useEffect, useState } from "react";
import api from "../services/api";
import { Loading, CustomTooltip, fmt } from "../components/Utils";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export default function SalesAnalysis() {
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ month: "", shipping_mode: "", segment: "", region: "" });
  const [meta, setMeta] = useState({ months: [], shipping_modes: [], segments: [], regions: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = (f) => {
    const p = new URLSearchParams();
    if (f.shipping_mode) p.append("shipping_mode", f.shipping_mode);
    if (f.segment) p.append("segment", f.segment);
    if (f.region) p.append("region", f.region);
    const q = p.toString() ? "?" + p : "";

    const pMonth = new URLSearchParams(p);
    if (f.month) pMonth.append("month", f.month);
    const qm = pMonth.toString() ? "?" + pMonth : "";

    setLoading(true);
    Promise.all([
      api.get("/monthly-sales" + q),
      api.get("/category-sales" + qm),
      api.get("/department-sales" + qm),
      api.get("/top-products" + qm),
    ]).then(([m, c, d, pr]) => {
      setMonthly(m.data);
      setCategories(c.data);
      setDepartments(d.data);
      setProducts(pr.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get("/filters-meta").then(r => setMeta(r.data));
    fetchData(filters);
  }, []);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchData(next);
  };

  const reset = () => {
    const f = { month: "", shipping_mode: "", segment: "", region: "" };
    setFilters(f);
    fetchData(f);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Sales Analysis</div>
          <div className="page-subtitle">Revenue trends, categories and products</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Month</label>
          <select value={filters.month} onChange={e => handleFilter("month", e.target.value)}>
            <option value="">All Months</option>
            {meta.months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Shipping Mode</label>
          <select value={filters.shipping_mode} onChange={e => handleFilter("shipping_mode", e.target.value)}>
            <option value="">All Modes</option>
            {meta.shipping_modes.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Segment</label>
          <select value={filters.segment} onChange={e => handleFilter("segment", e.target.value)}>
            <option value="">All Segments</option>
            {meta.segments.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Region</label>
          <select value={filters.region} onChange={e => handleFilter("region", e.target.value)}>
            <option value="">All Regions</option>
            {meta.regions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button className="btn-reset" onClick={reset}>✕ Reset</button>
      </div>

      {loading ? <Loading /> : (
        <>
          {/* Monthly Area Chart */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <h3>📅 Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month_name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
                <Tooltip content={<CustomTooltip formatter={fmt} />} />
                <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} fill="url(#grad1)" name="Sales" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-grid two-col">
            {/* Category Bar */}
            <div className="chart-card">
              <h3>🏷️ Top 10 Categories</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categories} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
                  <YAxis type="category" dataKey="Category Name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip content={<CustomTooltip formatter={fmt} />} />
                  <Bar dataKey="Sales" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Bar */}
            <div className="chart-card">
              <h3>🏢 Sales by Department</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departments} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
                  <YAxis type="category" dataKey="Department Name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip formatter={fmt} />} />
                  <Bar dataKey="Sales" fill="#10b981" radius={[0, 4, 4, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="chart-card" style={{ marginTop: 20 }}>
            <h3>🏆 Top 10 Products</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Sales</th>
                  <th>Orders</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                    <td>{p["Product Name"]}</td>
                    <td style={{ color: "#3b82f6", fontWeight: 600 }}>{fmt(p.sales)}</td>
                    <td>{p.orders.toLocaleString()}</td>
                    <td style={{ color: p.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>{fmt(p.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
