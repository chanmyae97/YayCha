import { IconButton, ButtonGroup, Button } from "@mui/material";
import { ChatBubbleOutline as CommentIcon } from "@mui/icons-material";

export default function CommentButton({ item, comment }) {
  // Add null check and default value for comments count
  const commentsCount = item?.comments?.length || 0;

  return (
    <>
      {!comment && (
        <ButtonGroup sx={{ ml: 3 }}>
          <IconButton size="small">
            <CommentIcon fontSize="small" color="info" />
          </IconButton>
          <Button sx={{ color: "text-fade" }} variant="text" size="small">
            {commentsCount}
          </Button>
        </ButtonGroup>
      )}
    </>
  );
}
