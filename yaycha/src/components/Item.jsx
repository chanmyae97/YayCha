import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CardMedia,
} from "@mui/material";

import {
  Alarm as TimeIcon,
  AccountCircle as UserIcon,
  Delete as DeleteIIcon,
} from "@mui/icons-material";

import { green } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { useApp } from "../ThemedApp";

import { formatRelative, isValid } from "date-fns";

export default function Item({ item, remove, primary, comment }) {
  const navigate = useNavigate();
  const { auth } = useApp();

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return isValid(date) ? formatRelative(date, new Date()) : "Invalid date";
  };

  return (
    <Card sx={{ mb: 2 }}>
      {primary && <Box sx={{ height: 50, bgcolor: green[500] }} />}
      <CardContent
        onClick={() => {
          if (comment) return false;
          navigate(`/comments/${item.id}`);
        }}
        sx={{ cursor: comment ? "default" : "pointer" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TimeIcon fontSize="10" color="success" />
            <Typography variant="caption" sx={{ color: green[500] }}>
              {formatDate(item.created)}
            </Typography>
          </Box>
          {auth && auth.id === item.user?.id && (
            <IconButton
              sx={{ color: "text.fade" }}
              size="small"
              onClick={(e) => {
                remove(item.id);
                e.stopPropagation();
              }}
            >
              <DeleteIIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>

        <Typography sx={{ my: 3 }}>{item.content}</Typography>
        <Box
          onClick={(e) => {
            if (item.user?.id) {
              navigate(`/profile/${item.user.id}`);
              e.stopPropagation();
            }
          }}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            cursor: item.user?.id ? "pointer" : "default",
          }}
        >
          <UserIcon fontSize="12" color="info" />
          <Typography variant="caption">
            {item.user?.name || "Unknown User"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
