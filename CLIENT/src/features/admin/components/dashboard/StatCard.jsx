// features/admin/components/dashboard/StatCard.jsx
// KPI statistic card component

import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

const StatCard = ({ title, value, icon: Icon, color = "#0891b2" }) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        transition: "all 0.2s ease",
        height: "100%",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 24, color }} />
          </Box>
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#6b7280",
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            color: "#111827",
            fontSize: "1.75rem",
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;

