import {
  Box,
  Alert,
  Container,
  Typography,
  useTheme,
  Paper,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchPostLikes, fetchCommentLikes } from "../libs/fetcher";
import UserList from "../components/UserList";

export default function Likes() {
  const { id, type } = useParams();
  const theme = useTheme();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["users", id, type],
    queryFn: () => {
      if (type == "comment") {
        return fetchCommentLikes(id);
      } else {
        return fetchPostLikes(id);
      }
    },
  });

  if (isError) {
    return (
      <Container maxWidth="sm">
        <Alert
          severity="warning"
          sx={{
            mt: 3,
            borderRadius: 2,
            "& .MuiAlert-icon": {
              color: theme.palette.warning.main,
            },
          }}
        >
          {error.message}
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            color: "text.secondary",
          }}
        >
          {type === "comment" ? (
            <CommentIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          ) : (
            <FavoriteIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          )}
          <Typography>Loading likes...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            background:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <UserList
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: theme.palette.primary.main,
                }}
              >
                {type === "comment" ? (
                  <CommentIcon fontSize="small" />
                ) : (
                  <FavoriteIcon fontSize="small" />
                )}
                <Typography variant="h6" component="span">
                  Likes
                </Typography>
              </Box>
            }
            data={data}
          />
        </Paper>
      </Box>
    </Container>
  );
}
