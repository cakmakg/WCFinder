// features/admin/components/dashboard/StatCard.jsx
// KPI-Statistikkarte mit Trend-Indikatoren

import React from "react";
import { Card, CardContent, Box, Typography, Chip } from "@mui/material";
import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import { COLORS, RADII, SHADOWS } from "../../../../theme/designTokens";

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

  const getTrendStyle = () => {
    if (trend === "up") return { bgcolor: "#ecfdf5", color: "#059669" };
    if (trend === "down") return { bgcolor: "#fef2f2", color: "#dc2626" };
    return { bgcolor: "#f1f5f9", color: COLORS.textSecondary };
  };

  const trendStyle = getTrendStyle();

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: RADII.card,
        boxShadow: SHADOWS.subtle,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.backgroundWhite,
        transition: "all 0.2s ease",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        // Dezenter Lift; klickbare Karten heben sich zusätzlich per Schatten ab
        "&:hover": {
          transform: "translateY(-2px)",
          ...(onClick && {
            boxShadow: SHADOWS.hover,
            borderColor: color,
          }),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              bgcolor: COLORS.accentBoxBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22, color: COLORS.primary }} />
          </Box>
          {trend && (
            <Chip
              icon={getTrendIcon()}
              label={trendValue ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : "—"}
              size="small"
              sx={{
                borderRadius: "999px",
                bgcolor: trendStyle.bgcolor,
                color: trendStyle.color,
                "& .MuiChip-icon": { color: trendStyle.color },
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            color: COLORS.textSecondary,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: COLORS.textHeading,
            fontVariantNumeric: "tabular-nums",
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
              color: COLORS.textLight,
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
