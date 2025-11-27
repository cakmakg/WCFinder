// features/admin/components/dashboard/RecentActivities.jsx
// Recent activities component

import React from "react";
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          backgroundColor: "white",
          height: "100%",
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ color: "#111827", fontSize: "1rem", mb: 2 }}>
          Son Aktiviteler
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keine Aktivitäten verfügbar
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" fontWeight={600} sx={{ color: "#111827", fontSize: "1rem", mb: 2 }}>
        Son Aktiviteler
      </Typography>
      <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
        {activities.slice(0, 10).map((activity, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{
                px: 0,
                py: 1.5,
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, width: "100%" }}>
                <Chip
                  label={activity.type === "usage" ? "Rezervasyon" : "İşletme"}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    bgcolor: activity.type === "usage" ? "#0891b215" : "#10b98115",
                    color: activity.type === "usage" ? "#0891b2" : "#10b981",
                  }}
                />
                {activity.amount && (
                  <Typography variant="caption" fontWeight={600} sx={{ ml: "auto", color: "#0891b2" }}>
                    €{Number(activity.amount).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: "#111827", mb: 0.5 }}>
                {activity.description}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 12, color: "#9ca3af" }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  {activity.timestamp}
                </Typography>
              </Box>
            </ListItem>
            {index < activities.length - 1 && index < 9 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RecentActivities;

