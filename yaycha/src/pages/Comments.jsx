import { Box, Button, TextField, Alert } from "@mui/material";
import { useRef } from "react";

import Item from "../components/Item";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import { useApp } from "../ThemedApp";
import { postComment } from "../libs/fetcher";

const api = import.meta.env.VITE_API;

export default function Comments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contentInput = useRef();
  const { setGlobalMsg, auth } = useApp();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const res = await fetch(`${api}/content/posts/${id}`);
      return res.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async (content) => {
      const comment = await postComment(content, id);
      return comment;
    },
    onSuccess: async (comment) => {
      queryClient.cancelQueries({ queryKey: ["comments", id] });
      queryClient.setQueryData(["comments", id], (old) => ({
        ...old,
        comments: [comment, ...(old?.comments || [])],
      }));
      setGlobalMsg("Comment added");
    },
  });

  const removePost = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await fetch(`${api}/content/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
      setGlobalMsg("A post deleted");
    },
  });

  const removeComment = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await fetch(`${api}/content/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the comments
      queryClient.invalidateQueries(["comments", id]);
      setGlobalMsg("A comment deleted");
    },
    onError: (error) => {
      setGlobalMsg(error.message || "Failed to delete comment");
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
          content: data.content,
          created: data.created,
          user: data.user,
        }}
        remove={removePost.mutate}
      />
      {data.comments?.map((comment) => (
        <Item
          key={comment.id}
          item={comment}
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
