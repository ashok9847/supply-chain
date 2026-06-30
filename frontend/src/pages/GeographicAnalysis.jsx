import { useEffect, useState } from "react";
import api from "../services/api";
import { Loading, CustomTooltip, fmt } from "../components/Utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#f97316", "#14b8a6", "#a855f7"];

export default function GeographicAnalysis() {
  const [regions, setRegions] = useState([]);
  const [segments, setSegments] = useState([]);
  const [filters, setFilters] = useState({ month: "", shipping_mode: "" });
  const [meta, setMeta] = useState({ months: [], shipping_modes: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = (f) => {
    const p = new URLSearchParams();
    if (f.month) p.append("month", f.month);
    if (f.shipping_mode) p.append("shipping_mode", f.shipping_mode);
    const q = p.toString() ? "?" + p : "";
    setLoading(true);
    Promise.all([
      api.get("/region-sales" + q),
      api.get("/customer-segments" + q),
    ]).then(([r, s]) => {
      setRegions(r.data);
      setSegments(s.data);
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
    const f = { month: "", shipping_mode: "" };
    setFilters(f);
    fetchData(f);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Geographic Analysis</div>
          <div className="page-subtitle">Revenue by region and customer segment</div>
        </div>
      </div>

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
        <button className="btn-reset" onClick={reset}>✕ Reset</button>
      </div>

      {loading ? <Loading /> : (
        <>
          {/* Region Bar Chart (top 10) */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <h3>🌍 Revenue by Order Region (Top 10)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={regions.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
                <YAxis type="category" dataKey="Order Region" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip content={<CustomTooltip formatter={fmt} />} />
                <Bar dataKey="sales" name="Sales" radius={[0, 4, 4, 0]}>
                  {regions.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-grid two-col">
            {/* Segment Pie */}
            <div className="chart-card">
              <h3>👥 Sales by Customer Segment</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={segments} dataKey="sales" nameKey="Customer Segment" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {segments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v)} />
                  <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Region Table */}
            <div className="chart-card">
              <h3>📋 All Regions Summary</h3>
              <div style={{ overflowY: "auto", maxHeight: 260 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Sales</th>
                      <th>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r, i) => (
                      <tr key={i}>
                        <td>{r["Order Region"]}</td>
                        <td style={{ color: "#3b82f6", fontWeight: 600 }}>{fmt(r.sales)}</td>
                        <td>{r.orders.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Segment details */}
          <div className="chart-card" style={{ marginTop: 20 }}>
            <h3>👥 Customer Segment Details</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Total Sales</th>
                  <th>Total Orders</th>
                  <th>Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s, i) => (
                  <tr key={i}>
                    <td><span className="badge blue">{s["Customer Segment"]}</span></td>
                    <td style={{ color: "#3b82f6", fontWeight: 600 }}>{fmt(s.sales)}</td>
                    <td>{s.orders.toLocaleString()}</td>
                    <td style={{ color: s.profit >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>{fmt(s.profit)}</td>
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
