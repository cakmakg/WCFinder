// features/admin/components/dashboard/RecentActivities.jsx
// Liste der letzten Aktivitäten

import React from "react";
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import { COLORS, RADII, SHADOWS } from "../../../../theme/designTokens";

const panelSx = {
  p: 2.5,
  borderRadius: RADII.panel,
  boxShadow: SHADOWS.subtle,
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.backgroundWhite,
  height: "100%",
};

const titleSx = {
  fontWeight: 800,
  color: COLORS.textHeading,
  letterSpacing: "-0.02em",
  fontSize: "1rem",
  mb: 2,
};

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Paper sx={panelSx}>
        <Typography variant="h6" sx={titleSx}>
          Letzte Aktivitäten
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          Keine Aktivitäten verfügbar
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        ...panelSx,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" sx={titleSx}>
        Letzte Aktivitäten
      </Typography>
      <List sx={{ flex: 1, overflow: "auto", p: 0 }}>
        {activities.slice(0, 10).map((activity, index) => (
          <React.Fragment key={activity._id || activity.id || `${activity.type}-${activity.date}`}>
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
                  label={activity.type === "usage" ? "Buchung" : "Betrieb"}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    borderRadius: "999px",
                    bgcolor: activity.type === "usage" ? COLORS.accentBoxBg : "#ecfdf5",
                    color: activity.type === "usage" ? COLORS.primary : "#059669",
                  }}
                />
                {activity.amount && (
                  <Typography
                    variant="caption"
                    sx={{
                      ml: "auto",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                      color: COLORS.primary,
                    }}
                  >
                    €{Number(activity.amount).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: COLORS.textPrimary, mb: 0.5 }}>
                {activity.description}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 12, color: COLORS.textLight }} />
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: "0.7rem" }}>
                  {activity.timestamp}
                </Typography>
              </Box>
            </ListItem>
            {index < activities.length - 1 && index < 9 && <Divider sx={{ borderColor: COLORS.border }} />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RecentActivities;
