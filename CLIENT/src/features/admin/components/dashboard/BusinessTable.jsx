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
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
        <Typography>Lädt...</Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
        <Typography color="text.secondary">Keine Daten verfügbar</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid #e5e7eb" }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "#111827", fontSize: "1rem" }}>
          İşletme Satışları
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "businessName"}
                  direction={orderBy === "businessName" ? order : "asc"}
                  onClick={() => handleRequestSort("businessName")}
                >
                  İşletme Adı
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "owner"}
                  direction={orderBy === "owner" ? order : "asc"}
                  onClick={() => handleRequestSort("owner")}
                >
                  Sahip
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "dailySales"}
                  direction={orderBy === "dailySales" ? order : "asc"}
                  onClick={() => handleRequestSort("dailySales")}
                >
                  Günlük Satış
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "monthlySales"}
                  direction={orderBy === "monthlySales" ? order : "asc"}
                  onClick={() => handleRequestSort("monthlySales")}
                >
                  Aylık Satış
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalSales"}
                  direction={orderBy === "totalSales" ? order : "asc"}
                  onClick={() => handleRequestSort("totalSales")}
                >
                  Toplam Satış
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.businessName}</TableCell>
                <TableCell>{row.owner}</TableCell>
                <TableCell align="right">{formatCurrency(row.dailySales)}</TableCell>
                <TableCell align="right">{formatCurrency(row.monthlySales)}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>{formatCurrency(row.totalSales)}</Typography>
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
        labelRowsPerPage="Sayfa başına:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default BusinessTable;

