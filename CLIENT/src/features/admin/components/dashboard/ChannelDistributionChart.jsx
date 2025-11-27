// features/admin/components/dashboard/ChannelDistributionChart.jsx
// Channel distribution pie chart component

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const ChannelDistributionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 1 }}>
        <CircularProgress size={30} />
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          Lädt Daten...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
          Keine Daten verfügbar
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => {
              if (percent < 0.05) return '';
              return `${(percent * 100).toFixed(0)}%`;
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              fontSize: '13px',
              padding: '10px',
            }}
            formatter={(value, name) => {
              const total = data.reduce((sum, item) => sum + item.value, 0);
              const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return [`${Number(value).toLocaleString('de-DE')} (${percent}%)`, name];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: item.color || COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default ChannelDistributionChart;

