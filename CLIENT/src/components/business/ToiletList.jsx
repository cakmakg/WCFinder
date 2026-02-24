// components/business/ToiletList.jsx
import React from 'react';
import { Paper, Box, Typography, Chip, Tooltip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';

const STATUS = {
  available: { color: '#16a34a', bg: '#dcfce7', label: 'Verfügbar' },
  in_use:    { color: '#d97706', bg: '#fef3c7', label: 'Belegt'    },
  default:   { color: '#dc2626', bg: '#fee2e2', label: 'Außer Betrieb' },
};

export const ToiletList = ({ toilets }) => {
  if (!toilets || toilets.length === 0) return null;

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(8,145,178,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Başlık */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
          Verfügbare Toiletten
        </Typography>
        <Chip
          label={toilets.length}
          size="small"
          sx={{
            height: '22px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: 'rgba(8,145,178,0.08)',
            color: '#0891b2',
            border: '1px solid rgba(8,145,178,0.15)',
          }}
        />
      </Box>

      {/* Tuvalet satırları */}
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {toilets.map((toilet) => {
          const st = STATUS[toilet.status] || STATUS.default;
          const isFree = toilet.fee === 0;

          return (
            <Box
              key={toilet._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                borderLeft: `3px solid ${st.color}`,
                backgroundColor: 'white',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(8,145,178,0.03)',
                  borderColor: 'rgba(8,145,178,0.2)',
                  borderLeftColor: st.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                },
              }}
            >
              {/* Sol: WC İkon */}
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WcIcon sx={{ color: 'white', fontSize: '1.1rem' }} />
              </Box>

              {/* Orta: Bilgi */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {toilet.name}
                </Typography>

                {/* Özellik ikonları */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                  {toilet.features?.isAccessible && (
                    <Tooltip title="Barrierefrei" arrow placement="top">
                      <AccessibleIcon sx={{ fontSize: '0.85rem', color: '#0ea5e9' }} />
                    </Tooltip>
                  )}
                  {toilet.features?.hasBabyChangingStation && (
                    <Tooltip title="Wickelraum" arrow placement="top">
                      <ChildCareIcon sx={{ fontSize: '0.85rem', color: '#a855f7' }} />
                    </Tooltip>
                  )}
                  {!toilet.features?.isAccessible && !toilet.features?.hasBabyChangingStation && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1' }}>—</Typography>
                  )}
                </Box>
              </Box>

              {/* Sağ: Fiyat + Durum */}
              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: isFree ? '#16a34a' : '#0891b2',
                    lineHeight: 1.2,
                  }}
                >
                  {isFree ? 'Kostenlos' : `€${toilet.fee.toFixed(2)}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: 'flex-end', mt: 0.3 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: st.color }} />
                  <Typography sx={{ fontSize: '0.68rem', color: st.color, fontWeight: 600 }}>
                    {st.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
