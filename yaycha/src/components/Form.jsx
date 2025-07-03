import { useRef, useState } from "react";
import { Box, TextField, Button, Alert, Paper, useTheme } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { AppContext } from "../ThemedApp";

export default function Form({ add }) {
  const contentRef = useRef();
  const [error, setError] = useState(null);
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = contentRef.current.value.trim();
    setError(null);
    add.mutate(content);
    e.currentTarget.reset();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 2,
        background:
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ width: "100%" }}>
          {error && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  color: theme.palette.warning.main,
                },
              }}
            >
              {error}
            </Alert>
          )}
          <TextField
            inputRef={contentRef}
            placeholder="What's on your mind?"
            fullWidth
            multiline
            rows={3}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.01)"
                      : "rgba(255, 255, 255, 0.01)",
                },
                "&.Mui-focused": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.02)"
                      : "rgba(255, 255, 255, 0.02)",
                },
              },
            }}
            error={!!error}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              type="submit"
              endIcon={<SendIcon />}
              sx={{
                borderRadius: 6,
                px: 3,
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                    : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0 3px 5px 2px rgba(33, 203, 243, .3)"
                    : "0 3px 5px 2px rgba(83, 109, 254, .3)",
                color: "white",
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
              Post
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
}
