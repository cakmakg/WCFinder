// pages/OwnerPanel.jsx
// Simple owner dashboard — Heute / Dieser Monat / Gesamt

import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TodayOutlined as TodayIcon,
  CalendarMonthOutlined as MonthIcon,
  EuroOutlined as EuroIcon,
  BookmarkBorderOutlined as BookingIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  CheckCircleOutlineOutlined as DoneIcon,
} from "@mui/icons-material";
import businessService from "../services/businessService";

/* ── helpers ── */
const fmt = (value) =>
  `€${Number(value || 0).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const StatCard = ({ icon: Icon, iconColor, label, value, accent }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: "14px",
      borderLeft: `3px solid ${accent || iconColor}`,
      backgroundColor: "#f0f9ff",
      display: "flex",
      alignItems: "center",
      gap: 2,
      height: "100%",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        backgroundColor: `${iconColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon sx={{ color: iconColor, fontSize: 22 }} />
    </Box>
    <Box>
      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, lineHeight: 1.2, display: "block" }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const SectionHeader = ({ title }) => (
  <Typography
    variant="overline"
    sx={{ color: "#64748b", fontWeight: 700, letterSpacing: 1.2, display: "block", mb: 1.5, mt: 0.5 }}
  >
    {title}
  </Typography>
);

/* ── component ── */
const OwnerPanel = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerBusiness, setOwnerBusiness] = useState(null);
  const [ownerStats, setOwnerStats] = useState(null);
  const [pendingPayout, setPendingPayout] = useState(0);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      navigate("/home");
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bizRes, statsRes] = await Promise.all([
        businessService.getMyBusiness().catch(() => ({ result: null })),
        businessService.getOwnerStats().catch(() => ({ result: null })),
      ]);
      setOwnerBusiness(bizRes?.result || null);
      setOwnerStats(statsRes?.result || null);

      // Payout summary
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
        const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseURL}/business-payouts/my-summary`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }).then((r) => r.json()).catch(() => null);
        const pd = res?.result || {};
        setPendingPayout(pd.pendingBalance ?? pd.netRevenue ?? pd.totalEarned ?? 0);
      } catch {
        setPendingPayout(0);
      }
    } catch (err) {
      setError("Fehler beim Laden der Daten.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Heute ── */
  const todayStats = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return { count: 0, revenue: 0 };
    const todayStr = new Date().toISOString().slice(0, 10);
    const day = ownerStats.usage.byDay.find(
      (d) => new Date(d._id).toISOString().slice(0, 10) === todayStr
    );
    return { count: day?.count || 0, revenue: day?.revenue || 0 };
  }, [ownerStats]);

  /* ── Dieser Monat ── */
  const monthStats = useMemo(() => {
    if (!ownerStats?.usage?.byDay) return { count: 0, revenue: 0 };
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const days = ownerStats.usage.byDay.filter((d) => {
      const dd = new Date(d._id);
      return dd.getFullYear() === y && dd.getMonth() === m;
    });
    return {
      count: days.reduce((s, d) => s + (d.count || 0), 0),
      revenue: days.reduce((s, d) => s + (d.revenue || 0), 0),
    };
  }, [ownerStats]);

  if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 3 }}>
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 3 } }}>

        {/* ── Header ── */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
            borderRadius: "16px",
            p: 3,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(8,145,178,0.25)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 0.5 }}>
              Mein Dashboard
            </Typography>
            {ownerBusiness && (
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {ownerBusiness.businessName || ownerBusiness.name}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {ownerBusiness?.approvalStatus && (
              <Chip
                label={ownerBusiness.approvalStatus === "approved" ? "Aktiv" : ownerBusiness.approvalStatus}
                size="small"
                sx={{
                  backgroundColor: ownerBusiness.approvalStatus === "approved" ? "#22c55e" : "#f59e0b",
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
            )}
            <Tooltip title="Aktualisieren">
              <IconButton onClick={fetchData} sx={{ color: "#fff" }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : (
          <>
            {/* ── Heute ── */}
            <SectionHeader title="Heute" />
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <StatCard
                  icon={TodayIcon}
                  iconColor="#0891b2"
                  label="Buchungen heute"
                  value={todayStats.count}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard
                  icon={EuroIcon}
                  iconColor="#0891b2"
                  label="Umsatz heute"
                  value={fmt(todayStats.revenue)}
                />
              </Grid>
            </Grid>

            {/* ── Dieser Monat ── */}
            <SectionHeader title="Dieser Monat" />
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <StatCard
                  icon={MonthIcon}
                  iconColor="#16a34a"
                  label="Buchungen diesen Monat"
                  value={monthStats.count}
                  accent="#16a34a"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard
                  icon={EuroIcon}
                  iconColor="#16a34a"
                  label="Umsatz diesen Monat"
                  value={fmt(monthStats.revenue)}
                  accent="#16a34a"
                />
              </Grid>
            </Grid>

            {/* ── Gesamt ── */}
            <SectionHeader title="Gesamt" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StatCard
                  icon={BookingIcon}
                  iconColor="#7c3aed"
                  label="Gesamt Buchungen"
                  value={ownerStats?.usage?.total || 0}
                  accent="#7c3aed"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard
                  icon={DoneIcon}
                  iconColor="#f59e0b"
                  label="Gesamtumsatz"
                  value={fmt(ownerStats?.revenue?.total || 0)}
                  accent="#f59e0b"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard
                  icon={WalletIcon}
                  iconColor="#dc2626"
                  label="Ausstehende Auszahlung"
                  value={fmt(pendingPayout)}
                  accent="#dc2626"
                />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
};

export default OwnerPanel;
