import { useEffect, useState } from "react";
import api from "../services/api";
import KPICard from "../components/KPICard";
import { Loading, CustomTooltip, fmt } from "../components/Utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [delivery, setDelivery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/kpis"),
      api.get("/monthly-sales"),
      api.get("/category-sales"),
      api.get("/delivery-status"),
    ]).then(([k, m, c, d]) => {
      setKpis(k.data);
      setMonthly(m.data);
      setCategories(c.data.slice(0, 5));
      setDelivery(d.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-subtitle">Supply chain performance at a glance</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard label="Total Sales" value={fmt(kpis.total_sales)} icon="💵" color="blue" sub="All time revenue" />
        <KPICard label="Total Orders" value={kpis.total_orders.toLocaleString()} icon="📦" color="teal" sub="Order count" />
        <KPICard label="Total Profit" value={fmt(kpis.total_profit)} icon="📈" color="green" sub="Net profit" />
        <KPICard label="Late Delivery %" value={kpis.late_delivery_rate + "%"} icon="⚠️" color="red" sub="Risk rate" />
        <KPICard label="Avg Ship Days" value={kpis.avg_shipping_days + " days"} icon="🚚" color="orange" sub="Actual shipping" />
        <KPICard label="Profit Ratio" value={kpis.avg_profit_ratio + "%"} icon="💹" color="purple" sub="Avg per order" />
      </div>

      {/* Charts row 1 */}
      <div className="chart-grid two-col">
        <div className="chart-card">
          <h3>📅 Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month_name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
              <Tooltip content={<CustomTooltip formatter={fmt} />} />
              <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGrad)" name="Sales" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>📦 Delivery Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={delivery} dataKey="count" nameKey="Delivery Status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {delivery.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => v.toLocaleString()} />
              <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="chart-card">
        <h3>🏆 Top 5 Categories by Sales</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categories} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + (v / 1e6).toFixed(1) + "M"} />
            <YAxis type="category" dataKey="Category Name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<CustomTooltip formatter={fmt} />} />
            <Bar dataKey="Sales" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Sales" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
