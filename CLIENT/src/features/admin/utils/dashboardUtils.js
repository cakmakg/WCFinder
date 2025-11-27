// features/admin/utils/dashboardUtils.js
// Dashboard utility functions

export const calculateBusinessSales = (business, usages) => {
  const businessUsages = usages.filter((usage) => {
    const usageBusinessId = usage.businessId?._id?.toString() || usage.businessId?.toString() || usage.businessId;
    const businessId = business._id?.toString() || business._id;
    return usageBusinessId === businessId;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const dailySales = businessUsages
    .filter((u) => {
      const usageDate = new Date(u.startTime || u.createdAt);
      return usageDate >= today && usageDate <= todayEnd;
    })
    .reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

  const monthlySales = businessUsages
    .filter((u) => {
      const usageDate = new Date(u.startTime || u.createdAt);
      return usageDate >= monthStart && usageDate <= monthEnd;
    })
    .reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

  const totalSales = businessUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

  let ownerName = "Unbekannt";
  if (business.owner) {
    if (typeof business.owner === 'object' && business.owner !== null) {
      ownerName = business.owner.username || business.owner.name || business.owner.email || "Unbekannt";
    } else if (typeof business.owner === 'string') {
      ownerName = business.owner;
    }
  }

  return {
    id: business._id?.toString() || business._id,
    businessName: business.businessName || "Unbekannt",
    owner: ownerName,
    category: business.businessType || "Andere",
    dailySales,
    monthlySales,
    totalSales,
    status: business.approvalStatus === "approved" ? "Aktiv" : business.approvalStatus === "pending" ? "Ausstehend" : "Abgelehnt",
  };
};

export const generateMonthlyTrend = (usages, users, businesses) => {
  const monthlyTrend = [];
  const now = new Date();
  const germanMonths = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  const paidUsages = usages.filter((u) => u.paymentStatus === "paid" || u.status === "completed");

  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    const monthPaidUsages = paidUsages.filter((u) => {
      const usageDate = new Date(u.startTime || u.createdAt);
      if (isNaN(usageDate.getTime())) return false;
      return usageDate >= monthStart && usageDate <= monthEnd;
    });

    const monthRevenue = monthPaidUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);

    monthlyTrend.push({
      month: germanMonths[monthDate.getMonth()],
      revenue: monthRevenue,
      name: germanMonths[monthDate.getMonth()],
      value: monthRevenue,
    });
  }

  return monthlyTrend;
};

export const generateRecentActivity = (usages, businesses) => {
  const recentUsages = usages
    .filter((u) => u.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((usage) => {
      const businessId = usage.businessId?._id || usage.businessId?.toString() || usage.businessId;
      const business = businesses.find(
        (b) => b._id?.toString() === businessId?.toString() || b._id === businessId
      );
      return {
        type: "usage",
        description: `${business?.businessName || "Unbekannt"} - Reservierung`,
        timestamp: new Date(usage.createdAt).toLocaleString("de-DE"),
        amount: Number(usage.totalFee) || 0,
      };
    });

  const recentBusinesses = businesses
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((business) => ({
      type: "business",
      description: `Neues Unternehmen: ${business.businessName}`,
      timestamp: new Date(business.createdAt).toLocaleString("de-DE"),
    }));

  return [...recentUsages, ...recentBusinesses]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
};

export const generatePieChartData = (businesses) => {
  const statusCounts = {
    approved: 0,
    pending: 0,
    rejected: 0,
  };

  businesses.forEach((business) => {
    const status = business.approvalStatus;
    if (status === "approved") statusCounts.approved++;
    else if (status === "pending") statusCounts.pending++;
    else if (status === "rejected") statusCounts.rejected++;
  });

  return [
    {
      name: "Genehmigt",
      value: statusCounts.approved,
      color: "#3b82f6",
    },
    {
      name: "Ausstehend",
      value: statusCounts.pending,
      color: "#10b981",
    },
    {
      name: "Abgelehnt",
      value: statusCounts.rejected,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);
};

