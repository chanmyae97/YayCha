import { useRef, useContext } from "react";

import { Box, TextField, Button } from "@mui/material";
import { AppContext } from "../ThemedApp";

export default function Form({ add }) {
  const contenRef = useRef();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const content = contentRef.current.value;
        const name = nameRef.current.value;

        if (!content.trim() || !name.trim()) {
          return;
        }

        add(content, "Alice");
        e.currentTarget.reset();
      }}
    >
      <Box sx={{ mb: 4, textAlign: "right" }}>
        <TextField
          inputRef={contenRef}
          type="text"
          placeholder="Content"
          fullWidth
          multiline
          sx={{ mb: 1 }}
        />
        <Button variant="contained" type="submit">
          Post
        </Button>
      </Box>
    </form>
  );
}
