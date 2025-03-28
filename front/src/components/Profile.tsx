import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{ width: 100, height: 100, mb: 2 }}
          src={user.user_metadata?.avatar_url}
        >
          {user.email?.[0].toUpperCase()}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItem>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText
            primary="Email"
            secondary={user.email}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText
            primary="User ID"
            secondary={user.id}
          />
        </ListItem>
        {user.user_metadata && Object.entries(user.user_metadata).map(([key, value]) => (
          <ListItem key={key}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
              secondary={value as string}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Profile; 