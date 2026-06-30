import { useEffect, useState } from "react";
import api from "../services/api";
import { Loading, CustomTooltip } from "../components/Utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

export default function DeliveryAnalysis() {
  const [shipping, setShipping] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [profitability, setProfitability] = useState([]);
  const [filters, setFilters] = useState({ month: "", segment: "", region: "" });
  const [meta, setMeta] = useState({ months: [], segments: [], regions: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = (f) => {
    const p = new URLSearchParams();
    if (f.month) p.append("month", f.month);
    if (f.segment) p.append("segment", f.segment);
    if (f.region) p.append("region", f.region);
    const q = p.toString() ? "?" + p : "";

    const pd = new URLSearchParams();
    if (f.month) pd.append("month", f.month);
    if (f.segment) pd.append("segment", f.segment);
    const qd = pd.toString() ? "?" + pd : "";

    setLoading(true);
    Promise.all([
      api.get("/shipping-performance" + q),
      api.get("/delivery-status" + q),
      api.get("/profitability" + qd),
    ]).then(([s, d, pr]) => {
      setShipping(s.data);
      setDelivery(d.data);
      setProfitability(pr.data);
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
    const f = { month: "", segment: "", region: "" };
    setFilters(f);
    fetchData(f);
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Delivery Analysis</div>
          <div className="page-subtitle">Shipping performance, late deliveries & profitability</div>
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
          <div className="chart-grid two-col">
            {/* Delivery Status Pie */}
            <div className="chart-card">
              <h3>📦 Delivery Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={delivery} dataKey="count" nameKey="Delivery Status" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {delivery.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => v.toLocaleString() + " orders"} />
                  <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Shipping Mode Bar */}
            <div className="chart-card">
              <h3>🚚 Avg Shipping Days by Mode</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={shipping}>
                  <XAxis dataKey="Shipping Mode" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg_shipping_days" name="Avg Ship Days" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Late Rate per Shipping Mode */}
          <div className="chart-card" style={{ marginTop: 20 }}>
            <h3>⚠️ Late Delivery Rate by Shipping Mode</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shipping}>
                <XAxis dataKey="Shipping Mode" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v + "%"} />
                <Tooltip formatter={v => v + "%"} />
                <Bar dataKey="late_rate" name="Late Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Profitability Table */}
          <div className="chart-card" style={{ marginTop: 20 }}>
            <h3>💹 Profitability by Category (Top 10)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Total Profit</th>
                  <th>Avg Profit Ratio</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profitability.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: "#94a3b8" }}>{i + 1}</td>
                    <td>{p["Category Name"]}</td>
                    <td style={{ color: p.total_profit >= 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                      ${p.total_profit.toLocaleString()}
                    </td>
                    <td>{p.avg_profit_ratio}%</td>
                    <td>
                      <span className={`badge ${p.total_profit >= 0 ? "green" : "red"}`}>
                        {p.total_profit >= 0 ? "Profit" : "Loss"}
                      </span>
                    </td>
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
