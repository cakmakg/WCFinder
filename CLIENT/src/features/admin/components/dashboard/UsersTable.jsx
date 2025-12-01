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
          Kullanıcı Yönetimi
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Toplam {users.length} kullanıcı
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
                  Kullanıcı
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
                  Rol
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalBookings"}
                  direction={orderBy === "totalBookings" ? order : "asc"}
                  onClick={() => handleRequestSort("totalBookings")}
                >
                  Rezervasyonlar
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "totalSpent"}
                  direction={orderBy === "totalSpent" ? order : "asc"}
                  onClick={() => handleRequestSort("totalSpent")}
                >
                  Toplam Harcama
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "createdAt"}
                  direction={orderBy === "createdAt" ? order : "asc"}
                  onClick={() => handleRequestSort("createdAt")}
                >
                  Kayıt Tarihi
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "lastActivity"}
                  direction={orderBy === "lastActivity" ? order : "asc"}
                  onClick={() => handleRequestSort("lastActivity")}
                >
                  Son Aktivite
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
                              label="Pasif"
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
                        label={row.role === "admin" ? "Admin" : row.role === "owner" ? "İşletme Sahibi" : "Kullanıcı"}
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
                        {row.completedBookings} tamamlandı
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ color: "#0891b2" }}>
                        {formatCurrency(row.totalSpent)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {row.successfulPayments} ödeme
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
                                    İstatistikler
                                  </Typography>
                                  <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Toplam Rezervasyon
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                          {row.totalBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Tamamlanan
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: "#16a34a" }}>
                                          {row.completedBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          Bekleyen
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: "#f59e0b" }}>
                                          {row.pendingBookings}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          İptal Edilen
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
                                    Ödeme Özeti
                                  </Typography>
                                  <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                      <Typography variant="body2">Toplam Ödeme:</Typography>
                                      <Typography variant="body2" fontWeight={600}>
                                        {row.totalPayments}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                      <Typography variant="body2">Başarılı Ödeme:</Typography>
                                      <Typography variant="body2" fontWeight={600} sx={{ color: "#16a34a" }}>
                                        {row.successfulPayments}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        Toplam Harcama:
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
                                    Son Ödemeler
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
                                                  ? "Başarılı"
                                                  : payment.status === "pending"
                                                  ? "Bekliyor"
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
                                          +{userPayments.length - 5} daha fazla ödeme
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Henüz ödeme yapılmamış
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
                                    Son Rezervasyonlar
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
                                               "İşletme"}
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
                                                  ? "Tamamlandı"
                                                  : usage.status === "pending"
                                                  ? "Bekliyor"
                                                  : usage.status === "confirmed"
                                                  ? "Onaylandı"
                                                  : usage.status === "cancelled"
                                                  ? "İptal"
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
                                          +{userUsages.length - 5} daha fazla rezervasyon
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Henüz rezervasyon yapılmamış
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
        labelRowsPerPage="Sayfa başına:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
    </Paper>
  );
};

export default UsersTable;

