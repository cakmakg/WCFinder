// features/admin/components/PayoutDialog.jsx
// Payout creation dialog component

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const PayoutDialog = ({
  open,
  onClose,
  selectedBusiness,
  payoutAmount,
  payoutMethod,
  payoutNotes,
  onAmountChange,
  onMethodChange,
  onNotesChange,
  onCreate,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("adminPanel.createPayout")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={t("adminPanel.businessName")}
            value={selectedBusiness?.businessName || ""}
            disabled
            fullWidth
          />
          <TextField
            label={t("adminPanel.amount")}
            type="number"
            value={payoutAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={t("adminPanel.paymentMethod")}
            select
            value={payoutMethod}
            onChange={(e) => onMethodChange(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="bank_transfer">{t("adminPanel.bankTransfer")}</option>
            <option value="manual">{t("adminPanel.manual")}</option>
          </TextField>
          <TextField
            label={t("adminPanel.notes")}
            value={payoutNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={onCreate} variant="contained" sx={{ bgcolor: "#0891b2" }}>
          {t("adminPanel.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayoutDialog;

