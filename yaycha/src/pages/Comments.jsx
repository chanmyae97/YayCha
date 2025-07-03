import {
  Box,
  Button,
  TextField,
  Alert,
  Container,
  Typography,
  useTheme,
  Paper,
  Divider,
  Fade,
} from "@mui/material";
import { Comment as CommentIcon, Send as SendIcon } from "@mui/icons-material";
import { useRef } from "react";

import Item from "../components/Item";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import { useApp } from "../ThemedApp";
import {
  postComment,
  deleteComment,
  deletePost,
  fetchComments,
} from "../libs/fetcher";

const api = import.meta.env.VITE_API;

export default function Comments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentInput = useRef();
  const { setGlobalMsg, auth } = useApp();
  const theme = useTheme();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      return fetchComments(id);
    },
  });

  const addComment = useMutation({
    mutationFn: async (content) => {
      const comment = await postComment(content, id);
      return comment;
    },
    onSuccess: async (comment) => {
      queryClient.cancelQueries({ queryKey: ["comments", id] });

      queryClient.setQueryData(["comments", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: [comment, ...(old.comments || [])],
        };
      });

      queryClient.setQueryData(["posts", true], (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === Number(id)) {
            return {
              ...post,
              comments: [...(post.comments || []), comment],
              _count: {
                ...post._count,
                comments: (post._count?.comments || 0) + 1,
              },
            };
          }
          return post;
        });
      });

      queryClient.setQueryData(["posts", false], (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === Number(id)) {
            return {
              ...post,
              comments: [...(post.comments || []), comment],
              _count: {
                ...post._count,
                comments: (post._count?.comments || 0) + 1,
              },
            };
          }
          return post;
        });
      });

      if (data?.user?.id) {
        queryClient.setQueryData([`users/${data.user.id}`], (old) => {
          if (!old) return old;
          const posts = old.posts.map((post) => {
            if (post.id === Number(id)) {
              return {
                ...post,
                comments: [...(post.comments || []), comment],
                _count: {
                  ...post._count,
                  comments: (post._count?.comments || 0) + 1,
                },
              };
            }
            return post;
          });
          return { ...old, posts };
        });
      }

      setGlobalMsg("Comment added");
    },
  });

  const removePost = useMutation({
    mutationFn: async (id) => {
      return deletePost(id);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["posts"] });
      navigate("/");
      setGlobalMsg("A post deleted");
    },
  });

  const removeComment = useMutation({
    mutationFn: async (id) => {
      return deleteComment(id);
    },
    onSuccess: (_, commentId) => {
      queryClient.cancelQueries({ queryKey: ["comments", id] });

      queryClient.setQueryData(["comments", id], (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.filter((comment) => comment.id !== commentId),
        };
      });

      queryClient.setQueryData(["posts", true], (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === Number(id)) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== commentId
              ),
              _count: {
                ...post._count,
                comments: Math.max((post._count?.comments || 0) - 1, 0),
              },
            };
          }
          return post;
        });
      });

      queryClient.setQueryData(["posts", false], (old) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === Number(id)) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== commentId
              ),
              _count: {
                ...post._count,
                comments: Math.max((post._count?.comments || 0) - 1, 0),
              },
            };
          }
          return post;
        });
      });

      if (data?.user?.id) {
        queryClient.setQueryData([`users/${data.user.id}`], (old) => {
          if (!old) return old;
          const posts = old.posts.map((post) => {
            if (post.id === Number(id)) {
              return {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
                _count: {
                  ...post._count,
                  comments: Math.max((post._count?.comments || 0) - 1, 0),
                },
              };
            }
            return post;
          });
          return { ...old, posts };
        });
      }

      setGlobalMsg("Comment deleted");
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
          <CommentIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          <Typography>Loading comments...</Typography>
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            color: "text.secondary",
          }}
        >
          <CommentIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
          <Typography>Post not found</Typography>
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
            mb: 3,
          }}
        >
          <Item
            primary
            key={data.id}
            item={{
              id: data.id,
              postId: data.id,
              content: data.content,
              created: data.created,
              user: data.user,
              likes: data.likes || [],
              comments: data.comments || [],
            }}
            remove={removePost.mutate}
          />
        </Paper>

        {auth && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              background:
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(0, 0, 0, 0.2)",
              backdropFilter: "blur(8px)",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const content = contentInput.current.value;
                if (!content) return;
                addComment.mutate(content);
                e.currentTarget.reset();
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  inputRef={contentInput}
                  multiline
                  rows={2}
                  placeholder="Write a comment..."
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === "light"
                          ? "rgba(0, 0, 0, 0.04)"
                          : "rgba(255, 255, 255, 0.05)",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: "flex-end",
                  }}
                >
                  Comment
                </Button>
              </Box>
            </form>
          </Paper>
        )}

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
          {data.comments && data.comments.length > 0 ? (
            data.comments.map((comment, index) => (
              <Fade in key={comment.id}>
                <Box>
                  <Item
                    item={{
                      ...comment,
                      likes: comment.likes || [],
                      comments: comment.comments || [],
                    }}
                    remove={removeComment.mutate}
                    comment
                  />
                  {index < data.comments.length - 1 && <Divider />}
                </Box>
              </Fade>
            ))
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <CommentIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
              <Typography>No comments yet. Be the first to comment!</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
