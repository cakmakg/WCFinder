// features/admin/components/shared/ExportButton.jsx
// Unified export button with format selection

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useExport } from '../../hooks/useExport';

/**
 * ExportButton Component
 * Unified button for exporting data in multiple formats
 */
const ExportButton = ({
  data,
  columns,
  filename = 'export',
  title = 'Export',
  formats = ['excel', 'pdf', 'csv'],
  disabled = false,
  size = 'medium',
  variant = 'outlined',
  color = 'primary',
  showIcon = true,
  showLabel = true,
  onExportStart,
  onExportComplete,
  onExportError,
  sx = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { exporting, exportData } = useExport();
  const open = Boolean(anchorEl);

  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle export
  const handleExport = async (format) => {
    handleClose();

    if (!data || data.length === 0) {
      if (onExportError) {
        onExportError(new Error('Keine Daten zum Exportieren vorhanden'));
      }
      return;
    }

    try {
      if (onExportStart) {
        onExportStart(format);
      }

      await exportData(data, columns, {
        format,
        filename,
        title,
        showToast: true
      });

      if (onExportComplete) {
        onExportComplete(format);
      }
    } catch (error) {
      if (onExportError) {
        onExportError(error);
      }
    }
  };

  // Format configurations
  const formatConfig = {
    excel: {
      label: 'Excel (.xlsx)',
      icon: <TableChartIcon fontSize="small" />,
      color: '#10b981'
    },
    pdf: {
      label: 'PDF (.pdf)',
      icon: <PictureAsPdfIcon fontSize="small" />,
      color: '#dc2626'
    },
    csv: {
      label: 'CSV (.csv)',
      icon: <DescriptionIcon fontSize="small" />,
      color: '#f59e0b'
    }
  };

  // Get available formats
  const availableFormats = formats.filter(format => formatConfig[format]);

  // Check if data is available
  const hasData = data && data.length > 0;
  const isDisabled = disabled || !hasData || exporting;

  return (
    <>
      <Tooltip
        title={
          !hasData
            ? 'Keine Daten zum Exportieren'
            : exporting
            ? 'Export läuft...'
            : 'Daten exportieren'
        }
      >
        <span>
          <Button
            variant={variant}
            color={color}
            size={size}
            onClick={handleClick}
            disabled={isDisabled}
            startIcon={
              exporting ? (
                <CircularProgress size={16} />
              ) : showIcon ? (
                <FileDownloadIcon />
              ) : null
            }
            endIcon={!exporting && <ExpandMoreIcon />}
            sx={sx}
          >
            {exporting ? 'Exportiere...' : showLabel ? 'Exportieren' : ''}
          </Button>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {availableFormats.map((format) => (
          <MenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={exporting}
          >
            <ListItemIcon sx={{ color: formatConfig[format].color }}>
              {formatConfig[format].icon}
            </ListItemIcon>
            <ListItemText>{formatConfig[format].label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ExportButton;
