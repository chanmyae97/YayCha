import {
  Alert,
  Avatar,
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();

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
      <Container maxWidth="md">
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
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            User not found
          </Typography>
        </Box>
      </Container>
    );
  }

  const profilePictureUrl = data.profilePicture || "";
  const coverPhotoUrl = data.coverPhoto || "";

  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 4,
          overflow: "hidden",
          background:
            theme.palette.mode === "light"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            height: 200,
            width: "100%",
            backgroundImage: coverPhotoUrl
              ? `url(${coverPhotoUrl})`
              : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Box
          sx={{
            p: 3,
            marginTop: "-60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              border: `4px solid ${theme.palette.background.paper}`,
              backgroundColor: theme.palette.primary.main,
              boxShadow: theme.shadows[3],
            }}
            src={profilePictureUrl}
          />

          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                    : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              {data.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 500,
                mx: "auto",
              }}
            >
              {data.bio}
            </Typography>
          </Box>

          {auth && auth.id !== Number(id) && (
            <Box sx={{ mt: 1 }}>
              <FollowButton user={data} />
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        {auth && auth.id === Number(id) && <Form add={add} />}
        <Box sx={{ mt: 2 }}>
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
    </Container>
  );
}
