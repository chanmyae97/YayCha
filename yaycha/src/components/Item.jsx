import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CardMedia,
  Avatar,
  useTheme,
} from "@mui/material";

import {
  AccessTime as TimeIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useApp } from "../ThemedApp";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";

import { formatRelative, isValid } from "date-fns";

export default function Item({ item, remove, primary, comment }) {
  const navigate = useNavigate();
  const { auth } = useApp();
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return isValid(date) ? formatRelative(date, new Date()) : "Invalid date";
  };

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        background:
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: comment ? "none" : "translateY(-2px)",
          boxShadow: comment ? "none" : theme.shadows[4],
        },
      }}
    >
      {primary && (
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      )}

      <CardContent
        onClick={() => {
          if (comment) return false;
          navigate(`/comments/${item.id}`);
        }}
        sx={{
          cursor: comment ? "default" : "pointer",
          "&:last-child": { pb: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            onClick={(e) => {
              if (item.user?.id) {
                navigate(`/profile/${item.user.id}`);
                e.stopPropagation();
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: item.user?.id ? "pointer" : "default",
              "&:hover": {
                "& .username": {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {item.user?.name ? item.user.name[0].toUpperCase() : "?"}
            </Avatar>
            <Box>
              <Typography
                className="username"
                sx={{
                  fontWeight: 500,
                  transition: "color 0.2s ease-in-out",
                }}
              >
                {item.user?.name || "Unknown User"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <TimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {formatDate(item.created)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {auth && auth.id === item.user?.id && (
            <IconButton
              size="small"
              onClick={(e) => {
                remove(item.id);
                e.stopPropagation();
              }}
              sx={{
                color: theme.palette.error.main,
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: theme.palette.error.main + "14",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography
          sx={{
            mb: 2,
            px: 1,
            lineHeight: 1.6,
            color: theme.palette.text.primary,
          }}
        >
          {item.content}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <LikeButton item={item} comment={comment} />
          <CommentButton item={item} comment={comment} />
        </Box>
      </CardContent>
    </Card>
  );
}
