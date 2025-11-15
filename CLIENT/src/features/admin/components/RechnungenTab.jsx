// features/admin/components/RechnungenTab.jsx
// Rechnungen tab component

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTranslation } from "react-i18next";

const RechnungenTab = ({
  businessesWithPayouts,
  creatingRechnung,
  onCreateRechnung,
  onDownloadRechnung,
}) => {
  const { t } = useTranslation();

  if (businessesWithPayouts.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        {t("adminPanel.noBusinessesWithPayouts")}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {t("adminPanel.rechnungen")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {businessesWithPayouts.map((business) => (
          <Paper
            key={business._id}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
            }}
          >
            {/* Business Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {business.businessName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {business.businessType} • {business.address?.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Owner: {business.owner?.username} ({business.owner?.email})
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("adminPanel.totalPaidOut")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#16a34a" }}>
                  € {business.totalPaidOut?.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Payouts List */}
            {business.payouts && business.payouts.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {t("adminPanel.payoutDate")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {t("adminPanel.amount")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {t("adminPanel.period")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {t("adminPanel.rechnungStatus")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        {t("adminPanel.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {business.payouts.map((payout) => (
                      <TableRow
                        key={payout._id}
                        sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
                      >
                        <TableCell>
                          {new Date(payout.createdAt).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          € {payout.amount?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {payout.period?.startDate && payout.period?.endDate
                            ? `${new Date(
                                payout.period.startDate
                              ).toLocaleDateString("de-DE")} - ${new Date(
                                payout.period.endDate
                              ).toLocaleDateString("de-DE")}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {payout.hasRechnung ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label={
                                payout.rechnungsnummer ||
                                t("adminPanel.rechnungExists")
                              }
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label={t("adminPanel.noRechnung")}
                              color="warning"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            {payout.hasRechnung ? (
                              <Tooltip title={t("adminPanel.downloadPDF")}>
                                <IconButton
                                  size="small"
                                  onClick={() => onDownloadRechnung(payout.rechnungId)}
                                  sx={{ color: "#0891b2" }}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<ReceiptIcon />}
                                onClick={() => onCreateRechnung(payout._id)}
                                disabled={creatingRechnung === payout._id}
                                sx={{
                                  bgcolor: "#0891b2",
                                  "&:hover": { bgcolor: "#0e7490" },
                                }}
                              >
                                {creatingRechnung === payout._id
                                  ? t("adminPanel.creating")
                                  : t("adminPanel.createRechnung")}
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                {t("adminPanel.noPayouts")}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default RechnungenTab;

