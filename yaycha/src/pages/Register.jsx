import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Container,
  useTheme,
} from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postUser } from "../libs/fetcher";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../ThemedApp";

export default function Register() {
  const { setGlobalMsg } = useApp();
  const theme = useTheme();

  const nameInput = useRef();
  const usernameInput = useRef();
  const bioInput = useRef();
  const passwordInput = useRef();

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const name = nameInput.current.value;
    const username = usernameInput.current.value;
    const bio = bioInput.current.value;
    const password = passwordInput.current.value;

    if (!name || !username || !password) {
      setError("name, username and password required");
      return false;
    }

    create.mutate({ name, username, bio, password });
  };

  const create = useMutation({
    mutationFn: async (data) => {
      const response = await postUser(data);
      return response.json();
    },
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: () => {
      setGlobalMsg("Account Created");
      navigate("/login");
    },
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 100px)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: 4,
          background:
            theme.palette.mode === "light"
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                  : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create Account
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                color: theme.palette.warning.main,
              },
            }}
          >
            {error}
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              inputRef={nameInput}
              label="Name"
              placeholder="Enter your full name"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              inputRef={usernameInput}
              label="Username"
              placeholder="Choose a unique username"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              inputRef={bioInput}
              label="Bio"
              placeholder="Tell us about yourself"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              inputRef={passwordInput}
              type="password"
              label="Password"
              placeholder="Create a strong password"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 6,
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                    : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0 3px 5px 2px rgba(33, 203, 243, .3)"
                    : "0 3px 5px 2px rgba(83, 109, 254, .3)",
                "&:hover": {
                  background:
                    theme.palette.mode === "light"
                      ? "linear-gradient(45deg, #1976D2 30%, #0FBFE3 90%)"
                      : "linear-gradient(45deg, #303f9f 30%, #3f51b5 90%)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              Create Account
            </Button>
            <Typography
              variant="body2"
              sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
