// features/admin/components/dashboard/BusinessTable.jsx
// Business table with sorting and pagination

import React, { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Typography,
  Box,
} from "@mui/material";
import { COLORS, RADII, SHADOWS } from "../../../../theme/designTokens";

const BusinessTable = ({ data, loading }) => {
  const [orderBy, setOrderBy] = useState("totalSales");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return [...data].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [data, orderBy, order]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (value) => {
    return `€${Number(value).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: RADII.panel, boxShadow: SHADOWS.subtle, border: `1px solid ${COLORS.border}` }}>
        <Typography>Lädt...</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: RADII.panel, boxShadow: SHADOWS.subtle, border: `1px solid ${COLORS.border}` }}>
        <Typography sx={{ color: COLORS.textSecondary }}>Keine Daten verfügbar</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: RADII.panel,
        boxShadow: SHADOWS.subtle,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.backgroundWhite,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${COLORS.border}` }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: "-0.02em", fontSize: "1rem" }}>
          Betriebsumsätze
        </Typography>
      </Box>
      <TableContainer>
        <Table
          sx={{
            "& .MuiTableHead-root .MuiTableCell-root": {
              backgroundColor: COLORS.backgroundLight,
              fontWeight: 600,
              color: COLORS.textSecondary,
              borderBottom: `1px solid ${COLORS.border}`,
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              borderBottom: `1px solid ${COLORS.border}`,
            },
            "& .MuiTableBody-root .MuiTableRow-hover:hover": {
              backgroundColor: COLORS.backgroundLight,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "businessName"}
                  direction={orderBy === "businessName" ? order : "asc"}
                  onClick={() => handleRequestSort("businessName")}
                >
                  Betriebsname
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "owner"}
                  direction={orderBy === "owner" ? order : "asc"}
                  onClick={() => handleRequestSort("owner")}
                >
                  Inhaber
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "dailySales"}
                  direction={orderBy === "dailySales" ? order : "asc"}
                  onClick={() => handleRequestSort("dailySales")}
                >
                  Tagesumsatz
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "monthlySales"}
                  direction={orderBy === "monthlySales" ? order : "asc"}
                  onClick={() => handleRequestSort("monthlySales")}
                >
                  Monatsumsatz
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalSales"}
                  direction={orderBy === "totalSales" ? order : "asc"}
                  onClick={() => handleRequestSort("totalSales")}
                >
                  Gesamtumsatz
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.businessName}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(row.dailySales)}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(row.monthlySales)}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600} sx={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(row.totalSales)}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={sortedData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Pro Seite:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default BusinessTable;

