import { Alert, Avatar, Box, Typography } from "@mui/material";
import { pink } from "@mui/material/colors";

import { useParams } from "react-router-dom";
import { fetchUser } from "../libs/fetcher";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import Item from "../components/Item";
import Form from "../components/Form";
import { postPost } from "../libs/fetcher";
import { useApp } from "../ThemedApp";
import FollowButton from "../components/FollowButton";

const api = import.meta.env.VITE_API;

export default function Profile() {
  const { id } = useParams();
  const { setGlobalMsg, auth } = useApp();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: [`users/${id}`],
    queryFn: async () => await fetchUser(id),
  });

  const remove = useMutation({
    mutationFn: async (postId) => {
      const token = localStorage.getItem("token");
      await fetch(`${api}/content/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`users/${id}`]);
    },
  });

  const add = useMutation({
    mutationFn: async (content) => {
      const post = await postPost(content);
      return post;
    },
    onSuccess: async (post) => {
      queryClient.invalidateQueries([`users/${id}`]);
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

  if (!data) {
    return <Box sx={{ textAlign: "center" }}>User not found</Box>;
  }

  return (
    <Box>
      <Box sx={{ bgcolor: "banner", height: 150, borderRadius: 4 }}></Box>
      <Box
        sx={{
          mb: 4,
          marginTop: "-60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar sx={{ width: 100, height: 100, bgcolor: pink[500] }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography>{data.name}</Typography>
          <Typography sx={{ fontSize: "0.8em", color: "text.fade" }}>
            {data.bio}
          </Typography>
        </Box>
        {auth && auth.id !== Number(id) && (
          <Box sx={{ mt: 1 }}>
            <FollowButton user={data} />
          </Box>
        )}
      </Box>
      <Box>
        {auth && auth.id === Number(id) && <Form add={add} />}
        {data.posts
          ?.sort((a, b) => new Date(b.created) - new Date(a.created))
          .map((post) => (
            <Item
              key={post.id}
              item={{
                id: post.id,
                content: post.content,
                created: post.created,
                user: data,
                likes: post.likes || [],
                comments: post.comments || [],
              }}
              remove={remove.mutate}
            />
          ))}
      </Box>
    </Box>
  );
}
