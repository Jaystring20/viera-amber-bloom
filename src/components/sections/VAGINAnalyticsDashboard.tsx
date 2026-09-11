import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ChevronDown,
  Filter,
} from "lucide-react";

const VAGIN_PURPLE = "#62017F";
const PAD_KOLO_PINK = "#ED155D";
const GOLD = "#D97706";
const DARK_BG = "rgba(26,26,26,0.6)";
const LIGHT_TEXT = "#F3F4F6";

interface School {
  id: string;
  name: string;
  code: string;
  girls_reached: number;
}

interface ChartData {
  month: string;
  pads: number;
  revenue: number;
  girls: number;
}

interface PerformanceData {
  school_name: string;
  pads_distributed: number;
  revenue: number;
  girls_count: number;
  rank: number;
}

type TimeRange = "monthly" | "quarterly" | "yearly" | "custom";

export default function VAGINAnalyticsDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [viewAllSchools, setViewAllSchools] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await supabase
          .from("vagin_schools")
          .select("*")
          .order("name");
        setSchools(data || []);
        if (data && data.length > 0) {
          setSelectedSchools([data[0].id]);
        }
      } catch (err) {
        console.error("Failed to fetch schools:", err);
      }
    };
    fetchSchools();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const schoolIds = viewAllSchools ? schools.map((s) => s.id) : selectedSchools;

        if (schoolIds.length === 0) {
          setLoading(false);
          return;
        }

        // Get date range
        const now = new Date();
        let startDate = new Date();

        if (timeRange === "monthly") {
          startDate.setDate(now.getDate() - 30);
        } else if (timeRange === "quarterly") {
          startDate.setDate(now.getDate() - 90);
        } else if (timeRange === "yearly") {
          startDate.setFullYear(now.getFullYear() - 1);
        } else if (timeRange === "custom") {
          if (customStart) startDate = new Date(customStart);
        }

        const endDate = timeRange === "custom" && customEnd ? new Date(customEnd) : now;

        // Fetch pad distributions
        const { data: distributions } = await supabase
          .from("vagin_pad_distributions")
          .select("*")
          .in("school_id", schoolIds)
          .gte("distribution_date", startDate.toISOString().split("T")[0])
          .lte("distribution_date", endDate.toISOString().split("T")[0]);

        // Fetch transactions for revenue
        const { data: transactions } = await supabase
          .from("vagin_transactions")
          .select("*")
          .in("school_id", schoolIds)
          .gte("issued_date", startDate.toISOString().split("T")[0])
          .lte("issued_date", endDate.toISOString().split("T")[0]);

        // Fetch students for enrollment
        const { data: students } = await supabase
          .from("vagin_students")
          .select("*")
          .in("school_id", schoolIds);

        // Process chart data
        const monthlyData: { [key: string]: ChartData } = {};

        distributions?.forEach((dist) => {
          const date = new Date(dist.distribution_date);
          const month = date.toLocaleString("default", { month: "short", year: "2-digit" });

          if (!monthlyData[month]) {
            monthlyData[month] = { month, pads: 0, revenue: 0, girls: 0 };
          }
          monthlyData[month].pads += dist.pads_count || 0;
          monthlyData[month].girls += dist.girls_count || 0;
        });

        transactions?.forEach((trans) => {
          const date = new Date(trans.issued_date || "");
          const month = date.toLocaleString("default", { month: "short", year: "2-digit" });

          if (!monthlyData[month]) {
            monthlyData[month] = { month, pads: 0, revenue: 0, girls: 0 };
          }
          if (trans.transaction_type === "paid") {
            monthlyData[month].revenue += trans.amount_ngn || 0;
          }
        });

        const chartDataArray = Object.values(monthlyData).sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        );

        setChartData(chartDataArray);

        // Process performance data (per school)
        const performanceMap: { [key: string]: PerformanceData } = {};

        for (const schoolId of schoolIds) {
          const school = schools.find((s) => s.id === schoolId);
          if (!school) continue;

          const schoolDists = distributions?.filter((d) => d.school_id === schoolId) || [];
          const schoolTrans = transactions?.filter((t) => t.school_id === schoolId) || [];
          const schoolStudents = students?.filter((s) => s.school_id === schoolId) || [];

          const totalPads = schoolDists.reduce((sum, d) => sum + (d.pads_count || 0), 0);
          const totalRevenue = schoolTrans
            .filter((t) => t.transaction_type === "paid")
            .reduce((sum, t) => sum + (t.amount_ngn || 0), 0);
          const totalGirls = schoolStudents.length;

          performanceMap[schoolId] = {
            school_name: school.name,
            pads_distributed: totalPads,
            revenue: totalRevenue,
            girls_count: totalGirls,
            rank: 0,
          };
        }

        // Rank schools
        const performanceArray = Object.values(performanceMap)
          .sort((a, b) => b.pads_distributed - a.pads_distributed)
          .map((p, idx) => ({ ...p, rank: idx + 1 }));

        setPerformanceData(performanceArray);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (schools.length > 0) {
      fetchAnalytics();
    }
  }, [schools, selectedSchools, viewAllSchools, timeRange, customStart, customEnd]);

  // Export to CSV
  const exportCSV = () => {
    const csv = [
      ["VAGIN Analytics Report", new Date().toLocaleDateString()],
      [],
      ["Performance Summary"],
      ["School", "Pads Distributed", "Revenue (₦)", "Girls Count", "Rank"],
      ...performanceData.map((p) => [
        p.school_name,
        p.pads_distributed,
        p.revenue.toFixed(2),
        p.girls_count,
        p.rank,
      ]),
      [],
      ["Monthly Trends"],
      ["Month", "Pads", "Revenue (₦)", "Girls"],
      ...chartData.map((d) => [d.month, d.pads, d.revenue.toFixed(2), d.girls]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vagin-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Export to PDF (simplified - would need jsPDF in production)
  const exportPDF = () => {
    const content = `
VAGIN Analytics Report
Generated: ${new Date().toLocaleDateString()}

PERFORMANCE SUMMARY
${performanceData.map((p) => `${p.school_name}: ${p.pads_distributed} pads, ₦${p.revenue.toFixed(2)} revenue, ${p.girls_count} girls`).join("\n")}

MONTHLY TRENDS
${chartData.map((d) => `${d.month}: ${d.pads} pads, ₦${d.revenue.toFixed(2)} revenue, ${d.girls} girls`).join("\n")}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vagin-analytics-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div
        style={{
          background: DARK_BG,
          backdropFilter: "blur(12px)",
          minHeight: "100vh",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: LIGHT_TEXT }}>Loading analytics...</p>
      </div>
    );
  }

  const topPerformers = performanceData.slice(0, 3);
  const bottomPerformers = performanceData.slice(-3).reverse();

  return (
    <div
      style={{
        background: DARK_BG,
        backdropFilter: "blur(12px)",
        minHeight: "100vh",
        padding: "40px 20px",
        color: LIGHT_TEXT,
      }}
    >
      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "40px" }}
        >
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 20px 0", color: LIGHT_TEXT }}>
            📊 VAGIN Analytics Dashboard
          </h1>
          <p style={{ color: "rgba(243,244,246,0.7)", margin: 0 }}>
            Track pad distribution, revenue, enrollment, and school performance
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "rgba(243,244,246,0.05)",
            border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.2)`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          {/* School Selector */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block", opacity: 0.8 }}>
              📍 School
            </label>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(243,244,246,0.1)",
                border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                borderRadius: "8px",
                color: LIGHT_TEXT,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {viewAllSchools ? "All Schools" : schools.find((s) => s.id === selectedSchools[0])?.name || "Select School"}
              </span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "rgba(26,26,26,0.95)",
                  border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                  borderRadius: "8px",
                  marginTop: "8px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10,
                }}
              >
                <button
                  onClick={() => {
                    setViewAllSchools(true);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: viewAllSchools ? VAGIN_PURPLE : "transparent",
                    border: "none",
                    color: LIGHT_TEXT,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  ✓ All Schools
                </button>
                {schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => {
                      setSelectedSchools([school.id]);
                      setViewAllSchools(false);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: selectedSchools[0] === school.id && !viewAllSchools ? VAGIN_PURPLE : "transparent",
                      border: "none",
                      color: LIGHT_TEXT,
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      borderTop: "1px solid rgba(243,244,246,0.1)",
                    }}
                  >
                    {school.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Time Range Selector */}
          <div style={{ position: "relative" }}>
            <label style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "block", opacity: 0.8 }}>
              📅 Time Range
            </label>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(243,244,246,0.1)",
                border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                borderRadius: "8px",
                color: LIGHT_TEXT,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{timeRange === "custom" ? "Custom Date" : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</span>
              <ChevronDown size={16} />
            </button>

            {showTimeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "rgba(26,26,26,0.95)",
                  border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                  borderRadius: "8px",
                  marginTop: "8px",
                  zIndex: 10,
                }}
              >
                {["monthly", "quarterly", "yearly", "custom"].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setTimeRange(range as TimeRange);
                      setShowTimeDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: timeRange === range ? VAGIN_PURPLE : "transparent",
                      border: "none",
                      color: LIGHT_TEXT,
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                      borderTop: "1px solid rgba(243,244,246,0.1)",
                    }}
                  >
                    {range === "monthly"
                      ? "📆 Last 30 Days"
                      : range === "quarterly"
                      ? "📅 Last 90 Days"
                      : range === "yearly"
                      ? "📊 Last Year"
                      : "🗓️ Custom Date"}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Custom Date Inputs */}
          {timeRange === "custom" && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                style={{
                  padding: "10px 14px",
                  background: "rgba(243,244,246,0.1)",
                  border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                  borderRadius: "8px",
                  color: LIGHT_TEXT,
                }}
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                style={{
                  padding: "10px 14px",
                  background: "rgba(243,244,246,0.1)",
                  border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.3)`,
                  borderRadius: "8px",
                  color: LIGHT_TEXT,
                }}
              />
            </>
          )}

          {/* Export Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={exportCSV}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: PAD_KOLO_PINK,
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Download size={16} /> CSV
            </button>
            <button
              onClick={exportPDF}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: GOLD,
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Download size={16} /> PDF
            </button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        {!viewAllSchools && selectedSchools.length === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            {performanceData.slice(0, 1).map((data) => (
              <>
                <div
                  key="pads"
                  style={{
                    background: "rgba(237,21,93,0.1)",
                    border: `1px solid ${PAD_KOLO_PINK}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Package size={20} color={PAD_KOLO_PINK} />
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>PADS DISTRIBUTED</span>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: PAD_KOLO_PINK }}>
                    {data.pads_distributed.toLocaleString()}
                  </p>
                </div>

                <div
                  key="revenue"
                  style={{
                    background: "rgba(217,119,6,0.1)",
                    border: `1px solid ${GOLD}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <DollarSign size={20} color={GOLD} />
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>REVENUE</span>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: GOLD }}>
                    ₦{data.revenue.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                  </p>
                </div>

                <div
                  key="girls"
                  style={{
                    background: "rgba(98,1,127,0.1)",
                    border: `1px solid ${VAGIN_PURPLE}`,
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Users size={20} color={VAGIN_PURPLE} />
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>GIRLS ENROLLED</span>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: VAGIN_PURPLE }}>
                    {data.girls_count.toLocaleString()}
                  </p>
                </div>
              </>
            ))}
          </motion.div>
        )}

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "rgba(243,244,246,0.05)",
            border: `1px solid rgba(${parseInt(VAGIN_PURPLE.slice(1, 3), 16)},${parseInt(VAGIN_PURPLE.slice(3, 5), 16)},${parseInt(VAGIN_PURPLE.slice(5, 7), 16)},0.2)`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "40px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", marginTop: 0 }}>
            📈 Monthly Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,244,246,0.1)" />
              <XAxis dataKey="month" stroke="rgba(243,244,246,0.5)" />
              <YAxis stroke="rgba(243,244,246,0.5)" />
              <Tooltip
                contentStyle={{
                  background: "rgba(26,26,26,0.95)",
                  border: `1px solid ${VAGIN_PURPLE}`,
                  borderRadius: "8px",
                  color: LIGHT_TEXT,
                }}
              />
              <Legend />
              <Bar dataKey="pads" fill={PAD_KOLO_PINK} name="Pads Distributed" />
              <Bar dataKey="girls" fill={VAGIN_PURPLE} name="Girls Reached" />
              <Line dataKey="revenue" stroke={GOLD} name="Revenue (₦)" yAxisId="right" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Top Performers */}
          <div
            style={{
              background: "rgba(243,244,246,0.05)",
              border: `1px solid rgba(98,1,127,0.3)`,
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", marginTop: 0, color: VAGIN_PURPLE }}>
              🏆 Top Performers
            </h3>
            {topPerformers.map((school, idx) => (
              <div
                key={school.school_name}
                style={{
                  padding: "12px",
                  background: "rgba(98,1,127,0.1)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  borderLeft: `3px solid ${VAGIN_PURPLE}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>
                    #{idx + 1} {school.school_name}
                  </span>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>{school.pads_distributed} pads</span>
                </div>
                <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px" }}>
                  ₦{school.revenue.toLocaleString("en-NG", { maximumFractionDigits: 0 })} • {school.girls_count} girls
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Performers */}
          <div
            style={{
              background: "rgba(243,244,246,0.05)",
              border: `1px solid rgba(237,21,93,0.3)`,
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", marginTop: 0, color: PAD_KOLO_PINK }}>
              📌 Needs Support
            </h3>
            {bottomPerformers.map((school, idx) => (
              <div
                key={school.school_name}
                style={{
                  padding: "12px",
                  background: "rgba(237,21,93,0.1)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  borderLeft: `3px solid ${PAD_KOLO_PINK}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>
                    {performanceData.length - idx} {school.school_name}
                  </span>
                  <span style={{ fontSize: "12px", opacity: 0.7 }}>{school.pads_distributed} pads</span>
                </div>
                <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px" }}>
                  ₦{school.revenue.toLocaleString("en-NG", { maximumFractionDigits: 0 })} • {school.girls_count} girls
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        input[type="date"] {
          color-scheme: dark;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}
