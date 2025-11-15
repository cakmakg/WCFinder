// features/admin/components/MonthlySummaryTab.jsx
// Monthly summary tab component

import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const MonthlySummaryTab = ({
  monthlySummary,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onLoad,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          type="number"
          label={t("adminPanel.year")}
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          size="small"
          sx={{ width: 120 }}
        />
        <TextField
          type="number"
          label={t("adminPanel.month")}
          value={selectedMonth}
          onChange={(e) => onMonthChange(parseInt(e.target.value))}
          size="small"
          inputProps={{ min: 1, max: 12 }}
          sx={{ width: 120 }}
        />
        <Button variant="outlined" onClick={onLoad}>
          {t("adminPanel.load")}
        </Button>
      </Box>

      {monthlySummary && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: "#f8fafc" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t("adminPanel.summary")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>{t("adminPanel.totalRevenue")}:</Typography>
                  <Typography fontWeight={600}>
                    € {monthlySummary.summary?.totalRevenue?.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>{t("adminPanel.platformFee")}:</Typography>
                  <Typography fontWeight={600}>
                    € {monthlySummary.summary?.totalPlatformFee?.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>{t("adminPanel.businessFee")}:</Typography>
                  <Typography fontWeight={600}>
                    € {monthlySummary.summary?.totalBusinessFee?.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>{t("adminPanel.paymentCount")}:</Typography>
                  <Typography fontWeight={600}>
                    {monthlySummary.summary?.paymentCount}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, bgcolor: "#f8fafc" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t("adminPanel.businessBreakdown")}
              </Typography>
              {monthlySummary.businessBreakdown &&
              monthlySummary.businessBreakdown.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {t("adminPanel.businessName")}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {t("adminPanel.revenue")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlySummary.businessBreakdown.map((business) => (
                        <TableRow key={business.businessId}>
                          <TableCell>{business.businessName}</TableCell>
                          <TableCell align="right">
                            € {business.businessFee?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">
                  {t("adminPanel.noData")}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MonthlySummaryTab;

