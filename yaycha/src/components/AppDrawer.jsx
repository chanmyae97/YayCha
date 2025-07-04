import { useNavigate } from "react-router-dom";

import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  useTheme,
} from "@mui/material";

import {
  Home as HomeIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  PersonAdd as RegisterIcon,
  Login as LoginIcon,
} from "@mui/icons-material";

import { useApp } from "../ThemedApp";

const api = import.meta.env.VITE_API;

// Helper function to get the correct image URL
const getImageUrl = (imageField) => {
  if (!imageField) return null;
  // Check if it's an external URL (starts with http/https)
  if (imageField.startsWith("http")) {
    return imageField;
  }
  // Otherwise, it's a local file
  return `${api}/uploads/${imageField}`;
};

export default function AppDrawer() {
  const { showDrawer, setShowDrawer, auth, setAuth } = useApp();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigation = (path) => {
    navigate(path);
    setShowDrawer(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(null);
    navigate("/");
    setShowDrawer(false);
  };

  const profilePictureUrl = getImageUrl(auth?.profilePicture);
  const coverPhotoUrl = getImageUrl(auth?.coverPhoto);

  return (
    <Drawer
      open={showDrawer}
      onClose={() => setShowDrawer(false)}
      PaperProps={{
        sx: {
          backgroundColor:
            theme.palette.mode === "light"
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <Box
        sx={{
          width: 320,
          height: 180,
          position: "relative",
          background: coverPhotoUrl
            ? `url(${coverPhotoUrl}) center/cover no-repeat`
            : theme.palette.mode === "light"
            ? "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)"
            : "linear-gradient(135deg, #FE6B8B 0%, #FF8E53 100%)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: coverPhotoUrl
              ? "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))"
              : "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 24,
            bottom: -32,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Avatar
            src={profilePictureUrl}
            alt={auth ? auth.name : "Guest"}
            sx={{
              width: 80,
              height: 80,
              border: "4px solid",
              borderColor: theme.palette.background.paper,
              boxShadow: theme.shadows[4],
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            {auth ? auth.name[0].toUpperCase() : "G"}
          </Avatar>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              fontSize: "1.2rem",
            }}
          >
            {auth ? auth.name : "Guest"}
          </Typography>
        </Box>
      </Box>

      <List sx={{ mt: 4, px: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("/")}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(33, 150, 243, 0.08)"
                    : "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            <ListItemIcon>
              <HomeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Home"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {auth ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(`/profile/${auth.id}`)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(33, 150, 243, 0.08)"
                        : "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon>
                  <ProfileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Profile"
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: theme.palette.error.main,
                  "&:hover": {
                    backgroundColor: theme.palette.error.main + "14",
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: "inherit",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation("/register")}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(33, 150, 243, 0.08)"
                        : "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon>
                  <RegisterIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Register"
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation("/login")}
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(33, 150, 243, 0.08)"
                        : "rgba(255, 255, 255, 0.08)",
                  },
                }}
              >
                <ListItemIcon>
                  <LoginIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Login"
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );
}
