import {
  Box,
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

export default function UserList({ title }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <List>
        <ListItem>
          <ListItemAvatar>
            <Avatar />
          </ListItemAvatar>
          <ListItemText
            primary="Alice @alice"
            secondary="Alice's profile bio"
          />
        </ListItem>
      </List>
    </Box>
  );
}
