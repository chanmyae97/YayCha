import {
  Alert,
  Avatar,
  Box,
  Typography,
  Container,
  Paper,
  useTheme,
  Tooltip,
} from "@mui/material";

import { useParams } from "react-router-dom";
import { fetchUser } from "../libs/fetcher";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../ThemedApp";
import Item from "../components/Item";
import Form from "../components/Form";
import { postPost } from "../libs/fetcher";
import { useApp } from "../ThemedApp";
import FollowButton from "../components/FollowButton";
import { useState, useEffect } from "react";

const api = import.meta.env.VITE_API;

export default function Profile() {
  const { id } = useParams();
  const { setGlobalMsg, auth } = useApp();
  const theme = useTheme();
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: [`users/${id}`],
    queryFn: async () => await fetchUser(id),
  });

  const uploadProfilePicture = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`${api}/users/${id}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`users/${id}`]);
      setGlobalMsg("Profile picture updated successfully");
      setSelectedProfileFile(null);
    },
    onError: (error) => {
      setGlobalMsg("Failed to update profile picture: " + error.message);
    },
  });

  const uploadCoverPhoto = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`${api}/users/${id}/upload-cover`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload cover photo");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`users/${id}`]);
      setGlobalMsg("Cover photo updated successfully");
      setSelectedCoverFile(null);
    },
    onError: (error) => {
      setGlobalMsg("Failed to update cover photo: " + error.message);
    },
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

  // Reset previews when user data changes
  useEffect(() => {
    if (data) {
      setProfilePreview(null);
      setCoverPreview(null);
      setSelectedProfileFile(null);
      setSelectedCoverFile(null);
    }
  }, [data]);

  // Handle preview URLs creation
  useEffect(() => {
    if (selectedProfileFile) {
      const previewUrl = URL.createObjectURL(selectedProfileFile);
      setProfilePreview(previewUrl);
      // Automatically upload when file is selected
      uploadProfilePicture.mutate(selectedProfileFile);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [selectedProfileFile]);

  useEffect(() => {
    if (selectedCoverFile) {
      const previewUrl = URL.createObjectURL(selectedCoverFile);
      setCoverPreview(previewUrl);
      // Automatically upload when file is selected
      uploadCoverPhoto.mutate(selectedCoverFile);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [selectedCoverFile]);

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

  // Helper function to get the correct image URL
  const getImageUrl = (imageField) => {
    if (!imageField) return null;
    // Check if it's an external URL (starts with http/https)
    if (imageField.startsWith("http")) {
      return imageField;
    }
    // Otherwise, it's a local file
    return `${api}/uploads/${imageField}`;
  };

  const profilePictureUrl = getImageUrl(data.profilePicture);
  const coverPhotoUrl = getImageUrl(data.coverPhoto);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfileFile(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedCoverFile(file);
    }
  };

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
        <Box sx={{ position: "relative" }}>
          <input
            accept="image/*"
            type="file"
            id="cover-photo-input"
            onChange={handleCoverPhotoChange}
            style={{ display: "none" }}
          />
          <label
            htmlFor={
              auth && auth.id === Number(id) ? "cover-photo-input" : undefined
            }
          >
            <Box
              sx={{
                height: 200,
                width: "100%",
                backgroundImage: coverPreview
                  ? `url(${coverPreview})`
                  : coverPhotoUrl
                  ? `url(${coverPhotoUrl})`
                  : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                ...(auth &&
                  auth.id === Number(id) && {
                    cursor: "pointer",
                    transition: "filter 0.2s",
                    "&:hover": {
                      filter: "brightness(0.9)",
                    },
                    "&:hover::after": {
                      content: '"Click to change cover photo"',
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "white",
                      textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
                    },
                  }),
              }}
            />
          </label>
        </Box>
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
          <Box sx={{ position: "relative" }}>
            <input
              accept="image/*"
              type="file"
              id="profile-picture-input"
              onChange={handleProfilePictureChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor={
                auth && auth.id === Number(id)
                  ? "profile-picture-input"
                  : undefined
              }
            >
              <Tooltip
                title={
                  auth && auth.id === Number(id) ? "Change profile picture" : ""
                }
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: `4px solid ${theme.palette.background.paper}`,
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[3],
                    ...(auth &&
                      auth.id === Number(id) && {
                        cursor: "pointer",
                        transition: "transform 0.2s, filter 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          filter: "brightness(0.9)",
                        },
                      }),
                  }}
                  src={profilePreview || profilePictureUrl}
                />
              </Tooltip>
            </label>
          </Box>

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
