// features/admin/components/dashboard/StatCard.jsx
// KPI statistic card component with trend indicators

import React from "react";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "#0891b2",
  trend,
  trendValue,
  subtitle,
  onClick
}) => {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend === "down") return <TrendingDown sx={{ fontSize: 16 }} />;
    return <Remove sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "#16a34a";
    if (trend === "down") return "#dc2626";
    return "#6b7280";
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 2,
        boxShadow: "none",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        transition: "all 0.2s ease",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
          borderColor: onClick ? color : "#e5e7eb",
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
          {trend && (
            <Chip
              icon={getTrendIcon()}
              label={trendValue ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : "—"}
              size="small"
              sx={{
                bgcolor: `${getTrendColor()}15`,
                color: getTrendColor(),
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#6b7280",
            mb: 0.5,
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
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#9ca3af",
              fontSize: "0.7rem",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;

