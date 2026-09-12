import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function VisitsChart({ data = [] }) {
  return (
    <div className="admin-chart-container">

      <div className="admin-chart-header">
        <div>
          <p className="admin-section-label">
            TRAFFIC
          </p>

          <h2>
            Daily Visits
          </h2>
        </div>

        <div className="chart-period">
          LAST 30 DAYS
        </div>
      </div>

      <div className="admin-chart">
        {data.length === 0 ? (
          <div className="chart-empty">
            No visit data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="visitGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#0044FF"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#0044FF"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.08}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 11,
                  fill: "#777",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#777",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "12px",
                  color: "#000",
                }}
              />

              <Area
                type="monotone"
                dataKey="visits"
                stroke="#0044FF"
                strokeWidth={2}
                fill="url(#visitGradient)"
                animationDuration={1800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}