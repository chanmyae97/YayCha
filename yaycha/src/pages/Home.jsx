import { useState } from "react";

import { Alert, Box, Button, Typography } from "@mui/material";

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
      await queryClient.setQueriesData(["posts", showLastest], (old) => {
        old.filter((item) => item.id !== id);
      });
      setGlobalMsg("A post deleted");
    },
  });

  const add = useMutation({
    mutationFn: async (content) => {
      const post = await postPost(content);
      return post;
    },
    onSuccess: async (post) => {
      queryClient.cancelQueries({ queryKey: ["posts", showLastest] });
      queryClient.setQueryData(["posts"], (old) => [post, ...old]);
      setGlobalMsg("A post added");
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
  return (
    <Box>
      {showForm && auth && <Form add={add} />}
      {auth && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Button disabled={showLastest} onClick={() => setShowLatest(true)}>
            Latest
          </Button>
          <Typography sx={{ color: "text.fade", fontSize: 15 }}>|</Typography>
          <Button disabled={!showLastest} onClick={() => setShowLatest(false)}>
            Following
          </Button>
        </Box>
      )}
      {data.map((item) => {
        return <Item key={item.id} item={item} remove={remove.mutate} />;
      })}
    </Box>
  );
}
