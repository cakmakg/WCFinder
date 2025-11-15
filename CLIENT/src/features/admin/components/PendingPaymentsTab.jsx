// features/admin/components/PendingPaymentsTab.jsx
// Pending payments tab component

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import { useTranslation } from "react-i18next";

const PendingPaymentsTab = ({
  pendingPayments,
  onCreatePayout,
}) => {
  const { t } = useTranslation();

  if (!pendingPayments?.businesses || pendingPayments.businesses.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        {t("adminPanel.noPendingPayments")}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t("adminPanel.pendingPayments")}
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("adminPanel.businessName")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("adminPanel.pendingAmount")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("adminPanel.paymentCount")}
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {t("adminPanel.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingPayments.businesses.map((business) => (
              <TableRow
                key={business.businessId}
                sx={{ "&:hover": { bgcolor: "#f8fafc" } }}
              >
                <TableCell sx={{ fontWeight: 500 }}>
                  {business.businessName}
                </TableCell>
                <TableCell>€ {business.totalPending?.toFixed(2)}</TableCell>
                <TableCell>{business.paymentCount}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PaymentIcon />}
                    onClick={() => onCreatePayout(business)}
                    sx={{
                      bgcolor: "#0891b2",
                      "&:hover": { bgcolor: "#0e7490" },
                    }}
                  >
                    {t("adminPanel.createPayout")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingPaymentsTab;

