// src/components/layout/Sidebar/NavigationMenu.jsx
import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

export const NavigationMenu = ({ onNavigate, theme }) => {
  const navigationItems = [
    {
      text: 'İşletmeler',
      icon: <BusinessIcon />,
      path: '/',
      active: true
    }
  ];

  return (
    <List sx={{ px: 1, py: 2 }}>
      {navigationItems.map((item, index) => (
        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => onNavigate(item.path)}
            sx={{
              borderRadius: 2,
              py: 1,
              backgroundColor: item.active ? theme.palette.primary.main + '15' : 'transparent',
              color: item.active ? theme.palette.primary.main : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.main + '10',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: item.active ? 600 : 400
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};