import { useState } from "react";

import { Alert, Box, Button, Typography } from "@mui/material";

import Form from "../components/Form";
import Item from "../components/Item";

import { useApp, queryClient } from "../ThemedApp";
import { useQuery, useMutation } from "@tanstack/react-query";
import { postPost } from "../libs/fetcher";

const api = import.meta.env.VITE_API;

export default function Home() {
  const { showForm, setShowForm, setGlobalMsg, auth } = useApp();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch(`${api}/content/posts`);
      return res.json();
    },
  });

  const remove = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await fetch(`${api}/content/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setGlobalMsg("A post deleted");
    },
  });

  const add = useMutation({
    mutationFn: async (content) => {
      const post = await postPost(content);
      return post;
    },
    onSuccess: async (post) => {
      queryClient.cancelQueries({ queryKey: ["posts"] });
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
      {data.map((item) => {
        return <Item key={item.id} item={item} remove={remove.mutate} />;
      })}
    </Box>
  );
}
