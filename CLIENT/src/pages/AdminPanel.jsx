// pages/AdminPanel.jsx - REFACTORED
// Admin panel - Ödeme dağıtımı ve işletme yönetimi

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AdminSummaryCards from "../features/admin/components/AdminSummaryCards";
import PendingPaymentsTab from "../features/admin/components/PendingPaymentsTab";
import MonthlySummaryTab from "../features/admin/components/MonthlySummaryTab";
import RechnungenTab from "../features/admin/components/RechnungenTab";
import PayoutDialog from "../features/admin/components/PayoutDialog";
import { adminService } from "../features/admin/services/adminService";
import { showSuccessMessage, handleApiError } from "../shared/utils/errorHandler";

const AdminPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pending Payments State
  const [pendingPayments, setPendingPayments] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutNotes, setPayoutNotes] = useState("");

  // Monthly Summary State
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  // Rechnungen State
  const [businessesWithPayouts, setBusinessesWithPayouts] = useState([]);
  const [creatingRechnung, setCreatingRechnung] = useState(null);

  // Admin check
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/home");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchData();
    }
  }, [activeTab, selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 0) {
        // Pending Payments
        const data = await adminService.getAllPendingPayments();
        setPendingPayments(data?.result);
      } else if (activeTab === 1) {
        // Monthly Summary
        const data = await adminService.getMonthlySummary(
          selectedYear,
          selectedMonth
        );
        setMonthlySummary(data?.result);
      } else if (activeTab === 2) {
        // Businesses with Payouts (Rechnungen)
        const data = await adminService.getBusinessesWithPayouts();
        setBusinessesWithPayouts(data?.result || []);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      const errorMessage = handleApiError(err, t("adminPanel.loadError"));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayout = async () => {
    if (!selectedBusiness || !payoutAmount) {
      handleApiError(new Error(t("adminPanel.amountRequired")));
      return;
    }

    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

      await adminService.createPayout({
        businessId: selectedBusiness.businessId,
        amount: parseFloat(payoutAmount),
        paymentMethod: payoutMethod,
        notes: payoutNotes,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
      });

      showSuccessMessage(t("adminPanel.payoutCreated"));
      setPayoutDialogOpen(false);
      setSelectedBusiness(null);
      setPayoutAmount("");
      setPayoutNotes("");
      fetchData();
    } catch (err) {
      handleApiError(err, t("adminPanel.payoutError"));
    }
  };

  const handleCompletePayout = async (payoutId) => {
    if (!window.confirm(t("adminPanel.confirmComplete"))) {
      return;
    }

    try {
      await adminService.completePayout(payoutId, `TRX-${Date.now()}`);
      showSuccessMessage(t("adminPanel.payoutCompleted"));
      fetchData();
    } catch (err) {
      handleApiError(err, t("adminPanel.completeError"));
    }
  };

  const handleCreateRechnung = async (payoutId) => {
    if (!window.confirm(t("adminPanel.confirmCreateRechnung"))) {
      return;
    }

    try {
      setCreatingRechnung(payoutId);
      await adminService.createRechnung(payoutId);
      showSuccessMessage(t("adminPanel.rechnungCreated"));
      fetchData();
    } catch (err) {
      handleApiError(err, t("adminPanel.rechnungError"));
    } finally {
      setCreatingRechnung(null);
    }
  };

  const handleDownloadRechnung = async (rechnungId) => {
    try {
      await adminService.downloadRechnung(rechnungId);
      showSuccessMessage(t("adminPanel.downloadSuccess"));
    } catch (err) {
      handleApiError(err, t("adminPanel.downloadError"));
    }
  };

  const handlePayoutDialogOpen = (business) => {
    setSelectedBusiness(business);
    setPayoutAmount(business.totalPending.toFixed(2));
    setPayoutDialogOpen(true);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  if (loading && !pendingPayments && !monthlySummary) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{t("adminPanel.loading")}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          {t("adminPanel.title")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <AdminSummaryCards
          pendingPayments={pendingPayments}
          monthlySummary={monthlySummary}
        />

        {/* Tabs */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3, borderBottom: "1px solid #e2e8f0" }}
          >
            <Tab
              icon={<PaymentIcon />}
              iconPosition="start"
              label={t("adminPanel.pendingPayments")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
            <Tab
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label={t("adminPanel.monthlySummary")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
            <Tab
              icon={<ReceiptIcon />}
              iconPosition="start"
              label={t("adminPanel.rechnungen")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
          </Tabs>

          {/* Tab Content */}
          {activeTab === 0 && (
            <PendingPaymentsTab
              pendingPayments={pendingPayments}
              onCreatePayout={handlePayoutDialogOpen}
            />
          )}

          {activeTab === 1 && (
            <MonthlySummaryTab
              monthlySummary={monthlySummary}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              onLoad={fetchData}
            />
          )}

          {activeTab === 2 && (
            <RechnungenTab
              businessesWithPayouts={businessesWithPayouts}
              creatingRechnung={creatingRechnung}
              onCreateRechnung={handleCreateRechnung}
              onDownloadRechnung={handleDownloadRechnung}
            />
          )}
        </Paper>

        {/* Payout Dialog */}
        <PayoutDialog
          open={payoutDialogOpen}
          onClose={() => setPayoutDialogOpen(false)}
          selectedBusiness={selectedBusiness}
          payoutAmount={payoutAmount}
          payoutMethod={payoutMethod}
          payoutNotes={payoutNotes}
          onAmountChange={setPayoutAmount}
          onMethodChange={setPayoutMethod}
          onNotesChange={setPayoutNotes}
          onCreate={handleCreatePayout}
        />
      </Container>
    </Box>
  );
};

export default AdminPanel;
