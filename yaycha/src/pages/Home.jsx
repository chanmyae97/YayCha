import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Typography,
  Container,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Fade,
} from "@mui/material";

import {
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import Form from "../components/Form";
import Item from "../components/Item";

import { useApp, queryClient } from "../ThemedApp";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postPost,
  deletePost,
  fetchPosts,
  fetchFollowingPosts,
} from "../libs/fetcher";

const api = import.meta.env.VITE_API;

export default function Home() {
  const [showLastest, setShowLatest] = useState(true);
  const { showForm, setShowForm, setGlobalMsg, auth } = useApp();
  const theme = useTheme();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["posts", showLastest],
    queryFn: () => {
      if (showLastest) {
        return fetchPosts();
      } else {
        return fetchFollowingPosts();
      }
    },
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      return await deletePost(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts", true], (old) =>
        old ? old.filter((item) => item.id !== id) : []
      );
      queryClient.setQueryData(["posts", false], (old) =>
        old ? old.filter((item) => item.id !== id) : []
      );

      setGlobalMsg("A post deleted");
    },
  });

  const add = useMutation({
    mutationFn: async (content) => {
      const post = await postPost(content);
      return post;
    },
    onSuccess: async (post) => {
      if (!post) return;

      await queryClient.cancelQueries({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts", true], (old) => [
        post,
        ...(old || []),
      ]);
      queryClient.setQueryData(["posts", false], (old) => {
        if (auth && post.userId === auth.id) {
          return [post, ...(old || [])];
        }
        return old;
      });

      setGlobalMsg("A post added");
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
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 3 }}>
        {showForm && auth && (
          <Fade in>
            <Box sx={{ mb: 3 }}>
              <Form add={add} />
            </Box>
          </Fade>
        )}

        {auth && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 1,
              display: "flex",
              justifyContent: "center",
              background:
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <ToggleButtonGroup
              value={showLastest}
              exclusive
              onChange={(e, value) => value !== null && setShowLatest(value)}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: "16px !important",
                  px: 3,
                  minWidth: 120,
                  justifyContent: "center",
                  "&.Mui-selected": {
                    background:
                      theme.palette.mode === "light"
                        ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                        : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
                    color: "white",
                    "&:hover": {
                      background:
                        theme.palette.mode === "light"
                          ? "linear-gradient(45deg, #1976D2 30%, #0FBFE3 90%)"
                          : "linear-gradient(45deg, #303f9f 30%, #3f51b5 90%)",
                    },
                  },
                },
              }}
            >
              <ToggleButton
                value={true}
                sx={{
                  gap: 1,
                  textTransform: "none",
                }}
              >
                <AccessTimeIcon fontSize="small" />
                Latest
              </ToggleButton>
              <ToggleButton
                value={false}
                sx={{
                  gap: 1,
                  textTransform: "none",
                }}
              >
                <PeopleIcon fontSize="small" />
                Following
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {data.map((item) => (
            <Fade in key={item.id}>
              <Box>
                <Item item={item} remove={remove.mutate} />
              </Box>
            </Fade>
          ))}

          {data.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                background:
                  theme.palette.mode === "light"
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">
                {showLastest
                  ? "No posts yet. Be the first to post something!"
                  : "No posts from people you follow. Start following some people!"}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
}
