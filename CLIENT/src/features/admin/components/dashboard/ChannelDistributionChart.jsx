// features/admin/components/dashboard/ChannelDistributionChart.jsx
// Kreisdiagramm zur Statusverteilung der Betriebe

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS as TOKENS, SHADOWS } from "../../../../theme/designTokens";

// Markenkonforme Cyan-Familie für Diagrammsegmente
const COLORS = ["#0891b2", "#0e7490", "#06b6d4", "#67e8f9", "#155e75", "#a5f3fc"];

const ChannelDistributionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 1 }}>
        <CircularProgress size={30} sx={{ color: TOKENS.primary }} />
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: TOKENS.textLight }}>
          Lädt Daten...
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: TOKENS.textLight }}>
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
            label={({ _name, percent }) => {
              if (percent < 0.05) return '';
              return `${(percent * 100).toFixed(0)}%`;
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'white',
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '12px',
              boxShadow: SHADOWS.subtle,
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
          <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: COLORS[index % COLORS.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" sx={{ color: TOKENS.textSecondary, fontWeight: 500 }}>
              {item.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default ChannelDistributionChart;
