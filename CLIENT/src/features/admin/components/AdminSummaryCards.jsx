// features/admin/components/AdminSummaryCards.jsx
// Admin panel summary cards component

import React from "react";
import { Grid, Card, CardContent, Box, Typography } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import { useTranslation } from "react-i18next";

const AdminSummaryCards = ({ pendingPayments, monthlySummary }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            bgcolor: "#fef3c7",
            border: "1px solid #fde047",
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <AccountBalanceWalletIcon
                sx={{ color: "#d97706", fontSize: "2rem" }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#d97706" }}>
                € {pendingPayments?.totalPending?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t("adminPanel.totalPending")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            bgcolor: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <BusinessIcon sx={{ color: "#16a34a", fontSize: "2rem" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#16a34a" }}>
                {pendingPayments?.businessCount || 0}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t("adminPanel.businessesWithPending")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            bgcolor: "#dbeafe",
            border: "1px solid #93c5fd",
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <TrendingUpIcon sx={{ color: "#2563eb", fontSize: "2rem" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#2563eb" }}>
                € {monthlySummary?.summary?.totalPlatformFee?.toFixed(2) || "0.00"}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t("adminPanel.platformRevenue")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            bgcolor: "#f3e8ff",
            border: "1px solid #c4b5fd",
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <PaymentIcon sx={{ color: "#7c3aed", fontSize: "2rem" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#7c3aed" }}>
                {monthlySummary?.summary?.paymentCount || 0}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t("adminPanel.totalPayments")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminSummaryCards;

