import { Box, Button, TextField, Alert } from "@mui/material";
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
      <Box>
        <Alert severity="warning">{error.message}</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <Box sx={{ textAlign: "center" }}>Loading...</Box>;
  }

  if (!data) {
    return <Box sx={{ textAlign: "center" }}>Post not found</Box>;
  }

  return (
    <Box>
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
      {data.comments?.map((comment) => (
        <Item
          key={comment.id}
          item={{
            ...comment,
            likes: comment.likes || [],
            comments: comment.comments || [],
          }}
          remove={removeComment.mutate}
          comment
        />
      ))}

      {auth && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const content = contentInput.current.value;
            if (!content) return;
            addComment.mutate(content);
            e.currentTarget.reset();
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
            <TextField
              inputRef={contentInput}
              multiline
              placeholder="Your Comment"
            />
            <Button type="submit" variant="contained">
              Reply
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
}
