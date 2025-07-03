import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  useTheme,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { useRef, useState } from "react";

import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../ThemedApp";
import { postLogin } from "../libs/fetcher";
import { useMutation } from "@tanstack/react-query";

export default function Login() {
  const usernameInput = useRef();
  const passwordInput = useRef();
  const theme = useTheme();

  const [error, setError] = useState(null);

  const handleSubmit = () => {
    const username = usernameInput.current.value;
    const password = passwordInput.current.value;

    if (!username || !password) {
      setError("username and password required");
      return false;
    }

    login.mutate({ username, password });
  };

  const login = useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await postLogin(username, password);
      return response.json();
    },
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: (result) => {
      setAuth(result.user);
      localStorage.setItem("token", result.token);
      navigate("/");
    },
  });

  const navigate = useNavigate();
  const { setAuth } = useApp();

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 100px)",
        alignItems: "center",
        justifyContent: "center", // Account for header
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
            Welcome Back
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
              inputRef={usernameInput}
              label="Username"
              placeholder="Enter your username"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              inputRef={passwordInput}
              label="Password"
              placeholder="Enter your password"
              type="password"
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
              startIcon={<LoginIcon />}
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
              Sign In
            </Button>
            <Typography
              variant="body2"
              sx={{ textAlign: "center", mt: 2, color: "text.secondary" }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
