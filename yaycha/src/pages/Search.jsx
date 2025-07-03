import {
  Alert,
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Container,
  Paper,
  Typography,
  InputAdornment,
  useTheme,
  Fade,
} from "@mui/material";

import {
  Search as SearchIcon,
  PersonSearch as PersonSearchIcon,
} from "@mui/icons-material";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchSearch } from "../libs/fetcher";

import FollowButton from "../components/FollowButton";

import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const theme = useTheme();
  const navigate = useNavigate();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => {
      return fetchSearch(debouncedQuery);
    },
  });

  if (isError) {
    return (
      <Container maxWidth="sm">
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

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            background:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.8)"
                : "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "transparent",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "transparent",
                },
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.04)"
                    : "rgba(255, 255, 255, 0.05)",
              },
            }}
          />
        </Paper>

        {isLoading ? (
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              color: "text.secondary",
            }}
          >
            <PersonSearchIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
            <Typography>Searching...</Typography>
          </Box>
        ) : (
          <>
            {!query ? (
              <Box
                sx={{
                  textAlign: "center",
                  mt: 4,
                  color: "text.secondary",
                }}
              >
                <PersonSearchIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography>Start typing to search for users</Typography>
              </Box>
            ) : data?.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  mt: 4,
                  color: "text.secondary",
                }}
              >
                <PersonSearchIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography>No users found matching "{query}"</Typography>
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  background:
                    theme.palette.mode === "light"
                      ? "rgba(255, 255, 255, 0.8)"
                      : "rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <List sx={{ p: 0 }}>
                  {data.map((user, index) => (
                    <Fade in key={user.id}>
                      <ListItem
                        disablePadding
                        divider={index !== data.length - 1}
                      >
                        <ListItemButton
                          onClick={() => navigate(`/profile/${user.id}`)}
                          sx={{
                            py: 1.5,
                            "&:hover": {
                              backgroundColor:
                                theme.palette.mode === "light"
                                  ? "rgba(0, 0, 0, 0.04)"
                                  : "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                color: "white",
                              }}
                            >
                              {user.name[0].toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={user.bio || "No bio"}
                            primaryTypographyProps={{
                              fontWeight: 500,
                            }}
                            secondaryTypographyProps={{
                              sx: {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              },
                            }}
                          />
                          <ListItemSecondaryAction>
                            <FollowButton user={user} />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
