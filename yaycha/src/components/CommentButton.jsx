import { IconButton, ButtonGroup, Button, useTheme } from "@mui/material";
import { ChatBubbleOutline as CommentIcon } from "@mui/icons-material";

export default function CommentButton({ item, comment }) {
  const theme = useTheme();
  // Add null check and default value for comments count
  const commentsCount = item?.comments?.length || 0;

  return (
    <>
      {!comment && (
        <ButtonGroup
          sx={{
            ml: 3,
            "& .MuiButtonGroup-grouped:not(:last-of-type)": {
              borderColor: "transparent",
            },
          }}
        >
          <IconButton
            size="small"
            sx={{
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: theme.palette.info.light + "20",
                transform: "scale(1.1)",
              },
            }}
          >
            <CommentIcon
              fontSize="small"
              sx={{
                color: theme.palette.info.main,
                transition: "transform 0.2s",
              }}
            />
          </IconButton>
          <Button
            sx={{
              color: theme.palette.text.secondary,
              minWidth: 40,
              px: 1,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            variant="text"
            size="small"
            disableRipple
          >
            {commentsCount}
          </Button>
        </ButtonGroup>
      )}
    </>
  );
}
