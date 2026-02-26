/**
 * useOwnerStats Hook
 *
 * Fetches owner dashboard statistics:
 * - Today's bookings and revenue
 * - This month's bookings and revenue
 * - Pending payout balance
 *
 * Only fetches when `enabled` is true (user is owner/admin).
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export interface OwnerStats {
  todayBookings: number;
  todayRevenue: number;
  monthBookings: number;
  monthRevenue: number;
  pendingPayout: number;
}

export const useOwnerStats = (enabled: boolean) => {
  const [stats, setStats] = useState<OwnerStats>({
    todayBookings: 0,
    todayRevenue: 0,
    monthBookings: 0,
    monthRevenue: 0,
    pendingPayout: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const [statsRes, payoutRes] = await Promise.allSettled([
        api.get('/business/my-stats'),
        api.get('/business-payouts/my-summary'),
      ]);

      // Parse my-stats
      let todayBookings = 0;
      let todayRevenue = 0;
      let monthBookings = 0;
      let monthRevenue = 0;

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data?.result || statsRes.value.data || {};
        const byDay: { _id: string; count: number; revenue: number }[] =
          data?.usage?.byDay || data?.byDay || [];

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth(); // 0-indexed

        byDay.forEach((day) => {
          const dayDate = new Date(day._id);
          const dayStr = dayDate.toISOString().slice(0, 10);

          // Today
          if (dayStr === todayStr) {
            todayBookings += day.count || 0;
            todayRevenue += day.revenue || 0;
          }

          // This month
          if (
            dayDate.getFullYear() === thisYear &&
            dayDate.getMonth() === thisMonth
          ) {
            monthBookings += day.count || 0;
            monthRevenue += day.revenue || 0;
          }
        });
      }

      // Parse payout summary
      let pendingPayout = 0;
      if (payoutRes.status === 'fulfilled') {
        const pd = payoutRes.value.data?.result || payoutRes.value.data || {};
        pendingPayout =
          pd.pendingBalance ??
          pd.netRevenue ??
          pd.totalEarned ??
          0;
      }

      setStats({ todayBookings, todayRevenue, monthBookings, monthRevenue, pendingPayout });
    } catch (err: any) {
      setError(err.message || 'Statistiken konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};
