// features/admin/components/dashboard/RevenueChart.jsx
// Umsatz-Liniendiagramm

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS, SHADOWS } from "../../../../theme/designTokens";

const RevenueChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 350, gap: 1 }}>
        <CircularProgress size={30} sx={{ color: COLORS.primary }} />
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: COLORS.textLight }}>
          Lädt Daten...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 350, gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: COLORS.textLight }}>
          Keine Daten verfügbar
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
        <XAxis
          dataKey="name"
          stroke={COLORS.textLight}
          style={{ fontSize: '13px' }}
          tick={{ fill: COLORS.textSecondary }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke={COLORS.textLight}
          style={{ fontSize: '13px' }}
          tick={{ fill: COLORS.textSecondary }}
          width={60}
          tickFormatter={(value) => {
            if (value >= 1000) return `€${(value / 1000).toFixed(1)}K`;
            return `€${value.toFixed(0)}`;
          }}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            boxShadow: SHADOWS.subtle,
            fontSize: '13px',
            padding: '10px',
          }}
          formatter={(value) => [`€${Number(value).toLocaleString('de-DE', { maximumFractionDigits: 2 })}`, 'Umsatz']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          strokeWidth={2.5}
          dot={{ fill: COLORS.primary, r: 4 }}
          activeDot={{ r: 6 }}
          fill="url(#colorValue)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
