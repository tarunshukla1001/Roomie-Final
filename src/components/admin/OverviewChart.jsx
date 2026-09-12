import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function OverviewChart({
  loggedInVisits = 0,
  anonymousVisits = 0,
  popularPages = [],
}) {
  const visitorData = [
    {
      name: "Logged In",
      value: loggedInVisits,
    },
    {
      name: "Anonymous",
      value: anonymousVisits,
    },
  ];

  return (
    <div className="admin-chart-container overview-chart">

      <div className="admin-chart-header">
        <div>
          <p className="admin-section-label">
            VISITOR ACTIVITY
          </p>

          <h2>
            Visitor Overview
          </h2>
        </div>
      </div>

      <div className="admin-chart small-chart">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={visitorData}
            margin={{
              top: 20,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.08}
            />

            <XAxis
              dataKey="name"
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
              cursor={{
                fill: "rgba(0,0,0,0.04)",
              }}
            />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              fill="#0044FF"
              animationDuration={1500}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Popular pages */}

      {popularPages.length > 0 && (
        <div className="popular-pages">

          <div className="admin-chart-header">
            <div>
              <p className="admin-section-label">
                TRAFFIC
              </p>

              <h3>
                Popular Pages
              </h3>
            </div>
          </div>

          <div className="popular-pages-list">

            {popularPages.slice(0, 5).map((item, index) => (
              <div
                className="popular-page-row"
                key={`${item.page}-${index}`}
              >

                <div className="popular-page-name">
                  <span className="popular-page-number">
                    0{index + 1}
                  </span>

                  <span>
                    {item.page}
                  </span>
                </div>

                <span className="popular-page-visits">
                  {item.visits}
                </span>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}
