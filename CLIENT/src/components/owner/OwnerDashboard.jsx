// components/owner/OwnerDashboard.jsx
// Modern owner dashboard with statistics and overview

import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Wc,
  Euro,
  People,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <Card
    sx={{
      position: "relative",
      overflow: "hidden",
      "&:hover": {
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        transform: "translateY(-4px)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 28, color }} />
        </Box>
        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: trend === "up" ? "#16a34a" : "#dc2626",
            }}
          >
            {trend === "up" ? <TrendingUp /> : <TrendingDown />}
            <Typography variant="body2" fontWeight={600}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const OwnerDashboard = ({ ownerStats, financialData }) => {
  const { t } = useTranslation();

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const stats = [
    {
      title: "Gesamtumsatz",
      value: formatCurrency(ownerStats?.revenue?.total || financialData?.business?.totalEarnings || 0),
      icon: AccountBalanceWallet,
      color: "#0891b2",
    },
    {
      title: "Gesamt Toiletten",
      value: ownerStats?.toilets?.total || 0,
      icon: Wc,
      color: "#7c3aed",
    },
    {
      title: "Ausstehendes Guthaben",
      value: formatCurrency(financialData?.business?.pendingBalance || 0),
      icon: Euro,
      color: "#f59e0b",
    },
    {
      title: "Durchschnittliche Bewertung",
      value: ownerStats?.ratings?.average?.toFixed(1) || "0.0",
      icon: People,
      color: "#16a34a",
    },
  ];

  // Top performing toilets
  const topToilets = ownerStats?.toilets?.list
    ?.slice(0, 5)
    .map((toilet, index, array) => {
      const maxRevenue = Math.max(...array.map(t => (t.fee || 0) * (t.reviewCount || 0)), 1);
      const revenue = (toilet.fee || 0) * (toilet.reviewCount || 0);
      return {
        name: toilet.name,
        revenue: revenue,
        percentage: (revenue / maxRevenue) * 100,
        rating: toilet.averageRating || 0,
      };
    }) || [];

  // Recent activity from backend data
  const recentActivity = ownerStats?.usage?.byDay
    ?.slice(-5)
    .reverse()
    .map((day) => ({
      type: "usage",
      description: `${day.count || 0} Reservierungen`,
      timestamp: new Date(day._id).toLocaleDateString("de-DE"),
      amount: day.revenue || 0,
    })) || [];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity & Top Toilets */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Letzte Aktivitäten
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      borderLeft: "4px solid",
                      borderColor: activity.type === "usage" ? "#16a34a" : "#0891b2",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: activity.type === "usage" ? "#16a34a15" : "#0891b215",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {activity.type === "usage" ? (
                        <Wc sx={{ color: "#16a34a" }} />
                      ) : (
                        <AccountBalanceWallet sx={{ color: "#0891b2" }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp}
                      </Typography>
                    </Box>
                    {activity.amount && (
                      <Typography variant="h6" fontWeight={600} color="#16a34a">
                        €{activity.amount.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  Keine Aktivitäten vorhanden
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Toilets */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Top Toiletten
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {topToilets.length > 0 ? (
                topToilets.map((toilet, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#0891b215",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "#0891b2",
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {toilet.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" fontWeight={600}>
                          €{toilet.revenue?.toFixed(2) || "0.00"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ⭐ {toilet.rating?.toFixed(1) || "0.0"}
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={toilet.percentage || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: "#0891b2",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                  Keine Toiletten vorhanden
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;

