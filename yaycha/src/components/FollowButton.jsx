import { Button, useTheme } from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";

import { useApp, queryClient } from "../ThemedApp";
import { postFollow, deleteFollow } from "../libs/fetcher";

export default function FollowButton({ user }) {
  const { auth } = useApp();
  const theme = useTheme();

  if (!auth) return <></>;

  function isFollowing() {
    return user.following.find((item) => item.followerId == auth.id);
  }

  const follow = useMutation({
    mutationFn: (id) => {
      return postFollow(id);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(["users"]);
      await queryClient.refetchQueries(["user"]);
      await queryClient.refetchQueries(["search"]);
    },
  });

  const unfollow = useMutation({
    mutationFn: (id) => {
      return deleteFollow(id);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries(["users"]);
      await queryClient.refetchQueries(["user"]);
      await queryClient.refetchQueries(["search"]);
    },
  });

  const following = isFollowing();

  return auth.id === user.id ? (
    <></>
  ) : (
    <Button
      size="small"
      edge="end"
      variant={following ? "outlined" : "contained"}
      startIcon={following ? <CheckIcon /> : <PersonAddIcon />}
      sx={{
        borderRadius: 6,
        px: 2,
        textTransform: "none",
        minWidth: 100,
        transition: "all 0.2s ease",
        ...(following
          ? {
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              "&:hover": {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                backgroundColor: theme.palette.error.main + "10",
              },
              "&:hover .MuiButton-startIcon": {
                transform: "scale(1.1)",
              },
            }
          : {
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                  : "linear-gradient(45deg, #3f51b5 30%, #536dfe 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .15)",
              color: "white",
              "&:hover": {
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #1976D2 30%, #0FBFE3 90%)"
                    : "linear-gradient(45deg, #303f9f 30%, #3f51b5 90%)",
                transform: "translateY(-1px)",
              },
            }),
        "& .MuiButton-startIcon": {
          transition: "transform 0.2s ease",
        },
      }}
      onClick={(e) => {
        if (following) {
          unfollow.mutate(user.id);
        } else {
          follow.mutate(user.id);
        }
        e.stopPropagation();
      }}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
