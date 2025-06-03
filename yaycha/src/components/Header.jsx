import { useApp } from "../ThemedApp";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
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
  const isHomePage = location.pathname === "/";

  const { isLoading, isError, data } = useQuery({
    queryKey: ["notis", auth],
    queryFn: fetchNotis,
    enabled: !!auth,
  });

  function notiCount() {
    if (!auth) return 0;
    if (isLoading || isError) return 0;

    return data.filter((noti) => !noti.read).length;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setShowDrawer(!showDrawer)}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          sx={{ flexGrow: 1, ml: 2 }}
          style={{ userSelect: "none", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Yaycha
        </Typography>

        <Box>
          {isHomePage && (
            <IconButton color="inherit" onClick={() => setShowForm(!showForm)}>
              <AddIcon />
            </IconButton>
          )}

          <IconButton color="inherit" onClick={() => navigate("/search")}>
            <SearchIcon />
          </IconButton>

          {auth && (
            <IconButton
              color="inherit"
              onClick={() => {
                navigate("/notis");
              }}
            >
              <Badge color="error" badgeContent={notiCount()}>
                <NotiIcon />
              </Badge>
            </IconButton>
          )}

          {mode === "dark" ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setMode("light")}
            >
              <LightModeIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setMode("dark")}
            >
              <DarkModeIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
