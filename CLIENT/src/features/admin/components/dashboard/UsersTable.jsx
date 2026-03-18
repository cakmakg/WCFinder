// features/admin/components/dashboard/UsersTable.jsx
// Users table with profiles, statistics, payments and activities

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
  Chip,
  Avatar,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person,
  AttachMoney,
  Event,
} from "@mui/icons-material";

const UsersTable = ({ users, usages, payments, loading }) => {
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!users || !usages || !payments) return {};
    
    const stats = {};
    
    users.forEach((user) => {
      const userId = user._id || user.id;
      const userUsages = usages.filter((u) => (u.userId?._id || u.userId) === userId);
      const userPayments = payments.filter((p) => (p.userId?._id || p.userId) === userId);
      
      const paidPayments = userPayments.filter(
        (p) => p.status === "succeeded" || p.status === "paid"
      );
      
      const totalSpent = paidPayments.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0
      );
      
      const completedUsages = userUsages.filter(
        (u) => u.status === "completed" || u.paymentStatus === "paid"
      );
      
      const pendingUsages = userUsages.filter((u) => u.status === "pending");
      const cancelledUsages = userUsages.filter((u) => u.status === "cancelled");
      
      stats[userId] = {
        totalBookings: userUsages.length,
        completedBookings: completedUsages.length,
        pendingBookings: pendingUsages.length,
        cancelledBookings: cancelledUsages.length,
        totalPayments: userPayments.length,
        successfulPayments: paidPayments.length,
        totalSpent,
        lastActivity: userUsages.length > 0
          ? new Date(Math.max(...userUsages.map((u) => new Date(u.createdAt || u.startTime))))
          : user.createdAt
          ? new Date(user.createdAt)
          : null,
      };
    });
    
    return stats;
  }, [users, usages, payments]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!users) return [];
    
    return users.map((user) => {
      const userId = user._id || user.id;
      const stats = userStats[userId] || {};
      
      return {
        id: userId,
        username: user.username || "N/A",
        email: user.email || "N/A",
        role: user.role || "user",
        isActive: user.isActive !== false,
        createdAt: user.createdAt,
        ...stats,
      };
    });
  }, [users, userStats]);

  const sortedData = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];

    return [...tableData].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle dates
      if (orderBy === "createdAt" || orderBy === "lastActivity") {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [tableData, orderBy, order]);

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

  const toggleRowExpansion = (userId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const formatCurrency = (value) => {
    return `€${Number(value || 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#dc2626";
      case "owner":
        return "#f59e0b";
      default:
        return "#16a34a";
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
        <Typography>Lädt...</Typography>
      </Paper>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
        <Typography color="text.secondary">Keine Benutzer verfügbar</Typography>
      </Paper>
    );
  }

  // Get user details for expanded row
  const getUserDetails = (userId) => {
    const userUsages = usages?.filter((u) => (u.userId?._id || u.userId) === userId) || [];
    const userPayments = payments?.filter((p) => (p.userId?._id || p.userId) === userId) || [];
    return { userUsages, userPayments };
  };

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
          Benutzerverwaltung
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Gesamt {users.length} Benutzer
        </Typography>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "username"}
                  direction={orderBy === "username" ? order : "asc"}
                  onClick={() => handleRequestSort("username")}
                >
                  Benutzer
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "email"}
                  direction={orderBy === "email" ? order : "asc"}
                  onClick={() => handleRequestSort("email")}
                >
                  E-Mail
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "role"}
                  direction={orderBy === "role" ? order : "asc"}
                  onClick={() => handleRequestSort("role")}
                >
                  Rolle
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalBookings"}
                  direction={orderBy === "totalBookings" ? order : "asc"}
                  onClick={() => handleRequestSort("totalBookings")}
                >
                  Buchungen
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalSpent"}
                  direction={orderBy === "totalSpent" ? order : "asc"}
                  onClick={() => handleRequestSort("totalSpent")}
                >
                  Gesamtausgaben
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "createdAt"}
                  direction={orderBy === "createdAt" ? order : "asc"}
                  onClick={() => handleRequestSort("createdAt")}
                >
                  Registrierungsdatum
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "lastActivity"}
                  direction={orderBy === "lastActivity" ? order : "asc"}
                  onClick={() => handleRequestSort("lastActivity")}
                >
                  Letzte Aktivität
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const { userUsages, userPayments } = getUserDetails(row.id);
              const isExpanded = expandedRows[row.id];
              
              return (
                <React.Fragment key={row.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(row.id)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor(row.role) }}>
                          {row.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {row.username}
                          </Typography>
                          {!row.isActive && (
                            <Chip
                              label="Inaktiv"
                              size="small"
                              sx={{ height: 16, fontSize: "0.6rem", mt: 0.5 }}
                              color="error"
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.role === "admin" ? "Admin" : row.role === "owner" ? "Betriebsinhaber" : "Benutzer"}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(row.role)}15`,
                          color: getRoleColor(row.role),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {row.totalBookings}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {row.completedBookings} abgeschlossen
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ color: "#0891b2" }}>
                        {formatCurrency(row.totalSpent)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {row.successfulPayments} Zahlungen
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {formatDate(row.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                        {formatDate(row.lastActivity)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: "#f9fafb" }}>
                          <Grid container spacing={3}>
                            {/* Statistics Cards */}
                            <Grid item xs={12} md={6}>
                              <Card sx={{ mb: 2 }}>
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Statistiken
                                  </Typography>
                                  <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Gesamte Buchungen
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                          {row.totalBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Abgeschlossen
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: "#16a34a" }}>
                                          {row.completedBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Ausstehend
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: "#f59e0b" }}>
                                          {row.pendingBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Storniert
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: "#dc2626" }}>
                                          {row.cancelledBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Payment Summary */}
                            <Grid item xs={12} md={6}>
                              <Card sx={{ mb: 2 }}>
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Zahlungsübersicht
                                  </Typography>
                                  <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                      <Typography variant="body2">Gesamte Zahlungen:</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {row.totalPayments}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                      <Typography variant="body2">Erfolgreiche Zahlungen:</Typography>
                                      <Typography variant="body2" fontWeight={600} sx={{ color: "#16a34a" }}>
                                        {row.successfulPayments}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        Gesamtausgaben:
                                      </Typography>
                                      <Typography variant="h6" fontWeight={700} sx={{ color: "#0891b2" }}>
                                        {formatCurrency(row.totalSpent)}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Recent Payments */}
                            <Grid item xs={12}>
                              <Card>
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Letzte Zahlungen
                                  </Typography>
                                  {userPayments.length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                      {userPayments.slice(0, 5).map((payment) => (
                                        <Box
                                          key={payment._id || payment.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            py: 1.5,
                                            borderBottom: "1px solid #e5e7eb",
                                            "&:last-child": { borderBottom: 0 },
                                          }}
                                        >
                                          <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                              {formatCurrency(payment.amount)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {formatDateTime(payment.createdAt)}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ textAlign: "right" }}>
                                            <Chip
                                              label={
                                                payment.status === "succeeded" || payment.status === "paid"
                                                  ? "Erfolgreich"
                                                  : payment.status === "pending"
                                                  ? "Ausstehend"
                                                  : payment.status
                                              }
                                              size="small"
                                              sx={{
                                                bgcolor:
                                                  payment.status === "succeeded" || payment.status === "paid"
                                                    ? "#16a34a15"
                                                    : payment.status === "pending"
                                                    ? "#f59e0b15"
                                                    : "#dc262615",
                                                color:
                                                  payment.status === "succeeded" || payment.status === "paid"
                                                    ? "#16a34a"
                                                    : payment.status === "pending"
                                                    ? "#f59e0b"
                                                    : "#dc2626",
                                              }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                              {payment.paymentMethod || "N/A"}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      ))}
                                      {userPayments.length > 5 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                          +{userPayments.length - 5} weitere Zahlungen
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Noch keine Zahlungen vorhanden
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Recent Activities */}
                            <Grid item xs={12}>
                              <Card>
                                <CardContent>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Letzte Buchungen
                                  </Typography>
                                  {userUsages.length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                      {userUsages.slice(0, 5).map((usage) => (
                                        <Box
                                          key={usage._id || usage.id}
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            py: 1.5,
                                            borderBottom: "1px solid #e5e7eb",
                                            "&:last-child": { borderBottom: 0 },
                                          }}
                                        >
                                          <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                              {usage.businessId?.businessName || 
                                               usage.businessId?.name || 
                                               usage.businessName || 
                                               "Betrieb"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {formatDateTime(usage.startTime || usage.createdAt)}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ textAlign: "right" }}>
                                            <Typography variant="body2" fontWeight={600}>
                                              {formatCurrency(usage.totalFee)}
                                            </Typography>
                                            <Chip
                                              label={
                                                usage.status === "completed"
                                                  ? "Abgeschlossen"
                                                  : usage.status === "pending"
                                                  ? "Ausstehend"
                                                  : usage.status === "confirmed"
                                                  ? "Bestätigt"
                                                  : usage.status === "cancelled"
                                                  ? "Storniert"
                                                  : usage.status
                                              }
                                              size="small"
                                              sx={{
                                                mt: 0.5,
                                                bgcolor:
                                                  usage.status === "completed"
                                                    ? "#16a34a15"
                                                    : usage.status === "pending"
                                                    ? "#f59e0b15"
                                                    : usage.status === "cancelled"
                                                    ? "#dc262615"
                                                    : "#0891b215",
                                                color:
                                                  usage.status === "completed"
                                                    ? "#16a34a"
                                                    : usage.status === "pending"
                                                    ? "#f59e0b"
                                                    : usage.status === "cancelled"
                                                    ? "#dc2626"
                                                    : "#0891b2",
                                              }}
                                            />
                                          </Box>
                                        </Box>
                                      ))}
                                      {userUsages.length > 5 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                          +{userUsages.length - 5} weitere Buchungen
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Noch keine Buchungen vorhanden
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
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
        labelRowsPerPage="Zeilen pro Seite:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default UsersTable;

