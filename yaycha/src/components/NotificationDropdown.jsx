import {
  Box,
  Typography,
  IconButton,
  Paper,
  Fade,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Tooltip,
  Popover,
  useTheme,
} from "@mui/material";

import {
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  DoneAll as DoneAllIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { formatRelative } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { pullAllNotisRead, putNotiRead } from "../libs/fetcher";
import { queryClient } from "../ThemedApp";

export default function NotificationDropdown({
  open,
  anchorEl,
  onClose,
  notifications = [],
  isLoading,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  const readAllNotis = useMutation({
    mutationFn: pullAllNotisRead,
    onMutate: async () => {
      await queryClient.cancelQueries(["notis"]);
      await queryClient.setQueriesData(["notis"], (old) => {
        return old.map((noti) => {
          noti.read = true;
          return noti;
        });
      });
    },
  });

  const readNoti = useMutation({
    mutationFn: putNotiRead,
  });

  const unreadCount = notifications.filter((noti) => !noti.read).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          mt: 1,
          width: 360,
          maxHeight: "calc(100vh - 100px)",
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          background:
            theme.palette.mode === "light"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <NotificationsActiveIcon
              color={unreadCount > 0 ? "primary" : "disabled"}
              sx={{ mr: 1 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background:
                  unreadCount > 0
                    ? theme.palette.mode === "light"
                      ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                      : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)"
                    : "none",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:
                  unreadCount > 0 ? "transparent" : "inherit",
              }}
            >
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={() => readAllNotis.mutate()}
                sx={{
                  "&:hover": {
                    background:
                      theme.palette.mode === "light"
                        ? "rgba(33, 150, 243, 0.1)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                }}
              >
                <DoneAllIcon color="primary" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          {isLoading ? (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Typography color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {notifications.map((noti) => (
                <Fade in key={noti.id}>
                  <Card
                    sx={{
                      mb: 2,
                      opacity: noti.read ? 0.7 : 1,
                      transition: "all 0.2s ease-in-out",
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": {
                        opacity: 1,
                        transform: "translateY(-1px)",
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => {
                        readNoti.mutate(noti.id);
                        onClose();
                        navigate(`/comments/${noti.postId}`);
                      }}
                    >
                      <CardContent
                        sx={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <Box
                          sx={{
                            mr: 2,
                            p: 1,
                            borderRadius: 2,
                            background:
                              theme.palette.mode === "light"
                                ? "rgba(0, 0, 0, 0.04)"
                                : "rgba(255, 255, 255, 0.04)",
                          }}
                        >
                          {noti.type === "comment" ? (
                            <CommentIcon color="success" />
                          ) : (
                            <FavoriteIcon color="error" />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Avatar
                              src={noti.user.profilePicture}
                              sx={{
                                width: 24,
                                height: 24,
                                mr: 1,
                                border: `2px solid ${theme.palette.background.paper}`,
                              }}
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {noti.user.name}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {noti.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.primary.main,
                              opacity: 0.8,
                            }}
                          >
                            {formatRelative(new Date(noti.created), new Date())}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Fade>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Popover>
  );
}
