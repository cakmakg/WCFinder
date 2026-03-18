// src/components/map/MarkerPopup.jsx
import { Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, Tooltip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const STATUS_CONFIG = {
  available: { color: '#16a34a', label: 'Verfügbar' },
  in_use:    { color: '#d97706', label: 'Belegt'    },
  default:   { color: '#dc2626', label: 'Außer Betrieb' },
};

export const MarkerPopup = ({ toiletItem }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.auth);

  const handlePopupClick = () => {
    if (!currentUser || !token) {
      navigate('/', {
        state: {
          openLoginModal: true,
          from: `/business/${toiletItem.business._id}`,
          businessName: toiletItem.business.businessName,
        },
      });
      return;
    }
    navigate(`/business/${toiletItem.business._id}`);
  };

  const status = STATUS_CONFIG[toiletItem.status] || STATUS_CONFIG.default;
  const isFree = toiletItem.fee === 0;
  const hasAccessible = toiletItem.features?.isAccessible;
  const hasBaby = toiletItem.features?.hasBabyChangingStation;

  return (
    <Popup maxWidth={300} minWidth={260}>
      <Box
        onClick={handlePopupClick}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          width: 260,
          userSelect: 'none',
          py: 0.25,
        }}
      >
        {/* ── Sol: WC İkon ── */}
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

        {/* ── Orta: Bilgi ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Üst satır: İşletme adı */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#0f172a',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {toiletItem.business.businessName}
          </Typography>

          {/* Alt satır: Tuvalet adı · durum · ikonlar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3, flexWrap: 'nowrap' }}>
            <Typography
              sx={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 80,
                flexShrink: 1,
              }}
            >
              {toiletItem.name}
            </Typography>

            <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#e2e8f0', flexShrink: 0 }} />

            {/* Durum */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: status.color }} />
              <Typography sx={{ fontSize: '0.68rem', color: status.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {status.label}
              </Typography>
            </Box>

            {/* Özellik ikonları */}
            {hasAccessible && (
              <Tooltip title="Barrierefrei" arrow placement="top">
                <AccessibleIcon sx={{ fontSize: '0.75rem', color: '#0ea5e9', flexShrink: 0 }} />
              </Tooltip>
            )}
            {hasBaby && (
              <Tooltip title="Wickelraum" arrow placement="top">
                <ChildCareIcon sx={{ fontSize: '0.75rem', color: '#a855f7', flexShrink: 0 }} />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* ── Sağ: Fiyat + Arrow ── */}
        <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: isFree ? '#16a34a' : '#0891b2',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isFree ? t('map.free', 'Kostenlos') : `${toiletItem.fee?.toFixed(2)} €`}
          </Typography>

          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: '0.5rem', color: 'white' }} />
          </Box>
        </Box>
      </Box>
    </Popup>
  );
};
