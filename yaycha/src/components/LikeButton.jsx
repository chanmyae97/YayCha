import { IconButton, ButtonGroup, Button } from "@mui/material";

import {
  Favorite as LikedIcon,
  FavoriteBorder as LikeIcon,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useApp, queryClient } from "../ThemedApp";
import { useMutation } from "@tanstack/react-query";

import {
  postPostLike,
  deletePostLike,
  postCommentLike,
  deleteCommentLike,
} from "../libs/fetcher";

export default function LikeButton({ item, comment }) {
  const navigate = useNavigate();
  const { auth } = useApp();

  function isLiked() {
    if (!auth) return false;
    if (!item.likes) return false;

    return item.likes.find((like) => like.userId == auth.id);
  }

  const updateCache = (itemId, isLike) => {
    // Update posts cache (both latest and following feeds)
    queryClient.setQueryData(["posts", true], (old) => {
      if (!old) return old;
      return old.map((post) => {
        if (post.id === itemId) {
          const likes = isLike
            ? [...(post.likes || []), { userId: auth.id }]
            : (post.likes || []).filter((like) => like.userId !== auth.id);
          return { ...post, likes };
        }
        // Update likes in comments
        if (post.comments) {
          const comments = post.comments.map((comment) => {
            if (comment.id === itemId) {
              const likes = isLike
                ? [...(comment.likes || []), { userId: auth.id }]
                : (comment.likes || []).filter(
                    (like) => like.userId !== auth.id
                  );
              return { ...comment, likes };
            }
            return comment;
          });
          return { ...post, comments };
        }
        return post;
      });
    });

    queryClient.setQueryData(["posts", false], (old) => {
      if (!old) return old;
      return old.map((post) => {
        if (post.id === itemId) {
          const likes = isLike
            ? [...(post.likes || []), { userId: auth.id }]
            : (post.likes || []).filter((like) => like.userId !== auth.id);
          return { ...post, likes };
        }
        // Update likes in comments
        if (post.comments) {
          const comments = post.comments.map((comment) => {
            if (comment.id === itemId) {
              const likes = isLike
                ? [...(comment.likes || []), { userId: auth.id }]
                : (comment.likes || []).filter(
                    (like) => like.userId !== auth.id
                  );
              return { ...comment, likes };
            }
            return comment;
          });
          return { ...post, comments };
        }
        return post;
      });
    });

    // Update comments cache for both post and comments
    if (item.postId) {
      queryClient.setQueryData(["comments", item.postId], (old) => {
        if (!old) return old;
        // If this is a post like, update the post's likes
        if (itemId === item.postId) {
          const likes = isLike
            ? [...(old.likes || []), { userId: auth.id }]
            : (old.likes || []).filter((like) => like.userId !== auth.id);
          return { ...old, likes };
        }
        // If this is a comment like, update the comment's likes
        const comments = old.comments.map((c) => {
          if (c.id === itemId) {
            const likes = isLike
              ? [...(c.likes || []), { userId: auth.id }]
              : (c.likes || []).filter((like) => like.userId !== auth.id);
            return { ...c, likes };
          }
          return c;
        });
        return { ...old, comments };
      });
    }

    // Update user profile cache
    queryClient.setQueryData([`users/${item.user?.id}`], (old) => {
      if (!old) return old;
      const posts = old.posts.map((post) => {
        if (post.id === itemId) {
          const likes = isLike
            ? [...(post.likes || []), { userId: auth.id }]
            : (post.likes || []).filter((like) => like.userId !== auth.id);
          return { ...post, likes };
        }
        // Update likes in comments
        if (post.comments) {
          const comments = post.comments.map((comment) => {
            if (comment.id === itemId) {
              const likes = isLike
                ? [...(comment.likes || []), { userId: auth.id }]
                : (comment.likes || []).filter(
                    (like) => like.userId !== auth.id
                  );
              return { ...comment, likes };
            }
            return comment;
          });
          return { ...post, comments };
        }
        return post;
      });
      return { ...old, posts };
    });
  };

  const likePost = useMutation({
    mutationFn: (id) => postPostLike(id),
    onMutate: (id) => {
      // Update cache optimistically
      updateCache(id, true);
      return { id };
    },
    onSuccess: (data, id) => {
      // Invalidate both posts and comments queries to ensure we have the latest data
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["comments", item.postId]);
    },
    onError: (error, id) => {
      console.error("Error liking post:", error);
      // Revert optimistic update on error
      updateCache(id, false);
    },
  });

  const likeComment = useMutation({
    mutationFn: (id) => postCommentLike(id),
    onMutate: (id) => {
      // Update cache optimistically
      updateCache(id, true);
      return { id };
    },
    onSuccess: (data, id) => {
      // Invalidate the comments query to ensure we have the latest data
      queryClient.invalidateQueries(["comments", item.postId]);
    },
    onError: (error, id) => {
      console.error("Error liking comment:", error);
      // Revert optimistic update on error
      updateCache(id, false);
    },
  });

  const unlikePost = useMutation({
    mutationFn: (id) => deletePostLike(id),
    onMutate: (id) => {
      // Update cache optimistically
      updateCache(id, false);
      return { id };
    },
    onSuccess: (data, id) => {
      // Invalidate both posts and comments queries to ensure we have the latest data
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["comments", item.postId]);
    },
    onError: (error, id) => {
      console.error("Error unliking post:", error);
      // Revert optimistic update on error
      updateCache(id, true);
    },
  });

  const unlikeComment = useMutation({
    mutationFn: (id) => deleteCommentLike(id),
    onMutate: (id) => {
      updateCache(id, false);
    },
    onSuccess: (data, id) => {
      // Invalidate the comments query to ensure we have the latest data
      queryClient.invalidateQueries(["comments", item.postId]);
    },
    onError: (error, id) => {
      console.error("Error unliking comment:", error);
      updateCache(id, true);
    },
  });

  return (
    <ButtonGroup>
      {isLiked() ? (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (comment) {
              unlikeComment.mutate(item.id);
            } else {
              unlikePost.mutate(item.id);
            }
          }}
        >
          <LikedIcon fontSize="small" color="error" />
        </IconButton>
      ) : (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (comment) {
              likeComment.mutate(item.id);
            } else {
              likePost.mutate(item.id);
            }
          }}
        >
          <LikeIcon fontSize="small" color="error" />
        </IconButton>
      )}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          if (comment) {
            navigate(`/likes/${item.id}/comment`);
          } else {
            navigate(`/likes/${item.id}/post`);
          }
          e.stopPropagation();
        }}
        sx={{ color: "text.fade" }}
        variant="text"
        size="small"
      >
        {item.likes?.length || 0}
      </Button>
    </ButtonGroup>
  );
}
