import { useApp } from "../ThemedApp";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Container,
  useTheme,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Add as AddIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Search as SearchIcon,
  Notifications as NotiIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchNotis } from "../libs/fetcher";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const {
    showForm,
    setShowForm,
    mode,
    setMode,
    showDrawer,
    setShowDrawer,
    auth,
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isHomePage = location.pathname === "/";
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    isLoading,
    isError,
    data = [],
  } = useQuery({
    queryKey: ["notis", auth],
    queryFn: fetchNotis,
    enabled: !!auth,
  });

  function notiCount() {
    if (!auth) return 0;
    if (isLoading || isError) return 0;
    return data.filter((noti) => !noti.read).length;
  }

  const handleNotiClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotiClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: "64px" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "100%",
          zIndex: 1100,
          backgroundColor: theme.palette.mode === "light" ? "#fff" : "#121212",
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.mode === "light" ? "#1a1a1a" : "#fff",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setShowDrawer(!showDrawer)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => navigate("/")}
            >
              Social
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {isHomePage && (
                <IconButton
                  color="inherit"
                  onClick={() => setShowForm(!showForm)}
                >
                  <AddIcon />
                </IconButton>
              )}

              <IconButton color="inherit" onClick={() => navigate("/search")}>
                <SearchIcon />
              </IconButton>

              {auth && (
                <IconButton color="inherit" onClick={handleNotiClick}>
                  <Badge color="error" badgeContent={notiCount()}>
                    <NotiIcon />
                  </Badge>
                </IconButton>
              )}

              <IconButton
                color="inherit"
                edge="end"
                onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <NotificationDropdown
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleNotiClose}
        notifications={data}
        isLoading={isLoading}
      />
    </Box>
  );
}
