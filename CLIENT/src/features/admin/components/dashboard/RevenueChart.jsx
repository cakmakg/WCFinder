// features/admin/components/dashboard/RevenueChart.jsx
// Revenue line chart component

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

const RevenueChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 350, gap: 1 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          Lädt Daten...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 350, gap: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
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
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          style={{ fontSize: '13px' }}
          tick={{ fill: '#64748b' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="#94a3b8" 
          style={{ fontSize: '13px' }}
          tick={{ fill: '#64748b' }}
          width={60}
          tickFormatter={(value) => {
            if (value >= 1000) return `€${(value / 1000).toFixed(1)}K`;
            return `€${value.toFixed(0)}`;
          }}
        />
        <Tooltip 
          contentStyle={{ 
            background: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            fontSize: '13px',
            padding: '10px',
          }}
          formatter={(value) => [`€${Number(value).toLocaleString('de-DE', { maximumFractionDigits: 2 })}`, 'Umsatz']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#667eea" 
          strokeWidth={3.5}
          dot={{ fill: '#667eea', r: 5 }}
          activeDot={{ r: 7 }}
          fill="url(#colorValue)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;

