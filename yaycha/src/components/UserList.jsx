import {
  Box,
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  Divider,
  useTheme,
} from "@mui/material";

import FollowButton from "./FollowButton";

import { useNavigate } from "react-router-dom";

export default function UserList({ title, data }) {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        {typeof title === "string" ? (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </Typography>
        ) : (
          title
        )}
      </Box>

      <List sx={{ p: 0 }}>
        {data.map((item, index) => (
          <Box key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(`/profile/${item.user.id}`);
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: "white",
                    }}
                  >
                    {item.user.name[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.user.name}
                  secondary={item.user.bio || "No bio"}
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                  secondaryTypographyProps={{
                    sx: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    },
                  }}
                />
                <ListItemSecondaryAction>
                  <FollowButton user={item.user} />
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
            {index < data.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
