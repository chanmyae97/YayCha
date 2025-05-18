import { Box, Button, TextField, Alert } from "@mui/material";

import Item from "../components/Item";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import { useApp } from "../ThemedApp";

const api = import.meta.env.VITE_API;

export default function Comments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { setGlobalMsg } = useApp();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const res = await fetch(`${api}/content/posts/${id}`);
      return res.json();
    },
  });

  const removePost = useMutation({
    mutationFn: async (id) => {
      await fetch(`${api}/content/posts/${id}`, {
        method: "DELETE",
      });
      navigate("/");
      setGlobalMsg("A post deleted");
    },
  });

  const removeComment = useMutation({
    mutationFn: async (id) => {
      await fetch(`${api}/content/comments/${id}`, {
        method: "DELETE",
      });
    },
    onMutate: (id) => {
      queryClient.cancelQueries({ queryKey: ["comments"] });
      queryClient.setQueryData(["comments"], (old) => {
        if (!old || !old.comments) return old;
        return {
          ...old,
          comments: old.comments.filter((comment) => comment.id !== id),
        };
      });
      setGlobalMsg("A comment deleted");
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

  if (!data || !data.comments) {
    return <Box sx={{ textAlign: "center" }}>No comments found</Box>;
  }

  return (
    <Box>
      <Item
        primary
        key={1}
        item={{
          id: 1,
          content: "Initial post content from Alice",
          name: "Alice",
        }}
        remove={removePost.mutate}
      />
      {data.comments.map((comment) => (
        <Item
          key={comment.id}
          item={comment}
          remove={removeComment.mutate}
          comment
        />
      ))}

      <form>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}>
          <TextField multiline placeholder="Your Comment" />
          <Button type="submit" variant="contained">
            Reply
          </Button>
        </Box>
      </form>
    </Box>
  );
}
